import type { Hex } from 'viem';

/** Minimal session data shape from the connect flow */
export interface SessionData {
  sessionHash: Hex;
  smartAccountAddress: string;
  ownerAddress: string;
  imageHash: Hex;
  chainId: number;
  expiry: number;
  metadata?: Record<string, unknown>;
}

/**
 * Syncs a newly created session to the backend `/api/sessions` endpoint.
 * Called after `saveSession` on every wallet connect.
 */
export async function syncSessionToBackend(data: SessionData): Promise<void> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_hash: data.sessionHash,
      smart_account_address: data.smartAccountAddress,
      owner_address: data.ownerAddress,
      image_hash: data.imageHash,
      chain_id: data.chainId,
      expiry: data.expiry,
      metadata: data.metadata ?? {},
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`syncSessionToBackend failed: ${text}`);
  }
}

/**
 * Increments the tx count for a session in the backend.
 * Called after every successful transaction.
 */
export async function incrementSessionTxCount(sessionHash: Hex): Promise<void> {
  await fetch(`/api/sessions/${sessionHash}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'increment_tx' }),
  });
}

/**
 * Updates the `last_active` timestamp for a session.
 * Called on any session interaction.
 */
export async function markSessionActive(sessionHash: Hex): Promise<void> {
  await fetch(`/api/sessions/${sessionHash}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_active' }),
  });
}
