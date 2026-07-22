import { parseFlexibleDate } from './dates';

export interface ParsedApplication {
  companyName: string;
  roleTitle: string;
  stage: string;
  outcome: 'offer' | 'rejection' | 'withdrawn' | null;
  contactName: string | null;
  networkFileSlug: string | null;
  appliedAt: string | null;
  notes: string | null;
  track: 'internship' | 'full_time' | null;
}

export interface ParseApplicationsResult {
  applications: ParsedApplication[];
  warnings: string[];
}

const STAGE_MAP: Record<string, string> = {
  'response drafted': 'response_drafted',
  'applied': 'applied',
  'messaged': 'messaged',
  'responded': 'responded',
  'interviewing': 'interviewing',
  'closed': 'closed',
};

const APPLIED_ELIGIBLE_STAGES = new Set(['applied', 'messaged', 'responded', 'interviewing', 'closed']);

function cleanCell(cell: string): string {
  return cell.trim().replace(/\*\*/g, '');
}

export function parseApplicationsMarkdown(content: string): ParseApplicationsResult {
  const lines = content.split('\n');
  const applications: ParsedApplication[] = [];
  const warnings: string[] = [];
  let inTracker = false;

  for (const line of lines) {
    if (/^##\s+Tracker/i.test(line)) { inTracker = true; continue; }
    if (/^##\s+/.test(line) && inTracker) break;
    if (!inTracker) continue;
    if (!line.trim().startsWith('|')) continue;

    const rawCells = line.split('|').slice(1, -1).map(cleanCell);
    if (rawCells.length < 7) continue;
    if (rawCells[0].toLowerCase() === 'company') continue;
    if (/^-+$/.test(rawCells[0])) continue;

    const [company, role, stageRaw, contact, networkFile, date, notes] = rawCells;
    if (!company || company === '—') continue;

    let outcome: 'offer' | 'rejection' | 'withdrawn' | null = null;
    let stage = STAGE_MAP[stageRaw.toLowerCase()];
    if (!stage) {
      if (/offer/i.test(stageRaw)) { stage = 'closed'; outcome = 'offer'; }
      else if (/reject/i.test(stageRaw)) { stage = 'closed'; outcome = 'rejection'; }
      else if (/withdraw/i.test(stageRaw)) { stage = 'closed'; outcome = 'withdrawn'; }
      else {
        stage = 'queued';
        warnings.push(`${company}/${role}: unrecognized stage "${stageRaw}", defaulted to queued`);
      }
    }

    let track: 'internship' | 'full_time' | null = null;
    if (/\bFT\b|full[\s-]?time/i.test(notes)) track = 'full_time';
    else if (/intern/i.test(notes) || /intern/i.test(role)) track = 'internship';

    const networkFileSlug = networkFile && networkFile !== '—'
      ? networkFile.match(/\[\[([^\]]+)\]\]/)?.[1] ?? null
      : null;

    const appliedAt = APPLIED_ELIGIBLE_STAGES.has(stage) && date && date !== '—'
      ? parseFlexibleDate(date)
      : null;

    applications.push({
      companyName: company,
      roleTitle: role || 'Unknown role',
      stage,
      outcome,
      contactName: contact && contact !== '—' ? contact : null,
      networkFileSlug,
      appliedAt,
      notes: notes || null,
      track,
    });
  }

  return { applications, warnings };
}
