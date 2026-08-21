import type { Location } from '@shipan/geo';
import type { MessageKey, MessageParams, Translator } from '@shipan/i18n';
// Types only: a value import would put the engine in the browser bundle.
import type { Ganzhi, Ju, PalaceContents, Pattern } from '@shipan/core';

/**
 * The moment, as it travels in the address.
 *
 * Every section that is laid on an instant asks its own question of one, and
 * the API takes that instant in one form only — a query string. So it is read
 * and written here rather than once per section, and the address of a page is
 * exactly the address of the answer.
 *
 * That is what makes a chart shareable, what lets the sections hand a
 * moment to one another, and what survives a reload. Nothing is kept in the
 * browser to achieve it: what a person types goes in the address and nowhere
 * else, which is what the privacy note says and now what the code does.
 *
 * Only types are imported here. A value import from `geo` would drag SQLite
 * into the browser bundle.
 */

export type { Location };

/**
 * Where a board is laid, in the three ways it can be said.
 *
 * A place is never guessed from a name: it is an identifier out of
 * `/api/locations`, or a pair of coordinates, or an identifier **refined by**
 * a pair of coordinates. The third is what a search cannot give — GeoNames
 * knows the town and not the hamlet three valleys up, and the longitude is
 * what the correction to true solar time is made of.
 *
 * The coordinates travel as strings for the reason the date does: they come
 * out of fields and go into an address, `''` is the only honest way to say
 * «not given», and `0` is a coordinate somebody may mean. Parsed to numbers
 * here, an unfilled field and the Gulf of Guinea would be one value.
 */
export interface PlaceInput {
  place?: Location;
  /** Decimal degrees, positive north. `''` when not given. */
  latitude: string;
  /** Decimal degrees, positive east. `''` when not given. */
  longitude: string;
  /**
   * IANA identifier, read **only where the coordinates stand alone**.
   *
   * With a place the zone is the place's, and the form does not send this at
   * all: a parameter that decides nothing has no business in an address. With
   * coordinates alone something has to say which clock the hour was read on,
   * or the server falls back to its own — an answer wrong by hours and
   * indistinguishable from a right one.
   */
  timezone: string;
}

export interface MomentInput extends PlaceInput {
  /** ISO `YYYY-MM-DD`, whatever the locale: a shared address means one thing. */
  date: string;
  /** `HH:mm`. */
  time: string;
  trueSolarTime: boolean;
  dayBoundary: string;
  /** How the ju is determined. Carried verbatim: the server refuses a value
   * it does not know, where a silent fallback would cast a chaibu chart under
   * whatever name the address had misspelt. */
  method: string;
  /** Where the third of the term is counted from, under chaibu. Carried
   * verbatim for the same reason as `method`. */
  yuan: string;
}

/** A failure as it crosses HTTP: a code with parameters, never prose. */
export interface Failure {
  code?: string;
  message: string;
  messageKey?: MessageKey;
  params?: MessageParams;
}

/**
 * The coordinates and the zone, as any address carries them.
 *
 * Seven sections read a place out of a URL and one of them is not a moment —
 * the interval of `moments` — so this is the piece they share rather than a
 * copy of three lines apiece. 太乙 is the eighth and reads none: a 年計 board
 * takes no place and no hour.
 */
export function readPlaceInput(params: URLSearchParams): Omit<PlaceInput, 'place'> {
  return {
    latitude: params.get('latitude') ?? '',
    longitude: params.get('longitude') ?? '',
    timezone: params.get('timezone') ?? '',
  };
}

/**
 * Whether the coordinates say something the chosen place does not.
 *
 * The fields arrive filled with the place's own — a reader nudging a value is
 * the whole use, and nobody can nudge an empty box they would have to guess
 * the starting point of. Which makes «filled» the resting state rather than a
 * statement, and this is what tells the two apart.
 *
 * It is the same rule `momentQuery` keeps for every other field: `chaibu` is
 * not written into an address because it is what the engine would have done
 * anyway. An untouched pair is the place, said twice — carried, it would put
 * a doorstep in every link and print «Roma · 41.8919, 12.5113» under every
 * chart of Rome, which reads as a refinement somebody made.
 *
 * Half a pair counts as a departure. The fields require each other, so it
 * arrives only from an address somebody typed, and there the server's refusal
 * is the right answer — quietly falling back to the town would answer a
 * question nobody asked.
 */
