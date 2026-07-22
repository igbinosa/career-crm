const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function parseFlexibleDate(text: string): string | null {
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const long = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i);
  if (long) {
    const month = MONTHS[long[1].toLowerCase()];
    return `${long[3]}-${pad(month)}-${pad(Number(long[2]))}`;
  }

  return null;
}

function findDateMatches(text: string): { index: number; value: string }[] {
  const matches: { index: number; value: string }[] = [];
  const isoRe = /\b\d{4}-\d{2}-\d{2}\b/g;
  const longRe = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/gi;
  for (const m of text.matchAll(isoRe)) matches.push({ index: m.index!, value: m[0] });
  for (const m of text.matchAll(longRe)) {
    const parsed = parseFlexibleDate(m[0]);
    if (parsed) matches.push({ index: m.index!, value: parsed });
  }
  return matches;
}

export function mostRecentDate(text: string): string | null {
  const matches = findDateMatches(text);
  if (matches.length === 0) return null;
  return matches.map((m) => m.value).sort().at(-1) ?? null;
}

export function lastDateInOrder(text: string): string | null {
  const matches = findDateMatches(text);
  if (matches.length === 0) return null;
  matches.sort((a, b) => a.index - b.index);
  return matches.at(-1)!.value;
}
