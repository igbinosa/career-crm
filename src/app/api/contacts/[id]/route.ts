import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: contact, error } = await db.from('contacts').select('*, companies(name)').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!contact) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: reactivation } = await db
    .from('reactivation_queue')
    .select('days_quiet')
    .eq('id', id)
    .maybeSingle();

  return NextResponse.json({ contact: { ...contact, days_quiet: reactivation?.days_quiet ?? null } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ['status', 'notes', 'follow_up_due_date', 'last_touch_date', 'role_title', 'email'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no valid fields to update' }, { status: 400 });
  }
  const { data, error } = await db.from('contacts').update(update).eq('id', id).select('*, companies(name)').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contact: data });
}