export function refines(input: PlaceInput): boolean {
  if (!input.latitude && !input.longitude) return false;
  if (!input.place) return true;
  return (
    input.latitude !== String(input.place.latitude) ||
    input.longitude !== String(input.place.longitude)
  );
}

/**
 * The place as address fields, for whichever query is being built.
 *
 * Each coordinate is written on its own and never as a pair: an address can
 * be typed, and dropping the half that is there would turn a question the
 * server refuses into a chart cast somewhere else entirely.
 *
 * The zone goes only where it is read: with a place it is the place's, and
 * with no coordinates there is nothing for it to be the zone of.
 */
export function placeFields(input: PlaceInput): Record<string, string | undefined> {
  const moved = refines(input);
  return {
    locationId: input.place ? String(input.place.id) : undefined,
    latitude: moved ? input.latitude || undefined : undefined,
    longitude: moved ? input.longitude || undefined : undefined,
    timezone: !input.place && moved ? input.timezone || undefined : undefined,
  };
}

/**
 * Where the answer says it was cast, in one line.
 *
 * The short name and not the full one the API returns: this is the line on a
 * shut panel and over a printed sheet, beside a date, and «Roma» is what
 * somebody reads there. The coordinates follow it whenever they say something
 * the place does not, because a sheet reading «Roma» for a board laid fifty
 * kilometres away says something untrue — and standing alone they carry their
 * zone, which is then the only thing on screen saying which clock the hour
 * was read on. See `refines` for why «given» is not the test.
 */
export function sayPlace(input: PlaceInput): string {
  const coordinates =
    refines(input) && input.latitude && input.longitude
      ? `${input.latitude}, ${input.longitude}`
      : '';
  if (input.place) return coordinates ? `${input.place.name} · ${coordinates}` : input.place.name;
  if (!coordinates) return '';
  return input.timezone ? `${coordinates} (${input.timezone})` : coordinates;
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
      ...readPlaceInput(params),
      trueSolarTime: params.get('trueSolarTime') !== 'false',
      dayBoundary: params.get('dayBoundary') === 'midnight' ? 'midnight' : 'zishi',
      method: params.get('method') ?? 'chaibu',
      yuan: params.get('yuan') ?? 'term',
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
  if (!input.trueSolarTime) params.set('trueSolarTime', 'false');
  if (input.dayBoundary !== 'zishi') params.set('dayBoundary', input.dayBoundary);
  if (input.method && input.method !== 'chaibu') params.set('method', input.method);
  if (input.yuan && input.yuan !== 'term') params.set('yuan', input.yuan);

  for (const [key, value] of Object.entries({ ...placeFields(input), ...extra })) {
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

/**
 * One run of a scan, as `/api/moments` projects it.
 *
 * A **projection** and not a `ScanRun`: the engine's run carries a whole chart
 * per hour, and a month of them is a payload nobody reads. What crosses is the
 * hour, the ju, the palaces that answered and the configurations bearing on
 * them.
 *
 * Named here rather than inside the endpoint because both halves need it and
 * neither may import the other — a component cannot reach into `+server.ts`,
 * and the shape stated in one of the two and inferred in the other is the
 * shape that drifts. The endpoint declares this as what it returns; the table
 * and the page declare it as what they read.
 */
export interface ScannedMoment {
  /** When the run opens, as local clock time at the place. ISO 8601. */
  start: string;
  /** When the next one opens. Half-open, as the engine reports them. */
  end: string;
  hour: Ganzhi;
  ju: Ju;
  /** The palaces that answered what was asked of the interval. */
  palaces: readonly PalaceContents[];
  /** Those of the whole board, and of the palaces that answered. */
  patterns: readonly Pattern[];
}
