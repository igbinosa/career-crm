import { describe, it, expect } from 'vitest';
import { parseContactFile } from '../scripts/lib/parse-contacts';

const dana = `# Dana Whitfield
**Last updated:** 2026-02-28
**Status:** Active

## Info
- Role: Managing Partner, Northgate Ventures (University Fund)
- Contact: via Alumni Ventures — https://example.com/people/dana-whitfield

## Related
- Projects: [[xaman]]
- Referred by: —

## Conversation History
- 2026-02-28: Identified via find-contacts. Outreach drafted, pending send.

## Context / Notes
- State University business and accounting programs

## Follow-ups
- Follow up if no response by: 2026-03-13
`;

const robin = `# Robin Ellery (Meridian Labs)
**Last updated:** 2026-07-15
**Status:** Active - awaiting reply

## Info
- Role / Company: Meridian Labs (role TBD)
- Contact: robin@meridianlabs.example

## Related
- Projects: [[outreach-system]]
- Company thread: [[nils-ostberg]]

## Conversation History
- Jul 15, 2026: Cold intro sent from USC email

## Context / Notes
- GI now has multiple concurrent threads

## Follow-ups
- Follow-up due ~Jul 25-29 if no reply, only with something genuinely new.
`;

describe('parseContactFile', () => {
  it('extracts structured fields from a file with only a Role line', () => {
    const { contact, warnings } = parseContactFile('dana-whitfield.md', dana);
    expect(contact.name).toBe('Dana Whitfield');
    expect(contact.status).toBe('active');
    expect(contact.companyName).toBe('Northgate Ventures (University Fund)');
    expect(contact.email).toBeNull();
    expect(contact.referredBySlug).toBeNull();
    expect(contact.lastTouchDate).toBe('2026-02-28');
    expect(contact.followUpDueDate).toBe('2026-03-13');
    expect(warnings.some((w) => w.includes('no email found'))).toBe(true);
  });

  it('extracts company from a Role / Company line and flags an unparseable follow-up', () => {
    const { contact, warnings } = parseContactFile('robin-ellery.md', robin);
    expect(contact.companyName).toBe('Meridian Labs');
    expect(contact.email).toBe('robin@meridianlabs.example');
    expect(contact.status).toBe('active');
    expect(contact.lastTouchDate).toBe('2026-07-15');
    expect(contact.followUpDueDate).toBeNull();
    expect(warnings.some((w) => w.includes('Follow-ups section has content'))).toBe(true);
  });

  it('preserves the full file body in notes as a non-lossy safety net', () => {
    const { contact } = parseContactFile('dana-whitfield.md', dana);
    expect(contact.notes).toContain('Northgate School Accounting');
    expect(contact.notes).toContain('Follow up if no response by');
  });
});
