import { describe, it, expect } from 'vitest';
import { parseFlexibleDate, mostRecentDate, lastDateInOrder } from '../scripts/lib/dates';

describe('parseFlexibleDate', () => {
  it('parses ISO dates', () => {
    expect(parseFlexibleDate('Follow up if no response by: 2026-03-13')).toBe('2026-03-13');
  });

  it('parses long-form dates', () => {
    expect(parseFlexibleDate('Jul 15, 2026: Cold intro sent')).toBe('2026-07-15');
  });

  it('returns null when no date present', () => {
    expect(parseFlexibleDate('no date here')).toBeNull();
  });
});

describe('mostRecentDate', () => {
  it('returns the latest of several dates regardless of order in the text', () => {
    const text = '- 2026-02-28: first\n- Jul 15, 2026: second\n- 2026-03-01: third';
    expect(mostRecentDate(text)).toBe('2026-07-15');
  });
});

describe('lastDateInOrder', () => {
  it('prefers the date that appears last in the text, not the max value', () => {
    const text = '~~Thu 2026-07-16~~ rolled to Mon 2026-07-20';
    expect(lastDateInOrder(text)).toBe('2026-07-20');
  });
});
