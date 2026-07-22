import { describe, it, expect } from 'vitest';
import { parseDraftLogMarkdown } from '../scripts/lib/parse-interactions';

const fixture = [
  '',
  '## Entries',
  '',
  '### 2026-07-15 | Nils Ostberg | nils@meridianlabs.example | Meridian Labs',
  '- Subject: Nils<>Stephen | Columbia + the raise',
  '- Scenario: cold affinity peer | Intended send: Thu 2026-07-16 | Status: **sent-edited** (sent 2026-07-16 10:21am PT)',
  '',
  '```',
  'hey Nils,',
  '',
  'Starting the MS in AI.',
  '```',
  '',
  '### 2026-07-15 | Marcus Reed | marcus.reed@brightpath.example (bcc marcus@brightpath.example) | Brightpath',
  '- Subject: Marcus<>Stephen | USC + Brightpath GTM engineering',
  '- Scenario: cold affinity peer | Intended send: ~~Thu 2026-07-16~~ rolled to Mon 2026-07-20 (sweep 7/18: unsent, draft still in Gmail) | Status: pending',
  '',
  '```',
  'Hey Marcus,',
  '',
  'This is Stephen, a fellow alum.',
  '```',
  '',
].join('\n');

describe('parseDraftLogMarkdown', () => {
  it('only migrates pending entries, excluding sent/killed ones', () => {
    const { interactions, warnings } = parseDraftLogMarkdown(fixture);
    expect(interactions).toHaveLength(1);
    expect(interactions[0].contactName).toBe('Marcus Reed');
    expect(interactions[0].email).toBe('marcus.reed@brightpath.example');
    expect(interactions[0].companyName).toBe('Brightpath');
    expect(interactions[0].intendedSendDate).toBe('2026-07-20');
    expect(interactions[0].body).toContain('fellow alum');
    expect(warnings).toHaveLength(0);
  });
});
