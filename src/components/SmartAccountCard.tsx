'use client';

import { useSmartAccount } from '@/hooks/useSmartAccount';
import { useAccount } from 'wagmi';

/** Displays the smart account address + image hash */
export function SmartAccountCard() {
  const { isConnected } = useAccount();
  const { smartAccountAddress, imageHash, session } = useSmartAccount();

  if (!isConnected || !smartAccountAddress) return null;

  const expiry = session
    ? new Date(session.expiry * 1000).toLocaleString()
    : 'N/A';

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm max-w-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-3">Smart Account</h3>
      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-500 w-32 shrink-0">Address:</span>
          <span className="font-mono text-indigo-700 truncate">{smartAccountAddress}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 w-32 shrink-0">Image Hash:</span>
          <span className="font-mono text-gray-700 truncate text-xs">{imageHash}</span>
        </div>
        {session && (
          <>
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Session Hash:</span>
              <span className="font-mono text-gray-700 truncate text-xs">{session.sessionHash}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-32 shrink-0">Expires:</span>
              <span className="text-gray-700">{expiry}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
