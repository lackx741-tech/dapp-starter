'use client';

import { useSwitchChain, useChainId } from 'wagmi';
import { supportedChains, chainMeta } from '@/config/chains';

/**
 * ChainSelector — a dropdown to switch between supported chains.
 *
 * Uses wagmi `useSwitchChain` to request a network switch via the connected wallet.
 * Shows a color dot indicator for each chain.
 */
export function ChainSelector() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const currentMeta = chainId ? chainMeta[chainId] : undefined;

  return (
    <div className="relative inline-block">
      <label className="sr-only" htmlFor="chain-selector">
        Select network
      </label>
      <div className="relative flex items-center">
        {/* Color dot */}
        {currentMeta && (
          <span
            className="absolute left-3 w-3 h-3 rounded-full pointer-events-none"
            style={{ backgroundColor: currentMeta.color }}
          />
        )}

        <select
          id="chain-selector"
          value={chainId ?? ''}
          disabled={isPending}
          onChange={(e) => {
            const id = Number(e.target.value);
            if (id && switchChain) switchChain({ chainId: id });
          }}
          className="appearance-none pl-8 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-gray-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          {supportedChains.map((chain) => {
            const meta = chainMeta[chain.id];
            return (
              <option key={chain.id} value={chain.id}>
                {meta?.name ?? chain.name}
              </option>
            );
          })}
        </select>

        {/* Chevron icon */}
        <span className="absolute right-2 pointer-events-none text-gray-400">
          <ChevronDown />
        </span>
      </div>

      {isPending && (
        <p className="mt-1 text-xs text-blue-500 animate-pulse">
          Switching network…
        </p>
      )}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
