import { mostRecentDate, parseFlexibleDate } from './dates';

export interface ParsedContact {
  slug: string;
  name: string;
  companyName: string | null;
  roleTitle: string | null;
  email: string | null;
  status: 'active' | 'dormant' | 'closed';
  referredBySlug: string | null;
  notes: string;
  lastTouchDate: string | null;
  followUpDueDate: string | null;
}

export interface ParseContactResult {
  contact: ParsedContact;
  warnings: string[];
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const WIKILINK_RE = /\[\[([^\]]+)\]\]/;

function section(content: string, heading: string): string | null {
  const re = new RegExp(`^##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'mi');
  const match = content.match(re);
  return match ? match[1].trim() : null;
}

export function parseContactFile(filename: string, content: string): ParseContactResult {
  const slug = filename.replace(/\.md$/, '');
  const warnings: string[] = [];

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const name = titleMatch ? titleMatch[1].trim() : slug;
  if (!titleMatch) warnings.push(`${slug}: no H1 title found, using filename as name`);

  const statusMatch = content.match(/^\*\*Status:\*\*\s*(.+)$/mi);
  const rawStatus = statusMatch ? statusMatch[1].trim() : '';
  let status: 'active' | 'dormant' | 'closed' = 'active';
  if (/^dormant/i.test(rawStatus)) status = 'dormant';
  else if (/^closed/i.test(rawStatus)) status = 'closed';
  else if (/^active/i.test(rawStatus)) status = 'active';
  else warnings.push(`${slug}: could not classify status from "${rawStatus}", defaulted to active`);

  const infoSection = section(content, 'Info') ?? '';
  const companyLineMatch = infoSection.match(/^-\s*(?:Role\s*\/\s*Company|Company)\s*:\s*(.+)$/mi);
  let companyName: string | null = null;
  let roleTitle: string | null = null;
  if (companyLineMatch) {
    companyName = companyLineMatch[1].trim().split(/\s*[-–—(]/)[0].trim() || null;
  } else {
    const roleLineMatch = infoSection.match(/^-\s*Role\s*:\s*(.+)$/mi);
    if (roleLineMatch) {
      roleTitle = roleLineMatch[1].trim();
      const commaSplit = roleTitle.split(',');
      if (commaSplit.length > 1) companyName = commaSplit[1].trim();
    }
  }
  if (!companyName) {
    const parenMatch = name.match(/\(([^)]+)\)\s*$/);
    if (parenMatch) companyName = parenMatch[1].trim();
  }
  if (!companyName) warnings.push(`${slug}: no company could be extracted, will migrate with company_id = null`);

  const contactLineMatch = infoSection.match(/^-\s*Contact\s*:\s*(.+)$/mi);
  const emailMatch = contactLineMatch ? contactLineMatch[1].match(EMAIL_RE) : content.match(EMAIL_RE);
  const email = emailMatch ? emailMatch[0] : null;
  if (!email) warnings.push(`${slug}: no email found`);

  const relatedSection = section(content, 'Related') ?? '';
  const referredByLineMatch = relatedSection.match(/^-\s*Referred by\s*:\s*(.+)$/mi);
  let referredBySlug: string | null = null;
  if (referredByLineMatch) {
    const wikiMatch = referredByLineMatch[1].match(WIKILINK_RE);
    if (wikiMatch) referredBySlug = wikiMatch[1].trim();
  }

  const historySection = section(content, 'Conversation History') ?? '';
  const lastTouchDate = historySection ? mostRecentDate(historySection) : null;
  if (historySection && !lastTouchDate) warnings.push(`${slug}: Conversation History present but no parseable date`);

  const followUpSection = section(content, 'Follow-ups') ?? '';
  const followUpDueDate = followUpSection ? parseFlexibleDate(followUpSection) : null;
  if (followUpSection.trim() && followUpSection.trim() !== '-' && !followUpDueDate) {
    warnings.push(`${slug}: Follow-ups section has content but no parseable date - review manually: "${followUpSection.trim().slice(0, 80)}"`);
  }

  const firstLineBreak = content.indexOf('\n');
  const notes = (firstLineBreak === -1 ? '' : content.slice(firstLineBreak + 1)).trim();

  return {
    contact: { slug, name, companyName, roleTitle, email, status, referredBySlug, notes, lastTouchDate, followUpDueDate },
    warnings,
  };
}
