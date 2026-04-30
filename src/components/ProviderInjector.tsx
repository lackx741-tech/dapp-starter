'use client';

import { useState } from 'react';
import { useSessionWallet } from '@/hooks/useSessionWallet';

/** Toggle switch to inject the session wallet as window.ethereum */
export function ProviderInjector() {
  const { injectIntoWindow, removeFromWindow, isSessionValid, session } = useSessionWallet();
  const [isInjected, setIsInjected] = useState(false);

  if (!isSessionValid) return null;

  function toggle() {
    if (isInjected) {
      removeFromWindow();
      setIsInjected(false);
    } else {
      injectIntoWindow();
      setIsInjected(true);
    }
  }

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm max-w-lg w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Session Browser Wallet</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Inject this session as <code>window.ethereum</code> for seamless dApp interactions
          </p>
        </div>
        <button
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isInjected ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isInjected ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isInjected && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
          ⚠️ This session wallet is now injected as <code>window.ethereum</code>. Any dApp on this
          page will use it automatically. Session:{' '}
          <span className="font-mono">{session?.sessionHash.slice(0, 10)}…</span>
        </div>
      )}

      {isInjected && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Provider active
        </div>
      )}
    </div>
  );
}
