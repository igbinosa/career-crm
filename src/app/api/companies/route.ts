import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const { data, error } = await db
    .from('companies')
    .select('*')
    .eq('archived', false)
    .order('tier', { ascending: true })
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ companies: data });
}

export async function POST(req: Request) {
  const { name, tier, why } = await req.json();
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const { data, error } = await db
    .from('companies')
    .insert({ name: name.trim(), tier: tier === 'tier_1' ? 'tier_1' : 'tier_2', why: why || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company: data });
}
