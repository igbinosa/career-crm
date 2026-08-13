import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseContactFile } from './lib/parse-contacts';

// Override with NOTES_DIR to point at a vault in a different location.
const DIR = process.env.NOTES_DIR ?? path.join(os.homedir(), 'claude-workspace', 'notes', 'network');
const SKIP_FILES = new Set(['_template.md', 'draft-log.md', 'golden-examples.md', 'reactivation-list.md']);

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const files = readdirSync(DIR).filter((f) => f.endsWith('.md') && !SKIP_FILES.has(f));
  console.log(`Found ${files.length} contact files in ${DIR}`);

  const parsed = files.map((f) => parseContactFile(f, readFileSync(path.join(DIR, f), 'utf-8')));
  const allWarnings = parsed.flatMap((p) => p.warnings);
  for (const w of allWarnings) console.warn(`WARNING: ${w}`);

  if (dryRun) {
    for (const { contact } of parsed) {
      console.log(
        `[dry-run] would create: ${contact.name} (${contact.companyName ?? 'no company'}) ` +
        `status=${contact.status} email=${contact.email ?? 'none'} ` +
        `last_touch=${contact.lastTouchDate ?? 'unknown'} referred_by=${contact.referredBySlug ?? 'none'}`
      );
    }
    console.log(`Dry run complete - ${parsed.length} contacts would be created, ${allWarnings.length} warnings.`);
    return;
  }

  const { db } = await import('../src/lib/db');
  const slugToId = new Map<string, string>();
  const companyCache = new Map<string, string>();

  async function getOrCreateCompany(name: string): Promise<string> {
    if (companyCache.has(name)) return companyCache.get(name)!;
    const { data: existing } = await db.from('companies').select('id').eq('name', name).maybeSingle();
    if (existing) {
      companyCache.set(name, existing.id);
      return existing.id;
    }
    const { data: created, error } = await db.from('companies').insert({ name, tier: 'tier_2' }).select('id').single();
    if (error) throw new Error(`getOrCreateCompany failed for "${name}": ${error.message}`);
    companyCache.set(name, created.id);
    return created.id;
  }

  for (const { contact } of parsed) {
    const company_id = contact.companyName ? await getOrCreateCompany(contact.companyName) : null;
    const { data, error } = await db
      .from('contacts')
      .insert({
        name: contact.name,
        company_id,
        role_title: contact.roleTitle,
        email: contact.email,
        status: contact.status,
        notes: contact.notes,
        last_touch_date: contact.lastTouchDate,
        follow_up_due_date: contact.followUpDueDate,
      })
      .select('id')
      .single();
    if (error) throw new Error(`Failed to insert contact "${contact.name}": ${error.message}`);
    slugToId.set(contact.slug, data.id);
    console.log(`created: ${contact.name}`);
  }

  for (const { contact } of parsed) {
    if (!contact.referredBySlug) continue;
    const referrerId = slugToId.get(contact.referredBySlug);
    if (!referrerId) {
      console.warn(`WARNING: ${contact.name} - referred_by target "${contact.referredBySlug}" not found among migrated contacts`);
      continue;
    }
    const { error } = await db.from('contacts').update({ referred_by: referrerId }).eq('id', slugToId.get(contact.slug)!);
    if (error) throw new Error(`Failed to set referred_by for "${contact.name}": ${error.message}`);
  }

  console.log(`Done - ${parsed.length} contacts migrated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
