import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get('stage');

  let query = db.from('applications').select('*, companies(name)').order('created_at', { ascending: false });
  if (stage) query = query.eq('stage', stage);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function POST(req: Request) {
  const { posting_url, company_name, role_title, track } = await req.json();

  if (typeof role_title !== 'string' || !role_title.trim()) {
    return NextResponse.json({ error: 'role_title is required' }, { status: 400 });
  }

  let company_id: string | null = null;
  if (typeof company_name === 'string' && company_name.trim()) {
    const name = company_name.trim();
    const { data: existing } = await db.from('companies').select('id').eq('name', name).maybeSingle();
    if (existing) {
      company_id = existing.id;
    } else {
      const { data: created, error: createError } = await db
        .from('companies')
        .insert({ name, tier: 'tier_2' })
        .select('id')
        .single();
      if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
      company_id = created.id;
    }
  }

  const { data, error } = await db
    .from('applications')
    .insert({
      company_id,
      role_title: role_title.trim(),
      posting_url: posting_url || null,
      track: track || null,
      stage: 'queued',
      source: 'web_ui',
    })
    .select('*, companies(name)')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ application: data });
}
