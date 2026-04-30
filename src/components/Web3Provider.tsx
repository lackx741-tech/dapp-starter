'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/wagmiConfig';
import { SessionProvider } from '@/context/SessionContext';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

/** Root Web3 provider — wrap your app with this */
export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
