'use client';

import { useState, useCallback } from 'react';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import type { Hex } from 'viem';
import {
  buildUserOp,
  getUserOpHash,
  sendUserOp as sendUserOpRpc,
  type BuildUserOpParams,
  type UserOperation,
} from '@/lib/userOp';

/**
 * Return type for the `useUserOp` hook.
 */
export interface UseUserOpReturn {
  /**
   * Builds, signs, and sends a UserOperation.
   *
   * @param params     - UserOp build parameters (sender, nonce, callData, etc.)
   * @param bundlerUrl - bundler RPC URL (defaults to NEXT_PUBLIC_BUNDLER_URL)
   */
  sendUserOp: (params: BuildUserOpParams, bundlerUrl?: string) => Promise<void>;
  /** True while the UserOp is being signed/sent */
  isLoading: boolean;
  /** The UserOperation hash returned by the bundler on success */
  userOpHash: Hex | null;
  /** Any error that occurred */
  error: Error | null;
}

/**
 * Hook that builds, signs (via the connected wallet), and sends a UserOperation
 * to an ERC-4337 bundler.
 *
 * @returns `{ sendUserOp, isLoading, userOpHash, error }`
 */
export function useUserOp(): UseUserOpReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [userOpHash, setUserOpHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sendUserOp = useCallback(
    async (params: BuildUserOpParams, bundlerUrl?: string) => {
      if (!address || !chainId) {
        setError(new Error('Wallet not connected'));
        return;
      }

      const url =
        bundlerUrl ?? process.env.NEXT_PUBLIC_BUNDLER_URL ?? '';

      if (!url) {
        setError(new Error('NEXT_PUBLIC_BUNDLER_URL is not set'));
        return;
      }

      setIsLoading(true);
      setError(null);
      setUserOpHash(null);

      try {
        // Build the unsigned UserOperation
        const userOp: UserOperation = buildUserOp(params);

        // Compute the hash that the smart account must sign
        const opHash = getUserOpHash(userOp, chainId);

        // Sign the hash with the connected EOA
        const signature = await signMessageAsync({
          message: { raw: opHash },
        });

        // Attach the signature
        const signedOp: UserOperation = { ...userOp, signature };

        // Send to bundler
        const hash = await sendUserOpRpc(signedOp, url);
        setUserOpHash(hash);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, signMessageAsync],
  );

  return { sendUserOp, isLoading, userOpHash, error };
}
