'use client';

import { useState } from 'react';
import { useAdminSessions } from '@/hooks/useAdminSessions';
import { SessionStatsBar } from '@/components/SessionStats';
import { SessionTable } from '@/components/SessionTable';
import { CHAIN_NAMES } from '@/lib/chains';
import Link from 'next/link';

/** Real-time admin dashboard — /admin */
export default function AdminPage() {
  const { sessions, stats, isLoading, revokeSession, refetch } = useAdminSessions();

  const [chainFilter, setChainFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [search, setSearch] = useState('');

  const now = Math.floor(Date.now() / 1000);

  const filtered = sessions.filter((s) => {
    if (chainFilter !== 'all' && s.chain_id !== chainFilter) return false;
    if (statusFilter === 'active' && (s.is_revoked || s.expiry <= now)) return false;
    if (statusFilter === 'expired' && (s.is_revoked || s.expiry > now)) return false;
    if (statusFilter === 'revoked' && !s.is_revoked) return false;
    if (
      search &&
      !s.smart_account_address.toLowerCase().includes(search.toLowerCase()) &&
      !s.owner_address.toLowerCase().includes(search.toLowerCase()) &&
      !s.session_hash.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time view of all connected sessions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
            >
              ↺ Refresh
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              ← App
            </Link>
          </div>
        </div>

        {/* Stats */}
        <SessionStatsBar stats={stats} />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address or hash…"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <select
            value={chainFilter}
            onChange={(e) =>
              setChainFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Chains</option>
            {Object.entries(CHAIN_NAMES).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">🟢 Active</option>
            <option value="expired">🔴 Expired</option>
            <option value="revoked">⚫ Revoked</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading sessions…</div>
        ) : (
          <SessionTable sessions={filtered} onRevoke={revokeSession} />
        )}
      </div>
    </main>
  );
}
