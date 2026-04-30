'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSmartAccount } from '@/hooks/useSmartAccount';
import { isSessionValid } from '@/lib/session';
import { chainMeta } from '@/config/chains';

/**
 * Copies text to the clipboard and returns a boolean indicating success.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * CopyButton — renders a small button that copies `text` to clipboard.
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-0.5 rounded text-gray-400 hover:text-blue-500 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
    </button>
  );
}

/**
 * AddressRow — renders a labelled address with a copy button.
 */
function AddressRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
          {address}
        </span>
        <CopyButton text={address} />
      </div>
    </div>
  );
}

/**
 * SmartAccountCard — displays the full smart account info panel.
 *
 * Shows:
 * - EOA (owner) address
 * - Smart Account address (CREATE2-derived)
 * - Image Hash
 * - Session status (valid / expired)
 * - Current chain
 *
 * All addresses have a one-click copy button.
 */
export function SmartAccountCard() {
  const { address: eoaAddress, isConnected } = useAccount();
  const { smartAccountAddress, imageHash, session, isLoading, chainId, error } =
    useSmartAccount();

  const meta = chainId ? chainMeta[chainId] : undefined;
  const sessionValid = session ? isSessionValid(session) : false;

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow-sm text-center text-gray-500">
        Connect your wallet to see your smart account details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Smart Account
        </h3>
        {meta && (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {meta.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-5">
        {isLoading && (
          <p className="text-sm text-blue-500 animate-pulse">
            Setting up smart account…
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            ⚠️ {error.message}
          </p>
        )}

        {/* EOA address */}
        {eoaAddress && (
          <AddressRow label="Owner (EOA)" address={eoaAddress} />
        )}

        {/* Smart account address */}
        {smartAccountAddress && (
          <AddressRow label="Smart Account" address={smartAccountAddress} />
        )}

        {/* Image hash */}
        {imageHash && (
          <AddressRow label="Image Hash" address={imageHash} />
        )}

        {/* Session status */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Session
          </span>
          {session ? (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium ${
                  sessionValid ? 'text-green-600' : 'text-red-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    sessionValid ? 'bg-green-500' : 'bg-red-400'
                  }`}
                />
                {sessionValid ? 'Valid' : 'Expired'}
              </span>
              {session.expiry && (
                <span className="text-xs text-gray-400">
                  (expires{' '}
                  {new Date(session.expiry * 1000).toLocaleDateString()})
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">No active session</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
