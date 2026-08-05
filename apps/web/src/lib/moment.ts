import type { Location } from '@qimendunjia/geo';
import type { MessageKey, MessageParams, Translator } from '@qimendunjia/i18n';

/**
 * The moment, as it travels in the address.
 *
 * Both sections ask the same question of the same instant, and the API takes
 * that instant in one form only — a query string. So it is read and written
 * here rather than twice over, and the address of a page is exactly the
 * address of the answer.
 *
 * That is what makes a chart shareable, what lets the two sections hand a
 * moment to one another, and what survives a reload. Nothing is kept in the
 * browser to achieve it: what a person types goes in the address and nowhere
 * else, which is what the privacy note says and now what the code does.
 *
 * Only types are imported here. A value import from `geo` would drag SQLite
 * into the browser bundle.
 */

export type { Location };

export interface MomentInput {
  /** ISO `YYYY-MM-DD`, whatever the locale: a shared address means one thing. */
  date: string;
  /** `HH:mm`. */
  time: string;
  place?: Location;
  trueSolarTime: boolean;
  dayBoundary: string;
}

/** A failure as it crosses HTTP: a code with parameters, never prose. */
export interface Failure {
  code?: string;
  message: string;
  messageKey?: MessageKey;
  params?: MessageParams;
}

/** What the address says, before the place has a name. */
export function readMoment(url: URL): {
  input: Omit<MomentInput, 'place'>;
  locationId: string | null;
} {
  const params = url.searchParams;
  return {
    input: {
      date: params.get('date') ?? '',
      time: params.get('time') ?? '',
      trueSolarTime: params.get('trueSolarTime') !== 'false',
      dayBoundary: params.get('dayBoundary') === 'midnight' ? 'midnight' : 'zishi',
    },
    locationId: params.get('locationId'),
  };
}

/**
 * The address of a moment.
 *
 * Defaults are left out, so the plainest question has the plainest address.
 * `extra` is appended — `gender` for the pillars, `lang` when the API is what
 * is being asked — which keeps the page's address a prefix of the API's.
 */
export function momentQuery(
  input: MomentInput,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  if (input.date) params.set('date', input.date);
  if (input.time) params.set('time', input.time);
  if (input.place) params.set('locationId', String(input.place.id));
  if (!input.trueSolarTime) params.set('trueSolarTime', 'false');
  if (input.dayBoundary !== 'zishi') params.set('dayBoundary', input.dayBoundary);

  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

/**
 * The name of the place the address names.
 *
 * An address can only carry an identifier, and a form that reopens with a bare
 * number where the place was is a form that has lost it.
 *
 * An identifier that resolves to nothing comes back as a failure and must be
 * shown as one. Dropping it and computing anyway is the tempting thing and the
 * wrong one: the answer would be cast for the server's own zone and would look
 * exactly like a chart, with nothing in it to say that the place the address
 * asked for was never found.
 */
export async function lookupPlace(
  fetch: typeof globalThis.fetch,
  id: string | null,
  locale: string,
): Promise<{ place?: Location; failure?: Failure }> {
  if (!id) return {};

  const response = await fetch(`/api/locations?id=${encodeURIComponent(id)}&lang=${locale}`);
  const body = await response.json();
  if (!response.ok) return { failure: body as Failure };

  return { place: (body as { results: Location[] }).results[0] };
}

/** A failure in the reader's language, falling back to the English it carries. */
export function sayFailure(t: Translator, failure: Failure): string {
  return failure.messageKey ? t(failure.messageKey, failure.params ?? {}) : failure.message;
}
