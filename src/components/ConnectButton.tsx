'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { chainMeta } from '@/config/chains';

/**
 * Truncates an Ethereum address for display (e.g. `0x1234...abcd`).
 */
function truncate(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * ConnectButton — a plug-and-play wallet connection button.
 *
 * - Shows "Connect Wallet" when disconnected
 * - On connect: automatically runs the full useSmartAccount flow
 *   (CREATE2 address → image hash → session creation)
 * - When connected: shows truncated smart account address + chain badge
 *
 * **Plug & Play:** Drop this into any Next.js or React component:
 * ```tsx
 * import { ConnectButton } from '@/components/ConnectButton';
 * // ...
 * <ConnectButton />
 * ```
 */
export function ConnectButton() {
  const { isConnected, address: eoaAddress } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    smartAccountAddress,
    isLoading: isSettingUp,
    chainId,
    error,
  } = useSmartAccount();

  const meta = chainId ? chainMeta[chainId] : undefined;

  // Disconnected state
  if (!isConnected) {
    return (
      <button
        onClick={() => {
          const connector = connectors[0];
          if (connector) connect({ connector });
        }}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
      >
        {isConnecting ? (
          <>
            <Spinner />
            Connecting…
          </>
        ) : (
          <>
            <WalletIcon />
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  // Connected state
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      {/* Chain badge */}
      {meta && (
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: meta.color }}
        >
          {meta.shortName}
        </span>
      )}

      {/* Address display */}
      <div className="flex flex-col min-w-0">
        {isSettingUp ? (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Spinner className="w-3 h-3" />
            Setting up…
          </span>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {smartAccountAddress
                ? truncate(smartAccountAddress)
                : eoaAddress
                ? truncate(eoaAddress)
                : '—'}
            </span>
            <span className="text-xs text-gray-500">Smart Account</span>
          </>
        )}
        {error && (
          <span className="text-xs text-red-500 truncate max-w-[160px]">
            {error.message}
          </span>
        )}
      </div>

      {/* Disconnect button */}
      <button
        onClick={() => disconnect()}
        className="ml-1 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Disconnect"
      >
        <XIcon />
      </button>
    </div>
  );
}

// ─── Small icon helpers ───────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
