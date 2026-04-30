import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';

export const metadata: Metadata = {
  title: 'dApp Starter — Plug & Play ERC-4337',
  description:
    'Production-ready Next.js dApp starter with WalletConnect, ERC-4337 smart accounts, and multi-chain support. Drop ConnectButton into any website.',
};

/**
 * Root layout — wraps the entire app with Web3Provider (wagmi + QueryClient).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
