import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? getSupabaseAnonKey();
}

/** Public Supabase client (browser-safe) */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
);

/** Server-side Supabase client (uses service role key — never expose to browser) */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
);

/** TypeScript interface matching the `sessions` table */
export interface SessionRecord {
  id: string;
  session_hash: string;
  smart_account_address: string;
  owner_address: string;
  image_hash: string;
  chain_id: number;
  expiry: number;
  created_at: string;
  last_active: string;
  is_revoked: boolean;
  tx_count: number;
  metadata: Record<string, unknown>;
}

export type InsertSession = Omit<SessionRecord, 'id' | 'created_at' | 'last_active' | 'is_revoked' | 'tx_count' | 'metadata'> & {
  metadata?: Record<string, unknown>;
};

/**
 * Insert a new session into Supabase.
 * Called from the API route on every wallet connect.
 */
export async function insertSession(data: InsertSession): Promise<SessionRecord> {
  const { data: row, error } = await supabaseAdmin
    .from('sessions')
    .upsert(
      {
        session_hash: data.session_hash,
        smart_account_address: data.smart_account_address,
        owner_address: data.owner_address,
        image_hash: data.image_hash,
        chain_id: data.chain_id,
        expiry: data.expiry,
        metadata: data.metadata ?? {},
      },
      { onConflict: 'session_hash' }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as SessionRecord;
}

/**
 * Fetch all sessions with optional filters.
 */
export async function getSessions(opts?: {
  chainId?: number;
  isRevoked?: boolean;
  limit?: number;
  offset?: number;
}): Promise<SessionRecord[]> {
  let query = supabaseAdmin.from('sessions').select('*').order('created_at', { ascending: false });
  if (opts?.chainId !== undefined) query = query.eq('chain_id', opts.chainId);
  if (opts?.isRevoked !== undefined) query = query.eq('is_revoked', opts.isRevoked);
  if (opts?.limit !== undefined) query = query.limit(opts.limit);
  if (opts?.offset !== undefined) query = query.range(opts.offset, (opts.offset ?? 0) + (opts.limit ?? 50) - 1);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as SessionRecord[];
}

/**
 * Fetch a single session by its hash.
 */
export async function getSessionByHash(sessionHash: string): Promise<SessionRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('session_hash', sessionHash)
    .single();
  if (error) return null;
  return data as SessionRecord;
}

/**
 * Update a session record (e.g., last_active, tx_count).
 */
export async function updateSession(
  sessionHash: string,
  updates: Partial<Pick<SessionRecord, 'last_active' | 'tx_count' | 'is_revoked' | 'metadata'>>
): Promise<SessionRecord> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(updates)
    .eq('session_hash', sessionHash)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as SessionRecord;
}

/**
 * Mark a session as revoked.
 */
export async function revokeSession(sessionHash: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('sessions')
    .update({ is_revoked: true })
    .eq('session_hash', sessionHash);
  if (error) throw new Error(error.message);
}
