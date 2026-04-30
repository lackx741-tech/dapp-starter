'use client';

import { useState, useCallback } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import type { Address, Hex } from 'viem';
import { executeWithSession, type Call } from '@/lib/sessionExecutor';
import { incrementSessionTxCount } from '@/lib/sessionSync';
import type { SessionData } from '@/lib/sessionSync';

const SESSION_STORAGE_KEY = 'dapp_session';

function loadSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  } catch {
    return null;
  }
}

/**
 * High-level hook for sending transactions via the active session.
 */
export function useSessionTransaction() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Send a single transaction via the session */
  const sendTx = useCallback(
    async (to: Address, value: bigint, data: Hex) => {
      if (!publicClient || !walletClient) throw new Error('No client available');
      const session = loadSession();
      if (!session) throw new Error('No active session');

      setIsLoading(true);
      setError(null);
      try {
        const hash = await executeWithSession({
          session,
          calls: [{ target: to, value, data }],
          walletClient,
          publicClient,
        });
        setTxHash(hash);
        await incrementSessionTxCount(session.sessionHash).catch(() => {});
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transaction failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [publicClient, walletClient]
  );

  /** Send a batch of calls via the session */
  const sendBatch = useCallback(
    async (calls: Call[]) => {
      if (!publicClient || !walletClient) throw new Error('No client available');
      const session = loadSession();
      if (!session) throw new Error('No active session');

      setIsLoading(true);
      setError(null);
      try {
        const hash = await executeWithSession({
          session,
          calls,
          walletClient,
          publicClient,
        });
        setTxHash(hash);
        await incrementSessionTxCount(session.sessionHash).catch(() => {});
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Batch failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [publicClient, walletClient]
  );

  return { sendTx, sendBatch, isLoading, txHash, error };
}
