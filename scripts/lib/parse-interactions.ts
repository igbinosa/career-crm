import { lastDateInOrder } from './dates';

export interface ParsedInteraction {
  date: string;
  contactName: string;
  email: string | null;
  companyName: string;
  subject: string | null;
  scenario: string | null;
  intendedSendDate: string | null;
  body: string;
}

export interface ParseInteractionsResult {
  interactions: ParsedInteraction[];
  warnings: string[];
}

function stripMarkup(text: string): string {
  return text.replace(/\*\*/g, '').replace(/~~[^~]*~~/g, '').trim();
}

export function parseDraftLogMarkdown(content: string): ParseInteractionsResult {
  const entriesSection = content.split(/^## Entries\s*$/mi)[1] ?? '';
  const blocks = entriesSection.split(/^### /m).slice(1);
  const interactions: ParsedInteraction[] = [];
  const warnings: string[] = [];

  for (const block of blocks) {
    const headerLine = block.split('\n')[0];
    const headerParts = headerLine.split('|').map((p) => p.trim());
    if (headerParts.length < 4) {
      warnings.push(`Skipped malformed entry header: "${headerLine}"`);
      continue;
    }
    const [date, contactName, emailPart, companyName] = headerParts;
    const emailMatch = emailPart.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const email = emailMatch ? emailMatch[0] : null;

    const statusLine = block.match(/^-\s*Scenario:\s*(.+?)\s*\|\s*Intended send:\s*(.+?)\s*\|\s*Status:\s*(.+)$/mi);
    if (!statusLine) {
      warnings.push(`${contactName}: no Scenario/Status line found, skipped`);
      continue;
    }
    const scenario = stripMarkup(statusLine[1]);
    const intendedSendRaw = statusLine[2];
    const statusRaw = stripMarkup(statusLine[3]).split(/[\s(]/)[0].toLowerCase();

    if (statusRaw !== 'pending') continue;

    const subjectMatch = block.match(/^-\s*Subject:\s*(.+)$/mi);
    const subject = subjectMatch ? subjectMatch[1].trim() : null;

    const bodyMatch = block.match(/```\n([\s\S]*?)```/);
    if (!bodyMatch) {
      warnings.push(`${contactName}: pending entry with no fenced body block, skipped`);
      continue;
    }
    const body = bodyMatch[1].trim();

    interactions.push({
      date,
      contactName,
      email,
      companyName,
      subject,
      scenario,
      intendedSendDate: lastDateInOrder(intendedSendRaw),
      body,
    });
  }

  return { interactions, warnings };
}
