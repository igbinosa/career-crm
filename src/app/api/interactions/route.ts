import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('contact_id');

  let query = db.from('interactions').select('*').order('created_at', { ascending: false });
  if (contactId) query = query.eq('contact_id', contactId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interactions: data });
}
