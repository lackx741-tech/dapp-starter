'use client';

import { useState, useCallback } from 'react';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import type { Hex } from 'viem';
import { buildBatchUserOp, type Call } from '@/lib/batchCall';
import { getUserOpHash, sendUserOp, type UserOperation } from '@/lib/userOp';

/**
 * Return type for the `useBatchCall` hook.
 */
export interface UseBatchCallReturn {
  /**
   * Builds, signs, and sends a batch of calls via BatchMulticall through an ERC-4337 UserOperation.
   *
   * @param calls      - array of `{ target, value, data }` calls
   * @param nonce      - the anti-replay nonce from EntryPoint.getNonce
   * @param bundlerUrl - bundler RPC URL (defaults to NEXT_PUBLIC_BUNDLER_URL)
   */
  executeBatch: (calls: Call[], nonce: bigint, bundlerUrl?: string) => Promise<void>;
  /** True while the transaction is in-flight */
  isLoading: boolean;
  /** The UserOperation hash returned by the bundler on success */
  userOpHash: Hex | null;
  /** Any error that occurred */
  error: Error | null;
}

/**
 * Hook that builds, signs, and sends a batch UserOperation via BatchMulticall.
 *
 * @returns `{ executeBatch, isLoading, userOpHash, error }`
 */
export function useBatchCall(): UseBatchCallReturn {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [userOpHash, setUserOpHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const executeBatch = useCallback(
    async (
      calls: Call[],
      nonce: bigint,
      bundlerUrl?: string,
    ) => {
      if (!address || !chainId) {
        setError(new Error('Wallet not connected'));
        return;
      }

      const url =
        bundlerUrl ??
        process.env.NEXT_PUBLIC_BUNDLER_URL ??
        '';

      if (!url) {
        setError(new Error('NEXT_PUBLIC_BUNDLER_URL is not set'));
        return;
      }

      setIsLoading(true);
      setError(null);
      setUserOpHash(null);

      try {
        // Build unsigned UserOperation
        const userOp = buildBatchUserOp(calls, address, nonce);

        // Compute the hash the smart account must sign
        const opHash = getUserOpHash(userOp, chainId);

        // Sign with the connected EOA
        const signature = await signMessageAsync({
          message: { raw: opHash },
        });

        // Attach the signature
        const signedOp: UserOperation = { ...userOp, signature };

        // Send to bundler
        const hash = await sendUserOp(signedOp, url);
        setUserOpHash(hash);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, signMessageAsync],
  );

  return { executeBatch, isLoading, userOpHash, error };
}
