import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'node:fs';
import { parseApplicationsMarkdown } from './lib/parse-applications';

const SOURCE = '/Users/USER/claude-workspace/notes/projects/job-applications.md';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const content = readFileSync(SOURCE, 'utf-8');
  const { applications, warnings } = parseApplicationsMarkdown(content);

  console.log(`Parsed ${applications.length} applications from ${SOURCE}`);
  for (const w of warnings) console.warn(`WARNING: ${w}`);

  if (dryRun) {
    for (const a of applications) {
      console.log(`[dry-run] would create: ${a.companyName} - ${a.roleTitle} (stage=${a.stage}${a.outcome ? `, outcome=${a.outcome}` : ''})`);
    }
    console.log(`Dry run complete - ${applications.length} applications would be created.`);
    return;
  }

  const { db } = await import('../src/lib/db');

  async function getOrCreateCompany(name: string): Promise<string> {
    const { data: existing } = await db.from('companies').select('id').eq('name', name).maybeSingle();
    if (existing) return existing.id;
    const { data: created, error } = await db.from('companies').insert({ name, tier: 'tier_2' }).select('id').single();
    if (error) throw new Error(`getOrCreateCompany failed for "${name}": ${error.message}`);
    return created.id;
  }

  async function findContactId(name: string | null, networkFileSlug: string | null): Promise<string | null> {
    if (networkFileSlug) {
      const { data } = await db.from('contacts').select('id').ilike('name', `%${networkFileSlug.replace(/-/g, ' ')}%`).maybeSingle();
      if (data) return data.id;
    }
    if (name) {
      const { data } = await db.from('contacts').select('id').ilike('name', name).maybeSingle();
      if (data) return data.id;
    }
    return null;
  }

  for (const a of applications) {
    const company_id = await getOrCreateCompany(a.companyName);
    const contact_id = await findContactId(a.contactName, a.networkFileSlug);
    if ((a.contactName || a.networkFileSlug) && !contact_id) {
      console.warn(`WARNING: ${a.companyName} - could not match contact "${a.contactName ?? a.networkFileSlug}", leaving contact_id null`);
    }

    const { error } = await db.from('applications').insert({
      company_id,
      contact_id,
      role_title: a.roleTitle,
      stage: a.stage,
      outcome: a.outcome,
      track: a.track,
      source: 'manual',
      notes: a.notes,
      applied_at: a.appliedAt ? new Date(a.appliedAt).toISOString() : null,
    });
    if (error) throw new Error(`Failed to insert application "${a.companyName} - ${a.roleTitle}": ${error.message}`);
    console.log(`created: ${a.companyName} - ${a.roleTitle}`);
  }

  console.log(`Done - ${applications.length} applications migrated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
