'use client';

import type { SessionStats } from '@/hooks/useAdminSessions';

interface Props {
  stats: SessionStats;
}

/** Stats cards for the admin dashboard */
export function SessionStatsBar({ stats }: Props) {
  const cards = [
    { label: 'Total Sessions', value: stats.total, color: 'bg-blue-50 text-blue-700' },
    { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700' },
    { label: 'Expired', value: stats.expired, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Revoked', value: stats.revoked, color: 'bg-red-50 text-red-700' },
    { label: 'Total Txs', value: stats.totalTxs, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl p-4 ${card.color} flex flex-col items-center`}
        >
          <span className="text-2xl font-bold">{card.value}</span>
          <span className="text-xs mt-1 font-medium">{card.label}</span>
        </div>
      ))}
    </div>
  );
}
