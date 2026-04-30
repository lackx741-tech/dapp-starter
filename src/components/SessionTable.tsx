'use client';

import { useState, useMemo } from 'react';
import type { SessionRecord } from '@/lib/db';
import { CHAIN_NAMES, CHAIN_COLORS } from '@/lib/chains';
import { CONTRACTS } from '@/lib/constants';
import { SESSION_MANAGER_ABI } from '@/lib/abis';
import { createPublicClient, http, type Address } from 'viem';
import { getChain } from '@/lib/chains';

interface Props {
  sessions: SessionRecord[];
  onRevoke: (sessionHash: string) => void;
}

type SortKey = keyof SessionRecord;

function truncate(addr: string, start = 6, end = 4): string {
  if (addr.length <= start + end) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1 text-xs text-gray-400 hover:text-indigo-600"
      title="Copy"
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

function SessionStatus({ session }: { session: SessionRecord }) {
  if (session.is_revoked) return <span>⚫ Revoked</span>;
  const now = Math.floor(Date.now() / 1000);
  if (session.expiry <= now) return <span className="text-red-600">🔴 Expired</span>;
  return <span className="text-green-600">🟢 Active</span>;
}

function ExpiryCountdown({ expiry }: { expiry: number }) {
  const now = Math.floor(Date.now() / 1000);
  const diff = expiry - now;
  if (diff <= 0) return <span className="text-red-500 text-xs">Expired</span>;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return (
    <span className="text-xs text-gray-600">
      {h}h {m}m
    </span>
  );
}

/** Sortable, paginated session table */
export function SessionTable({ sessions, onRevoke }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return 0;
    });
  }, [sessions, sortKey, sortDir]);

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(sessions.length / perPage));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  async function verifyOnChain(session: SessionRecord) {
    const chain = getChain(session.chain_id);
    if (!chain) return alert('Unsupported chain');
    const client = createPublicClient({ chain, transport: http() });
    try {
      const valid = await client.readContract({
        address: CONTRACTS.SessionManager as Address,
        abi: SESSION_MANAGER_ABI,
        functionName: 'validateSession',
        args: [session.smart_account_address as Address, session.session_hash as `0x${string}`],
      });
      alert(valid ? '✅ Session is valid on-chain' : '❌ Session is NOT valid on-chain');
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  const Th = ({ label, sortK }: { label: string; sortK?: SortKey }) => (
    <th
      className={`px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${sortK ? 'cursor-pointer hover:text-gray-800' : ''}`}
      onClick={() => sortK && toggleSort(sortK)}
    >
      {label} {sortK && sortKey === sortK ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th label="Smart Account" sortK="smart_account_address" />
              <Th label="Owner EOA" sortK="owner_address" />
              <Th label="Chain" sortK="chain_id" />
              <Th label="Status" />
              <Th label="Created" sortK="created_at" />
              <Th label="Last Active" sortK="last_active" />
              <Th label="Txs" sortK="tx_count" />
              <Th label="Expires" sortK="expiry" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono">
                  {truncate(s.smart_account_address)}
                  <CopyButton value={s.smart_account_address} />
                </td>
                <td className="px-3 py-2 font-mono">
                  {truncate(s.owner_address)}
                  <CopyButton value={s.owner_address} />
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${CHAIN_COLORS[s.chain_id] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {CHAIN_NAMES[s.chain_id] ?? `Chain ${s.chain_id}`}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <SessionStatus session={s} />
                </td>
                <td className="px-3 py-2 text-gray-500 text-xs">
                  {new Date(s.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-gray-500 text-xs">
                  {new Date(s.last_active).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-center">{s.tx_count}</td>
                <td className="px-3 py-2">
                  <ExpiryCountdown expiry={s.expiry} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => verifyOnChain(s)}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    >
                      Verify
                    </button>
                    {!s.is_revoked && (
                      <button
                        onClick={() => onRevoke(s.session_hash)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                  No sessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
        <span>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="px-3 py-1">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
