'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import config from '@/config/wagmi';
import { useState } from 'react';

/**
 * Web3Provider wraps the entire app with wagmi and React Query providers.
 * Must be placed at the root of the component tree (e.g. in `layout.tsx`).
 *
 * Usage:
 * ```tsx
 * <Web3Provider>
 *   <App />
 * </Web3Provider>
 * ```
 */
export function Web3Provider({ children }: { children: React.ReactNode }) {
  // QueryClient is created inside state to avoid sharing between requests in SSR
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        retry: 2,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
