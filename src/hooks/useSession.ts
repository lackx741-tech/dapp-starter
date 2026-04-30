'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import {
  loadSession,
  saveSession as saveSessionLib,
  clearSession as clearSessionLib,
  isSessionValid,
  type SessionData,
} from '@/lib/session';

/**
 * Return type for the `useSession` hook.
 */
export interface UseSessionReturn {
  /** The current session data, or null if none */
  session: SessionData | null;
  /** Whether the current session is still valid (not expired) */
  isValid: boolean;
  /** Persists a new session and updates React state */
  saveSession: (data: SessionData) => void;
  /** Removes the current session from storage and React state */
  clearSession: () => void;
}

/**
 * Wraps the session lib functions as React state.
 * Automatically loads the session for the currently connected wallet on mount.
 *
 * @returns Session state and helpers
 */
export function useSession(): UseSessionReturn {
  const { address } = useAccount();
  const [session, setSession] = useState<SessionData | null>(null);

  // Load the session for the connected address on mount / when address changes
  useEffect(() => {
    if (!address) {
      setSession(null);
      return;
    }
    const loaded = loadSession(address as Address);
    setSession(loaded);
  }, [address]);

  /**
   * Saves a session to storage and updates React state.
   */
  const saveSession = useCallback((data: SessionData) => {
    saveSessionLib(data);
    setSession(data);
  }, []);

  /**
   * Clears the current session from storage and React state.
   */
  const clearSession = useCallback(() => {
    if (address) clearSessionLib(address as Address);
    setSession(null);
  }, [address]);

  return {
    session,
    isValid: session ? isSessionValid(session) : false,
    saveSession,
    clearSession,
  };
}
