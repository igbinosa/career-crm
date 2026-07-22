import { describe, it, expect } from 'vitest';
import { parseApplicationsMarkdown } from '../scripts/lib/parse-applications';

const fixture = `
## Tracker

| Company | Role | Stage | Contact | Network File | Date | Notes |
|---|---|---|---|---|---|---|
| Harborline | Founding Deployment Strategist | Response drafted | Alex (last name unknown) | — | 2026-06-08 | "About the role" drafted |
| Tessellate | M&A Sourcing | **Offer received** | Riley Nakamura | — | 2026-07-03 | $120M raised total; offer received July 3 |
| Fairfield Trading | Quantitative Trader | Applied | — | — | 2026-07-21 | FT track (June 2027 grad resume); via auto-apply agent |

## Status Key
- placeholder
`;

describe('parseApplicationsMarkdown', () => {
  it('parses tracker rows and maps stages', () => {
    const { applications, warnings } = parseApplicationsMarkdown(fixture);
    expect(applications).toHaveLength(3);
    expect(applications[0].stage).toBe('response_drafted');
    expect(applications[1].stage).toBe('closed');
    expect(applications[1].outcome).toBe('offer');
    expect(applications[2].stage).toBe('applied');
    expect(applications[2].track).toBe('full_time');
    expect(warnings).toHaveLength(0);
  });

  it('flags unrecognized stages instead of dropping the row', () => {
    const weird = fixture.replace('Response drafted', 'Somehow Pending');
    const { applications, warnings } = parseApplicationsMarkdown(weird);
    expect(applications[0].stage).toBe('queued');
    expect(warnings.some((w) => w.includes('unrecognized stage'))).toBe(true);
  });
});
