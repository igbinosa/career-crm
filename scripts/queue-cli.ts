import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { db } = await import('../src/lib/db');
  const [, , command, ...rest] = process.argv;

  if (command === 'list-queued') {
    const { data, error } = await db
      .from('applications')
      .select('id, role_title, posting_url, track, company_id, created_at')
      .eq('stage', 'queued')
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    console.log(JSON.stringify(data ?? [], null, 2));
    return;
  }

  if (command === 'list-escalated') {
    const { data, error } = await db
      .from('applications')
      .select('id, role_title, posting_url, escalation_note, company_id, created_at')
      .eq('stage', 'escalated')
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    console.log(JSON.stringify(data ?? [], null, 2));
    return;
  }

  if (command === 'mark') {
    const [id, stage] = rest;
    const noteIdx = rest.indexOf('--note');
    const note = noteIdx !== -1 ? rest[noteIdx + 1] : undefined;
    const deadlineIdx = rest.indexOf('--deadline');
    const deadline = deadlineIdx !== -1 ? rest[deadlineIdx + 1] : undefined;

    if (!id || !stage) {
      console.error('usage: mark <id> <stage> [--note "text"] [--deadline "ISO8601"]');
      process.exit(1);
    }

    const update: Record<string, unknown> = { stage };
    if (stage === 'applied') update.applied_at = new Date().toISOString();
    if (stage === 'escalated' && note !== undefined) update.escalation_note = note;
    else if (note !== undefined) update.notes = note;
    if (stage === 'assessment_pending' && deadline !== undefined) update.assessment_deadline = deadline;

    const { error } = await db.from('applications').update(update).eq('id', id);
    if (error) throw new Error(error.message);
    console.log(`marked ${id} -> ${stage}${note ? ` (note: ${note})` : ''}${deadline ? ` (deadline: ${deadline})` : ''}`);
    return;
  }

  console.error('usage: queue-cli.ts <list-queued|list-escalated|mark> ...');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
