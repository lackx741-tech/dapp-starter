'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { SessionWallet } from '@/lib/sessionWallet';
import type { SessionData } from '@/lib/sessionSync';
import type { Address, Hex, Abi, TypedData } from 'viem';

const SESSION_STORAGE_KEY = 'dapp_session';

/**
 * React hook providing access to the SessionWallet.
 * Loads the persisted session from localStorage and creates a SessionWallet instance.
 */
export function useSessionWallet() {
  const { data: walletClient } = useWalletClient();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionWallet, setSessionWallet] = useState<SessionWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      try {
        setSession(JSON.parse(raw) as SessionData);
      } catch {
        // ignore
      }
    }
  }, []);

  // Create SessionWallet when both session and walletClient are available
  useEffect(() => {
    if (session && walletClient) {
      setSessionWallet(new SessionWallet(session, walletClient));
    } else {
      setSessionWallet(null);
    }
  }, [session, walletClient]);

  const isSessionValid = Boolean(
    session && Math.floor(Date.now() / 1000) < session.expiry
  );

  const sendTransaction = useCallback(
    async (tx: { to: Address; value?: bigint; data?: Hex }) => {
      if (!sessionWallet) throw new Error('No session wallet');
      setIsLoading(true);
      setError(null);
      try {
        const hash = await sessionWallet.sendTransaction(tx);
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transaction failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionWallet]
  );

  const signMessage = useCallback(
    async (message: string) => {
      if (!sessionWallet) throw new Error('No session wallet');
      setIsLoading(true);
      setError(null);
      try {
        return await sessionWallet.signMessage(message);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Sign failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionWallet]
  );

  const signTypedData = useCallback(
    async (data: TypedData) => {
      if (!sessionWallet) throw new Error('No session wallet');
      setIsLoading(true);
      setError(null);
      try {
        return await sessionWallet.signTypedData(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Sign failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionWallet]
  );

  const callContract = useCallback(
    async (params: {
      address: Address;
      abi: Abi;
      functionName: string;
      args: unknown[];
      value?: bigint;
    }) => {
      if (!sessionWallet) throw new Error('No session wallet');
      setIsLoading(true);
      setError(null);
      try {
        return await sessionWallet.callContract(params);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Contract call failed';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sessionWallet]
  );

  const injectIntoWindow = useCallback(() => {
    sessionWallet?.injectAsProvider();
  }, [sessionWallet]);

  const removeFromWindow = useCallback(() => {
    sessionWallet?.removeProvider();
  }, [sessionWallet]);

  return {
    sessionWallet,
    sendTransaction,
    signMessage,
    signTypedData,
    callContract,
    injectIntoWindow,
    removeFromWindow,
    isSessionValid,
    session,
    isLoading,
    error,
  };
}
