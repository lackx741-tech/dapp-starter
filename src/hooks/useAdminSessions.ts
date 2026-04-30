'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type SessionRecord } from '@/lib/db';

export interface SessionStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  totalTxs: number;
}

function computeStats(sessions: SessionRecord[]): SessionStats {
  const now = Math.floor(Date.now() / 1000);
  return {
    total: sessions.length,
    active: sessions.filter((s) => !s.is_revoked && s.expiry > now).length,
    expired: sessions.filter((s) => !s.is_revoked && s.expiry <= now).length,
    revoked: sessions.filter((s) => s.is_revoked).length,
    totalTxs: sessions.reduce((acc, s) => acc + s.tx_count, 0),
  };
}

/**
 * Fetches all sessions from the API and subscribes to Supabase realtime
 * for live updates without page refresh.
 */
export function useAdminSessions() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    active: 0,
    expired: 0,
    revoked: 0,
    totalTxs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = (await res.json()) as SessionRecord[];
      setSessions(data);
      setStats(computeStats(data));
    } catch (err) {
      console.error('useAdminSessions fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionHash: string) => {
    await fetch(`/api/sessions/${sessionHash}`, {
      method: 'DELETE',
    });
    setSessions((prev) =>
      prev.map((s) =>
        s.session_hash === sessionHash ? { ...s, is_revoked: true } : s
      )
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Supabase realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('sessions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => {
              const next = [payload.new as SessionRecord, ...prev];
              setStats(computeStats(next));
              return next;
            });
          } else if (payload.eventType === 'UPDATE') {
            setSessions((prev) => {
              const next = prev.map((s) =>
                s.id === (payload.new as SessionRecord).id
                  ? (payload.new as SessionRecord)
                  : s
              );
              setStats(computeStats(next));
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            setSessions((prev) => {
              const next = prev.filter(
                (s) => s.id !== (payload.old as SessionRecord).id
              );
              setStats(computeStats(next));
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sessions, stats, isLoading, revokeSession, refetch: fetchSessions };
}
