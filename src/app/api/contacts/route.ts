import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const { data, error } = await db
    .from('contacts')
    .select('*, companies(name)')
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data });
}
