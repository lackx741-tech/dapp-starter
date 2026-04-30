'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { useEffect } from 'react';

/** WalletConnect + Smart Account connect button */
export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { initSmartAccount, smartAccountAddress, isLoading } = useSmartAccount();

  // Auto-init smart account when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      initSmartAccount();
    }
  }, [isConnected, address, initSmartAccount]);

  if (isConnected) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <div className="text-sm text-green-600 font-medium">
          ✅ Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
        </div>
        {chain && (
          <div className="text-xs text-gray-500">Chain: {chain.name}</div>
        )}
        {smartAccountAddress && (
          <div className="text-xs text-indigo-600">
            Smart Account: {smartAccountAddress.slice(0, 6)}…{smartAccountAddress.slice(-4)}
          </div>
        )}
        {isLoading && <div className="text-xs text-gray-400">Initialising session…</div>}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 items-center">
      <h2 className="text-lg font-semibold">Connect Wallet</h2>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 w-48 text-sm font-medium"
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
