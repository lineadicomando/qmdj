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
  /** How the ju is determined. Verbatim, as in `MomentInput`. */
  method: string;
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
      method: params.get('method') ?? 'chaibu',
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

/** The criteria as plain address fields. Empty ones are dropped by the caller. */
function criteriaFields(criteria: CriteriaInput): Record<string, string | undefined> {
  return {
    gate: criteria.gate,
    star: criteria.star,
    spirit: criteria.spirit,
    minStrength: criteria.minStrength,
    towards: criteria.towards.join(','),
    without: criteria.without.join(','),
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
  if (input.method && input.method !== 'chaibu') params.set('method', input.method);

  for (const [key, value] of Object.entries({ ...criteriaFields(criteria), ...extra })) {
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
 *
 * `extra` is where the scan itself rides along — see `criteriaFields` and
 * `scanQuery`. The chart page ignores those parameters when it casts, and
 * uses them for one thing only: knowing there is a scan to go back to.
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
  if (input.method && input.method !== 'chaibu') params.set('method', input.method);

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/**
 * The scan, as another address carries it.
 *
 * Made out of `intervalQuery` rather than assembled by hand: what rides along
 * is then, by construction, the very address `scanQuery` reads back out. A
 * criterion added to the scan and forgotten here cannot happen — and the
 * round trip is asserted, so a name added to one list and not to the other
 * fails a test rather than quietly returning somebody to a different scan.
 */
export function scanCarry(
  input: IntervalInput,
  criteria: CriteriaInput = EMPTY_CRITERIA,
): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(intervalQuery(input, criteria)));
}

/**
 * The fields of a scan, read back out of whatever address carries them.
 *
 * The two sections do not collide: `readMoment` reads `date`, `time` and the
 * three options, `readInterval` reads the interval and the criteria, and the
 * three they share hold the same value in both — `chartQuery` copies them
 * from the very interval the scan ran on. So a chart's address can carry a
 * whole scan alongside its own moment, with nothing nested and nothing
 * re-encoded, and the chart page reads straight past it.
 */
export function scanFields(url: URL): Record<string, string | undefined> {
  const fields: Record<string, string | undefined> = {};
  for (const name of SCAN_FIELDS) {
    // Only what is there: `trueSolarTime` is written solely when it is off,
    // and an address that spelled out every default would say less clearly.
    const value = url.searchParams.get(name);
    if (value) fields[name] = value;
  }
  return fields;
}

/**
 * The scan a chart was reached from, if it was reached from one.
 *
 * Two dates are what makes it a scan: without them there is nothing to
 * return to, and the reader arrived at the chart some other way.
 */
export function scanQuery(url: URL): string | undefined {
  const fields = scanFields(url);
  if (!fields.from || !fields.to) return undefined;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

const SCAN_FIELDS = [
  'from',
  'to',
  'locationId',
  'trueSolarTime',
  'dayBoundary',
  'method',
  'gate',
  'star',
  'spirit',
  'minStrength',
  'towards',
  'without',
] as const;

/** A week from today, which is the interval somebody arriving here means. */
export function defaultInterval(): { from: string; to: string } {
  const today = new Date();
  const week = new Date(today.getTime() + 7 * 86_400_000);
  const iso = (date: Date): string => date.toISOString().slice(0, 10);
  return { from: iso(today), to: iso(week) };
}
