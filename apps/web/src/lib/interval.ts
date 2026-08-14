import type { Location } from '@qimendunjia/geo';
import { PALACES } from './vocabulary.js';

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
  /**
   * `HH:mm`, opening and closing the two days. Empty means midnight, which is
   * what `from` naming a day means: all of it. The form does not offer them,
   * but the server honours them, and an address that carries them must come
   * back out of this page still asking the same question.
   */
  fromTime: string;
  toTime: string;
  place?: Location;
  trueSolarTime: boolean;
  dayBoundary: string;
  /** How the ju is determined. Verbatim, as in `MomentInput`. */
  method: string;
  /** Where the third of the term is counted from, under chaibu. Carried
   * verbatim, as in `MomentInput`: it moves the ju on most days. */
  yuan: string;
}

/** What is being looked for, as identifiers the engine knows. */
export interface CriteriaInput {
  gate: string;
  star: string;
  spirit: string;
  minStrength: string;
  towards: string[];
  without: string[];
  /**
   * 本命 — a date of birth, admitting only the palaces its year pillar stands
   * on. A criterion like the others and not a mode: it says which palaces are
   * this person's, and the rest say what makes one worth standing in.
   */
  born: string;
}

export const EMPTY_CRITERIA: CriteriaInput = {
  gate: '',
  star: '',
  spirit: '',
  minStrength: '',
  towards: [],
  without: [],
  born: '',
};

/**
 * An hour set aside, which is an hour **and a palace**.
 *
 * A reader scans an interval, narrows it, scans it again, and wants to hold
 * on to the few answers worth comparing. What they held on to is not a run:
 * an interval does not contain a good hour, it contains an hour in which
 * something stands to the southeast, and a shortlist of bare times would
 * throw away the half of the answer this section exists for.
 *
 * It lives in the address, like everything else here. That is what makes a
 * shortlist shareable and what a reload comes back to — and it is the only
 * place it can live, since the privacy note promises that nothing typed is
 * written to this browser, and a stretch of somebody's calendar on disk would
 * be a different promise than the one already published.
 */
export interface Kept {
  /** The minute the run opens, `YYYY-MM-DDTHH:MM`, local at the place. */
  start: string;
  /** The palace, by the engine's identifier. */
  palace: string;
}

/**
 * The minute names the hour, because the whole section already names it that
 * way: the link to a board carries `time=04:10`, and the runs it points at
 * are bisected to the minute and never shorter than a double hour. Seconds
 * and an offset would be thirteen more characters of address saying the same
 * thing.
 */
export function keptKey(start: string, palace: string): string {
  return `${start.slice(0, 16)}@${palace}`;
}

const KEPT = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})@([a-z]+)$/;
const PALACE_IDS: ReadonlySet<string> = new Set(PALACES.map((palace) => palace.id));

/**
 * The shortlist, read out of the address.
 *
 * Anything malformed is dropped rather than refused: a truncated link is
 * still a link to a scan, and losing an hour off the end of one is a smaller
 * failure than a page that will not open. A palace the engine never had is
 * malformed too — the strip names it out of `PALACES` and would otherwise
 * print a key.
 *
 * Sorted and deduplicated on the way in, so the same set of hours is the same
 * address however it was collected.
 */
export function readKept(url: URL): Kept[] {
  const seen = new Map<string, Kept>();

  for (const entry of (url.searchParams.get('kept') ?? '').split(',')) {
    const found = KEPT.exec(entry.trim());
    if (!found || !PALACE_IDS.has(found[2])) continue;
    seen.set(entry.trim(), { start: found[1], palace: found[2] });
  }

  return sortKept([...seen.values()]);
}

/**
 * In the order of the clock, wherever the shortlist came from.
 *
 * A person ticks boxes in whatever order they read the table, and by the time
 * there are six the order they were ticked in tells nobody anything. Times
 * read as times. It also makes the same set of hours the same address, which
 * is what a shared link ought to be.
 */
export function sortKept(kept: readonly Kept[]): Kept[] {
  return [...kept].sort(
    (one, other) => one.start.localeCompare(other.start) || one.palace.localeCompare(other.palace),
  );
}

/** The shortlist as the one address field that carries it. */
export function keptParam(kept: readonly Kept[]): string {
  return kept.map((entry) => keptKey(entry.start, entry.palace)).join(',');
}

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
      fromTime: params.get('fromTime') ?? '',
      toTime: params.get('toTime') ?? '',
      trueSolarTime: params.get('trueSolarTime') !== 'false',
      dayBoundary: params.get('dayBoundary') === 'midnight' ? 'midnight' : 'zishi',
      method: params.get('method') ?? 'chaibu',
      yuan: params.get('yuan') ?? 'term',
    },
    criteria: {
      gate: params.get('gate') ?? '',
      star: params.get('star') ?? '',
      spirit: params.get('spirit') ?? '',
      minStrength: params.get('minStrength') ?? '',
      towards: list('towards'),
      without: list('without'),
      born: params.get('born') ?? '',
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
    born: criteria.born,
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
  if (input.fromTime) params.set('fromTime', input.fromTime);
  if (input.toTime) params.set('toTime', input.toTime);
  if (input.place) params.set('locationId', String(input.place.id));
  if (!input.trueSolarTime) params.set('trueSolarTime', 'false');
  if (input.dayBoundary !== 'zishi') params.set('dayBoundary', input.dayBoundary);
  if (input.method && input.method !== 'chaibu') params.set('method', input.method);
  if (input.yuan && input.yuan !== 'term') params.set('yuan', input.yuan);

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
 * It used to carry the whole scan alongside, so that the chart section could
 * offer a way back to it. The board over the list now holds the whole reading
 * and nobody makes that journey: what was left was a dozen parameters riding
 * in an address for no reader, which is how an address stops being legible.
 * `extra` remains for what a caller genuinely appends — the locale and the
 * scheme, when the address is a drawing's.
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
  if (input.yuan && input.yuan !== 'term') params.set('yuan', input.yuan);

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/**
 * A week from today, which is the interval somebody arriving here means.
 *
 * Today by the clock on the wall, not by UTC: `toISOString` read the UTC
 * date, and a reader west of Greenwich in the evening was offered a `from`
 * of tomorrow. Plain `Date` accessors, because this runs in the browser and
 * the client imports no calendar library — and `setDate` rather than adding
 * milliseconds, so a summer-time change cannot shave the week short.
 */
export function defaultInterval(): { from: string; to: string } {
  const today = new Date();
  const week = new Date(today);
  week.setDate(week.getDate() + 7);
  const iso = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { from: iso(today), to: iso(week) };
}
