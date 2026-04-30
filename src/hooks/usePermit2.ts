'use client';

import { useState, useCallback } from 'react';
import { useAccount, useChainId, useSignTypedData } from 'wagmi';
import type { Address, Hex } from 'viem';
import { buildPermit2Transfer, buildERC2612Permit } from '@/lib/permit2';

/**
 * Return type for the `usePermit2` hook.
 */
export interface UsePermit2Return {
  /**
   * Signs a Permit2 `PermitTransferFrom` typed message.
   *
   * @param token    - ERC-20 token address
   * @param amount   - amount to approve
   * @param spender  - who is allowed to pull the tokens
   * @param deadline - Unix timestamp (seconds) expiry
   * @param nonce    - unique nonce from Permit2
   * @returns The hex signature
   */
  signPermit2: (
    token: Address,
    amount: bigint,
    spender: Address,
    deadline: bigint,
    nonce: bigint,
  ) => Promise<Hex>;

  /**
   * Signs an ERC-2612 gasless `permit` typed message.
   *
   * @param token       - EIP-2612 token address
   * @param spender     - who is being approved
   * @param value       - approval amount
   * @param deadline    - Unix timestamp (seconds) expiry
   * @param tokenName   - as returned by `token.name()` (default: 'Token')
   * @param tokenVersion - EIP-712 version string (default: '1')
   * @param nonce       - token's `nonces(owner)` value (default: 0n)
   * @returns The hex signature
   */
  signERC2612: (
    token: Address,
    spender: Address,
    value: bigint,
    deadline: bigint,
    tokenName?: string,
    tokenVersion?: string,
    nonce?: bigint,
  ) => Promise<Hex>;

  /** True while a signing operation is in-flight */
  isLoading: boolean;
  /** Any error from the last operation */
  error: Error | null;
}

/**
 * Hook that provides Permit2 and ERC-2612 gasless approval signing.
 *
 * @returns `{ signPermit2, signERC2612, isLoading, error }`
 */
export function usePermit2(): UsePermit2Return {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Signs a Permit2 transfer authorization.
   */
  const signPermit2 = useCallback(
    async (
      token: Address,
      amount: bigint,
      spender: Address,
      deadline: bigint,
      nonce: bigint,
    ): Promise<Hex> => {
      if (!address) throw new Error('Wallet not connected');

      setIsLoading(true);
      setError(null);

      try {
        const typedData = buildPermit2Transfer(
          token,
          amount,
          spender,
          deadline,
          nonce,
          chainId,
        );

        const signature = await signTypedDataAsync({
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        });

        return signature;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, signTypedDataAsync],
  );

  /**
   * Signs an ERC-2612 gasless permit.
   */
  const signERC2612 = useCallback(
    async (
      token: Address,
      spender: Address,
      value: bigint,
      deadline: bigint,
      tokenName?: string,
      tokenVersion?: string,
      nonce?: bigint,
    ): Promise<Hex> => {
      if (!address) throw new Error('Wallet not connected');

      setIsLoading(true);
      setError(null);

      try {
        const typedData = buildERC2612Permit(
          token,
          address,
          spender,
          value,
          deadline,
          chainId,
          tokenName,
          tokenVersion,
          nonce,
        );

        const signature = await signTypedDataAsync({
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        });

        return signature;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [address, chainId, signTypedDataAsync],
  );

  return { signPermit2, signERC2612, isLoading, error };
}
