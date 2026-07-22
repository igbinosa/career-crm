export interface ParsedCompany {
  name: string;
  tier: 'tier_1' | 'tier_2';
  why: string | null;
  statusNote: string | null;
}

export interface ParseCompaniesResult {
  companies: ParsedCompany[];
  warnings: string[];
}

function cleanCell(cell: string): string {
  return cell.trim().replace(/^\*\*|\*\*$/g, '');
}

export function parseCompaniesMarkdown(content: string): ParseCompaniesResult {
  const lines = content.split('\n');
  const companies: ParsedCompany[] = [];
  const warnings: string[] = [];
  let tier: 'tier_1' | 'tier_2' | null = null;

  for (const line of lines) {
    if (/^##\s+Tier 1/i.test(line)) { tier = 'tier_1'; continue; }
    if (/^##\s+Tier 2/i.test(line)) { tier = 'tier_2'; continue; }
    if (/^##\s+/.test(line)) { tier = null; continue; }

    if (!tier) continue;
    if (!line.trim().startsWith('|')) continue;

    const cells = line.split('|').slice(1, -1).map(cleanCell);
    if (cells.length < 3) continue;
    if (cells[0].toLowerCase() === 'company') continue;
    if (/^-+$/.test(cells[0])) continue;

    const [name, why, statusNote] = cells;
    if (!name) continue;

    companies.push({
      name,
      tier,
      why: why || null,
      statusNote: statusNote || null,
    });
  }

  if (companies.length === 0) {
    warnings.push('No companies parsed - check the Tier 1/Tier 2 headers and table format');
  }

  return { companies, warnings };
}
