import { NextRequest, NextResponse } from 'next/server';
import { getSessions, insertSession } from '@/lib/db';

/** GET /api/sessions — list all sessions with optional filters */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get('chainId');
  const status = searchParams.get('status');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  const opts: Parameters<typeof getSessions>[0] = {};
  if (chainId) opts.chainId = Number(chainId);
  if (status === 'active') opts.isRevoked = false;
  if (status === 'revoked') opts.isRevoked = true;
  if (limit) opts.limit = Number(limit);
  if (offset) opts.offset = Number(offset);

  try {
    const sessions = await getSessions(opts);
    return NextResponse.json(sessions);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

/** POST /api/sessions — save a new session */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await insertSession({
      session_hash: body.session_hash,
      smart_account_address: body.smart_account_address,
      owner_address: body.owner_address,
      image_hash: body.image_hash,
      chain_id: Number(body.chain_id),
      expiry: Number(body.expiry),
      metadata: body.metadata ?? {},
    });
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
