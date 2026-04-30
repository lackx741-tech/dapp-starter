import { NextRequest, NextResponse } from 'next/server';
import { getSessionByHash, updateSession, revokeSession } from '@/lib/db';

/** GET /api/sessions/:sessionHash */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionHash: string }> }
) {
  const { sessionHash } = await params;
  const session = await getSessionByHash(sessionHash);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(session);
}

/** PATCH /api/sessions/:sessionHash — update session */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionHash: string }> }
) {
  const { sessionHash } = await params;
  const body = await req.json();

  const updates: Parameters<typeof updateSession>[1] = {};
  if (body.action === 'mark_active') {
    updates.last_active = new Date().toISOString();
  } else if (body.action === 'increment_tx') {
    const existing = await getSessionByHash(sessionHash);
    if (existing) updates.tx_count = existing.tx_count + 1;
  } else if (body.action === 'revoke') {
    updates.is_revoked = true;
  }

  try {
    const updated = await updateSession(sessionHash, updates);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/sessions/:sessionHash — revoke session */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionHash: string }> }
) {
  const { sessionHash } = await params;
  try {
    await revokeSession(sessionHash);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
