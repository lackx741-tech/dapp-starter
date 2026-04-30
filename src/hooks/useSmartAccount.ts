'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import { computeSmartAccountAddress } from '@/lib/create2';
import { computeImageHash } from '@/lib/imageHash';
import {
  loadSession,
  saveSession,
  isSessionValid,
  createSessionHash,
  type SessionData,
} from '@/lib/session';
import { CONTRACT_ADDRESSES, SESSION_MANAGER_ABI } from '@/config/contracts';

/**
 * Return type for the `useSmartAccount` hook.
 */
export interface SmartAccountState {
  /** The ERC-4337 smart account address derived via CREATE2 */
  smartAccountAddress: Address | null;
  /** The image hash for this account's owners/threshold config */
  imageHash: `0x${string}` | null;
  /** The current session (if valid) */
  session: SessionData | null;
  /** True while computing addresses or creating a session */
  isLoading: boolean;
  /** True when a wallet is connected */
  isConnected: boolean;
  /** The current wagmi chain ID */
  chainId: number | undefined;
  /** Any error that occurred during setup */
  error: Error | null;
}

/**
 * Core hook: runs the full on-connect flow automatically.
 *
 * Flow:
 * 1. Read EOA address from wagmi `useAccount`
 * 2. Compute CREATE2 smart account address
 * 3. Compute image hash (owners=[EOA], threshold=1)
 * 4. Check for an existing valid session in localStorage
 * 5. If no valid session: call `SessionManager.createSession` on-chain, then save it
 *
 * @returns Smart account state including address, imageHash, session, and loading/error flags
 */
export function useSmartAccount(): SmartAccountState {
  const { address: ownerAddress, isConnected } = useAccount();
  const chainId = useChainId();

  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);
  const [imageHash, setImageHash] = useState<`0x${string}` | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync } = useWriteContract();

  /**
   * Creates a new on-chain session via SessionManager and persists it locally.
   */
  const createAndSaveSession = useCallback(
    async (
      smartAccAddr: Address,
      owner: Address,
      imgHash: `0x${string}`,
      cId: number,
    ) => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiry = nowSeconds + 7 * 24 * 60 * 60; // 7 days

      const partialData: Omit<SessionData, 'sessionHash'> = {
        smartAccountAddress: smartAccAddr,
        ownerAddress: owner,
        imageHash: imgHash,
        chainId: cId,
        expiry,
        createdAt: nowSeconds,
      };

      const sessionHash = createSessionHash(partialData);
      const fullData: SessionData = { ...partialData, sessionHash };

      // Register on-chain
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SessionManager,
        abi: SESSION_MANAGER_ABI,
        functionName: 'createSession',
        args: [smartAccAddr, sessionHash, BigInt(expiry)],
      });

      saveSession(fullData);
      setSession(fullData);
    },
    [writeContractAsync],
  );

  /**
   * Main effect: runs the full setup flow whenever the connected account changes.
   */
  useEffect(() => {
    if (!isConnected || !ownerAddress || !chainId) {
      setSmartAccountAddress(null);
      setImageHash(null);
      setSession(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Compute CREATE2 address
        const smartAccAddr = computeSmartAccountAddress(ownerAddress, chainId);
        if (cancelled) return;
        setSmartAccountAddress(smartAccAddr);

        // Step 2: Compute image hash
        const imgHash = computeImageHash([ownerAddress], 1);
        if (cancelled) return;
        setImageHash(imgHash);

        // Step 3: Check for valid existing session
        const existing = loadSession(ownerAddress);
        if (existing && isSessionValid(existing)) {
          setSession(existing);
          return;
        }

        // Step 4: Create a new session on-chain
        await createAndSaveSession(smartAccAddr, ownerAddress, imgHash, chainId);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isConnected, ownerAddress, chainId, createAndSaveSession]);

  return {
    smartAccountAddress,
    imageHash,
    session,
    isLoading,
    isConnected,
    chainId,
    error,
  };
}
