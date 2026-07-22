import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'node:fs';
import { parseDraftLogMarkdown } from './lib/parse-interactions';

const SOURCE = '/Users/USER/claude-workspace/notes/network/draft-log.md';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const content = readFileSync(SOURCE, 'utf-8');
  const { interactions, warnings } = parseDraftLogMarkdown(content);

  console.log(`Parsed ${interactions.length} pending interactions from ${SOURCE}`);
  for (const w of warnings) console.warn(`WARNING: ${w}`);

  if (dryRun) {
    for (const i of interactions) {
      console.log(`[dry-run] would create: ${i.contactName} (${i.companyName}) - "${i.subject ?? 'no subject'}" - intended ${i.intendedSendDate ?? 'unknown'}`);
    }
    console.log(`Dry run complete - ${interactions.length} interactions would be created.`);
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

  let created = 0;
  let skipped = 0;

  for (const i of interactions) {
    let contact_id: string | null = null;
    if (i.email) {
      const { data } = await db.from('contacts').select('id').ilike('email', i.email).maybeSingle();
      contact_id = data?.id ?? null;
    }
    if (!contact_id) {
      const { data } = await db.from('contacts').select('id').ilike('name', i.contactName).maybeSingle();
      contact_id = data?.id ?? null;
    }
    if (!contact_id) {
      console.warn(`WARNING: no contact match for "${i.contactName}" (${i.email ?? 'no email'}) - skipping interaction`);
      skipped += 1;
      continue;
    }

    const company_id = await getOrCreateCompany(i.companyName);
    const { error } = await db.from('interactions').insert({
      contact_id,
      company_id,
      channel: 'email',
      direction: 'outbound',
      status: 'drafted',
      scenario: i.scenario,
      subject: i.subject,
      body: i.body,
      intended_send_date: i.intendedSendDate,
    });
    if (error) throw new Error(`Failed to insert interaction for "${i.contactName}": ${error.message}`);
    created += 1;
    console.log(`created: ${i.contactName} - ${i.subject ?? 'no subject'}`);
  }

  console.log(`Done - ${created} interactions migrated, ${skipped} skipped (no contact match).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
