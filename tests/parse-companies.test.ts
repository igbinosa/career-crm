import { describe, it, expect } from 'vitest';
import { parseCompaniesMarkdown } from '../scripts/lib/parse-companies';

const fixture = `
## Tier 1 (spec-work targets)

| Company | Why | Status |
|---|---|---|
| Meridian Labs | Frontier AI lab, NYC | Contacted: Robin |
| Brightpath | GTM/data platform | Contact research run |

## Tier 2 (standard outreach)
| Company | Why | Status |
|---|---|---|
| Northwind AI | Frontier AI lab | Drafts created, unsent |
`;

describe('parseCompaniesMarkdown', () => {
  it('parses tier 1 and tier 2 rows', () => {
    const { companies, warnings } = parseCompaniesMarkdown(fixture);
    expect(companies).toHaveLength(3);
    expect(companies[0]).toEqual({
      name: 'Meridian Labs',
      tier: 'tier_1',
      why: 'Frontier AI lab, NYC',
      statusNote: 'Contacted: Robin',
    });
    expect(companies[2].tier).toBe('tier_2');
    expect(warnings).toHaveLength(0);
  });

  it('warns when nothing parses', () => {
    const { companies, warnings } = parseCompaniesMarkdown('# Empty\nnothing here');
    expect(companies).toHaveLength(0);
    expect(warnings.length).toBeGreaterThan(0);
  });
});
