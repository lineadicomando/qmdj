import type { Location } from '@qimendunjia/geo';

/**
 * A scan, as it travels in the address.
 *
 * The same bargain `moment.ts` makes, for the other question. What a person
 * asked is in the URL and nowhere else, so a scan is shareable, survives a
 * reload, and needs nothing kept in the browser.
 *
 * It does **not** share `MomentInput`, though it borrows the place from it.
 * The other two sections ask different questions of one instant and hand that
 * instant to one another; this one takes an interval and answers with many
 * instants. Forcing the two into one type would give a moment a `from` it
 * never uses and an interval a `time` that means nothing.
 *
 * Only types are imported: a value import from `geo` would drag SQLite into
 * the browser bundle.
 */

export interface IntervalInput {
  /** ISO `YYYY-MM-DD`, whatever the locale. */
  from: string;
  to: string;
  place?: Location;
  trueSolarTime: boolean;
  dayBoundary: string;
}

/** What is being looked for, as identifiers the engine knows. */
export interface CriteriaInput {
  gate: string;
  star: string;
  spirit: string;
  minStrength: string;
  towards: string[];
  without: string[];
}

export const EMPTY_CRITERIA: CriteriaInput = {
  gate: '',
  star: '',
  spirit: '',
  minStrength: '',
  towards: [],
  without: [],
};

/** What the address says, before the place has a name. */
export function readInterval(url: URL): {
  input: Omit<IntervalInput, 'place'>;
  criteria: CriteriaInput;
  locationId: string | null;
} {
  const params = url.searchParams;
  const list = (name: string): string[] =>
    (params.get(name) ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

  return {
    input: {
      from: params.get('from') ?? '',
      to: params.get('to') ?? '',
      trueSolarTime: params.get('trueSolarTime') !== 'false',
      dayBoundary: params.get('dayBoundary') === 'midnight' ? 'midnight' : 'zishi',
    },
    criteria: {
      gate: params.get('gate') ?? '',
      star: params.get('star') ?? '',
      spirit: params.get('spirit') ?? '',
      minStrength: params.get('minStrength') ?? '',
      towards: list('towards'),
      without: list('without'),
    },
    locationId: params.get('locationId'),
  };
}

/**
 * The address of a scan.
 *
 * Defaults are left out, so the plainest question has the plainest address —
 * and so an empty criteria set does not fill the URL with empty parameters.
 */
export function intervalQuery(
  input: IntervalInput,
  criteria: CriteriaInput = EMPTY_CRITERIA,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  if (input.from) params.set('from', input.from);
  if (input.to) params.set('to', input.to);
  if (input.place) params.set('locationId', String(input.place.id));
  if (!input.trueSolarTime) params.set('trueSolarTime', 'false');
  if (input.dayBoundary !== 'zishi') params.set('dayBoundary', input.dayBoundary);

  if (criteria.gate) params.set('gate', criteria.gate);
  if (criteria.star) params.set('star', criteria.star);
  if (criteria.spirit) params.set('spirit', criteria.spirit);
  if (criteria.minStrength) params.set('minStrength', criteria.minStrength);
  if (criteria.towards.length) params.set('towards', criteria.towards.join(','));
  if (criteria.without.length) params.set('without', criteria.without.join(','));

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/**
 * The moment a row of the answer stands for, as `/[lang]` takes it.
 *
 * The scan says when and which way; the chart section says everything else,
 * and a reader who has found an hour wants the whole board for it without
 * typing the date again.
 */
export function chartQuery(
  start: string,
  input: IntervalInput,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  params.set('date', start.slice(0, 10));
  params.set('time', start.slice(11, 16));
  if (input.place) params.set('locationId', String(input.place.id));
  if (!input.trueSolarTime) params.set('trueSolarTime', 'false');
  if (input.dayBoundary !== 'zishi') params.set('dayBoundary', input.dayBoundary);

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/** A week from today, which is the interval somebody arriving here means. */
export function defaultInterval(): { from: string; to: string } {
  const today = new Date();
  const week = new Date(today.getTime() + 7 * 86_400_000);
  const iso = (date: Date): string => date.toISOString().slice(0, 10);
  return { from: iso(today), to: iso(week) };
}
