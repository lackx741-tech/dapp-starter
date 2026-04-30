'use client';

import { useState } from 'react';
import { useSessionWallet } from '@/hooks/useSessionWallet';
import { useSessionTransaction } from '@/hooks/useSessionTransaction';
import type { Address, Hex } from 'viem';
import type { Call } from '@/lib/sessionExecutor';

/** Demo panel showing session-powered interactions */
export function SessionInteractionPanel() {
  const {
    signMessage,
    isSessionValid,
    session,
    isLoading: swLoading,
    error: swError,
  } = useSessionWallet();

  const {
    sendTx,
    sendBatch,
    isLoading: txLoading,
    txHash,
    error: txError,
  } = useSessionTransaction();

  // Send Tx form
  const [to, setTo] = useState('');
  const [value, setValue] = useState('0');
  const [data, setData] = useState('0x');

  // Sign message form
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  // Batch calls
  const [calls, setCalls] = useState<Call[]>([]);
  const [batchTo, setBatchTo] = useState('');
  const [batchValue, setBatchValue] = useState('0');
  const [batchData, setBatchData] = useState('0x');

  if (!isSessionValid) {
    return (
      <div className="border rounded-xl p-4 bg-gray-50 text-center text-gray-400 text-sm">
        Connect wallet to activate session interactions
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const remaining = session ? session.expiry - now : 0;
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);

  async function handleSendTx() {
    await sendTx(to as Address, BigInt(value || '0'), (data || '0x') as Hex);
  }

  async function handleSign() {
    const sig = await signMessage(message);
    setSignature(sig ?? '');
  }

  function addCall() {
    setCalls((prev) => [
      ...prev,
      { target: batchTo as Address, value: BigInt(batchValue || '0'), data: (batchData || '0x') as Hex },
    ]);
    setBatchTo('');
    setBatchValue('0');
    setBatchData('0x');
  }

  async function handleSendBatch() {
    await sendBatch(calls);
    setCalls([]);
  }

  const isLoading = swLoading || txLoading;
  const error = swError ?? txError;

  return (
    <div className="border rounded-xl bg-white shadow-sm max-w-lg w-full overflow-hidden">
      <div className="px-4 py-3 bg-indigo-600 flex items-center justify-between">
        <h3 className="text-white font-semibold">Session Interactions</h3>
        <div className="text-indigo-100 text-xs">
          🟢 Active · expires in {h}h {m}m
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Send Transaction */}
        <section>
          <h4 className="font-medium text-gray-700 mb-2">Send Transaction</h4>
          <div className="space-y-2">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To address (0x…)"
              className="w-full border rounded px-3 py-2 text-sm font-mono"
            />
            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Value (wei)"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <input
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Data (0x…)"
                className="flex-1 border rounded px-3 py-2 text-sm font-mono"
              />
            </div>
            <button
              onClick={handleSendTx}
              disabled={isLoading || !to}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {isLoading ? 'Sending…' : 'Send Transaction'}
            </button>
          </div>
          {txHash && (
            <div className="mt-2 text-xs text-green-600 font-mono break-all">
              ✅ Tx: {txHash}
            </div>
          )}
        </section>

        {/* Sign Message */}
        <section>
          <h4 className="font-medium text-gray-700 mb-2">Sign Message</h4>
          <div className="space-y-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message to sign…"
              className="w-full border rounded px-3 py-2 text-sm h-20 resize-none"
            />
            <button
              onClick={handleSign}
              disabled={isLoading || !message}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
            >
              {isLoading ? 'Signing…' : 'Sign Message'}
            </button>
          </div>
          {signature && (
            <div className="mt-2 text-xs text-green-600 font-mono break-all">
              ✅ Signature: {signature}
            </div>
          )}
        </section>

        {/* Batch Calls */}
        <section>
          <h4 className="font-medium text-gray-700 mb-2">Batch Calls</h4>
          <div className="space-y-2">
            <input
              value={batchTo}
              onChange={(e) => setBatchTo(e.target.value)}
              placeholder="Target address (0x…)"
              className="w-full border rounded px-3 py-2 text-sm font-mono"
            />
            <div className="flex gap-2">
              <input
                value={batchValue}
                onChange={(e) => setBatchValue(e.target.value)}
                placeholder="Value (wei)"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <input
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
                placeholder="Data (0x…)"
                className="flex-1 border rounded px-3 py-2 text-sm font-mono"
              />
            </div>
            <button
              onClick={addCall}
              disabled={!batchTo}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
            >
              + Add Call
            </button>
          </div>

          {calls.length > 0 && (
            <div className="mt-2 space-y-1">
              {calls.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1">
                  <span className="font-mono truncate flex-1">
                    {i + 1}. {c.target.slice(0, 8)}… +{c.value.toString()}wei
                  </span>
                  <button
                    onClick={() => setCalls((prev) => prev.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleSendBatch}
                disabled={isLoading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium mt-2"
              >
                {isLoading ? 'Sending…' : `Send ${calls.length} Calls`}
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}
