'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Address, Hex } from 'viem';
import type { SessionData } from '@/lib/sessionSync';
import type { SessionWallet } from '@/lib/sessionWallet';

interface SessionContextValue {
  sessionWallet: SessionWallet | null;
  session: SessionData | null;
  smartAccountAddress: Address | null;
  imageHash: Hex | null;
  setSession: (session: SessionData | null) => void;
  setSessionWallet: (wallet: SessionWallet | null) => void;
  setSmartAccountAddress: (addr: Address | null) => void;
  setImageHash: (hash: Hex | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Provider for session state — wrap your app with this */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionWallet, setSessionWallet] = useState<SessionWallet | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null);
  const [imageHash, setImageHash] = useState<Hex | null>(null);

  return (
    <SessionContext.Provider
      value={{
        sessionWallet,
        session,
        smartAccountAddress,
        imageHash,
        setSession,
        setSessionWallet,
        setSmartAccountAddress,
        setImageHash,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/** Access the session context */
export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used inside <SessionProvider>');
  return ctx;
}
