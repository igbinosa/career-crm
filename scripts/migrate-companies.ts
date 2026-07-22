import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'node:fs';
import { parseCompaniesMarkdown } from './lib/parse-companies';

const SOURCE = '/Users/USER/claude-workspace/notes/projects/target-companies.md';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const content = readFileSync(SOURCE, 'utf-8');
  const { companies, warnings } = parseCompaniesMarkdown(content);

  console.log(`Parsed ${companies.length} companies from ${SOURCE}`);
  for (const w of warnings) console.warn(`WARNING: ${w}`);

  if (dryRun) {
    for (const c of companies) {
      console.log(`[dry-run] would create: ${c.name} (${c.tier}) - why: ${c.why ?? 'none'} - status: ${c.statusNote ?? 'none'}`);
    }
    console.log('Dry run complete - no rows written.');
    return;
  }

  const { db } = await import('../src/lib/db');
  for (const c of companies) {
    const { error } = await db
      .from('companies')
      .upsert({ name: c.name, tier: c.tier, why: c.why, status_note: c.statusNote }, { onConflict: 'name' });
    if (error) throw new Error(`Failed to insert "${c.name}": ${error.message}`);
    console.log(`created: ${c.name}`);
  }
  console.log(`Done - ${companies.length} companies migrated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
