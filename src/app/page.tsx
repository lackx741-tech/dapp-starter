import { ConnectButton } from '@/components/ConnectButton';
import { SmartAccountCard } from '@/components/SmartAccountCard';
import { SessionInteractionPanel } from '@/components/SessionInteractionPanel';
import { ProviderInjector } from '@/components/ProviderInjector';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">dApp Starter</h1>
          <p className="text-gray-500 mt-1 text-sm">
            WalletConnect · ERC-4337 · Multi-chain · Session Keys
          </p>
        </div>

        <ConnectButton />
        <SmartAccountCard />
        <SessionInteractionPanel />
        <ProviderInjector />

        <div className="text-center">
          <Link
            href="/admin"
            className="text-indigo-600 hover:underline text-sm"
          >
            → Admin Session Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
