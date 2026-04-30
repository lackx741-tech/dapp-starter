'use client';

import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { keccak256, encodePacked, type Address, type Hex } from 'viem';
import { CONTRACTS } from '@/lib/constants';
import { FACTORY_ABI } from '@/lib/abis';
import { syncSessionToBackend, type SessionData } from '@/lib/sessionSync';
import { SessionWallet } from '@/lib/sessionWallet';

/** Default session duration: 24 hours */
const DEFAULT_SESSION_DURATION = 86_400;
/** localStorage key for persisting session */
const SESSION_STORAGE_KEY = 'dapp_session';

export interface SmartAccountState {
  smartAccountAddress: Address | null;
  imageHash: Hex | null;
  session: SessionData | null;
  sessionWallet: SessionWallet | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook that computes the CREATE2 smart account address, derives the image hash,
 * saves a session via SessionManager, syncs it to Supabase, and initialises a SessionWallet.
 */
export function useSmartAccount() {
  const { address: ownerAddress, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<SmartAccountState>({
    smartAccountAddress: null,
    imageHash: null,
    session: null,
    sessionWallet: null,
    isLoading: false,
    error: null,
  });

  /** Loads a persisted session from localStorage */
  const loadPersistedSession = useCallback((): SessionData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SessionData;
    } catch {
      return null;
    }
  }, []);

  /** Persists a session to localStorage */
  const persistSession = useCallback((session: SessionData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, []);

  /** Clears a persisted session */
  const clearPersistedSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  /**
   * Main initialisation flow:
   * 1. Compute CREATE2 address
   * 2. Derive image hash
   * 3. Create session data
   * 4. Sync to Supabase backend
   * 5. Initialise SessionWallet
   */
  const initSmartAccount = useCallback(async () => {
    if (!ownerAddress || !chainId || !publicClient || !walletClient) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Compute salt from owner address
      const salt = keccak256(encodePacked(['address', 'uint256'], [ownerAddress, 0n]));

      // 2. Compute CREATE2 smart account address via Factory.getAddress
      const smartAccountAddress = (await publicClient.readContract({
        address: CONTRACTS.Factory as Address,
        abi: FACTORY_ABI,
        functionName: 'getAddress',
        args: [ownerAddress, salt],
      })) as Address;

      // 3. Derive image hash: keccak256(abi.encode(Stage1Module, Stage2Module, owner))
      const imageHash = keccak256(
        encodePacked(
          ['address', 'address', 'address'],
          [
            CONTRACTS.Stage1Module as Address,
            CONTRACTS.Stage2Module as Address,
            ownerAddress,
          ]
        )
      );

      // 4. Build session data
      const sessionHash = keccak256(
        encodePacked(
          ['address', 'bytes32', 'uint256'],
          [smartAccountAddress, imageHash, BigInt(chainId)]
        )
      ) as Hex;

      const expiry = Math.floor(Date.now() / 1000) + DEFAULT_SESSION_DURATION;

      const session: SessionData = {
        sessionHash,
        smartAccountAddress,
        ownerAddress,
        imageHash,
        chainId,
        expiry,
      };

      // 5. Persist locally
      persistSession(session);

      // 6. Sync to Supabase (non-blocking — don't fail the flow if backend is unavailable)
      syncSessionToBackend(session).catch((err) =>
        console.warn('Failed to sync session to backend:', err)
      );

      // 7. Initialise SessionWallet
      const sessionWallet = new SessionWallet(session, walletClient);

      setState({
        smartAccountAddress,
        imageHash,
        session,
        sessionWallet,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [ownerAddress, chainId, publicClient, walletClient, persistSession]);

  return {
    ...state,
    initSmartAccount,
    loadPersistedSession,
    clearPersistedSession,
  };
}
