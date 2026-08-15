import {
  ChartError,
  GATES,
  PATTERN_IDS,
  SPIRITS_YANG,
  STARS,
  STEMS,
  currentMoment,
  initEphemeris,
  resolveMoment,
  systemTimezone,
  yearsLived,
  zoneMeridian,
  DEFAULT_OPTIONS,
  type ChartOptions,
  type Direction,
  type EphemerisContext,
  type Ganzhi,
  type GateId,
  type Gender,
  type LocalMoment,
  type Moment,
  type NianmingOptions,
  type PatternId,
  type Place,
  type ScanCriteria,
  type SpiritId,
  type StarId,
  type StemId,
  type StrengthId,
} from '@qimendunjia/core';
import { getLocation } from '@qimendunjia/geo';
import { resolveLocale, type Locale } from '@qimendunjia/i18n';
import { error } from '@sveltejs/kit';

/**
 * Reading the query string, in one place.
 *
 * Every endpoint takes the same moment and the same options, so they are read
 * here rather than four times over. It also keeps one promise the API makes:
 * a chart is a pure function of its parameters, so the same URL always
 * produces the same chart — which is only true if every endpoint reads the
 * URL the same way.
 */

let ephemeris: EphemerisContext | undefined;

export function ephemerisContext(): EphemerisContext {
  ephemeris ??= initEphemeris();
  return ephemeris;
}

export function readLocale(params: URLSearchParams, header?: string | null): Locale {
  return resolveLocale(params.get('lang'), header);
}

/**
 * A whole number out of the address, where the endpoint has a default.
 *
 * Absent or empty, the answer is `undefined` and the default stands. Present,
 * it has to read as an integer, and refusal is the point: `Number('abc')` is
 * NaN, and NaN slides through every `Math.min`/`Math.max` clamp downstream —
 * both comparisons are false — to be served as garbage that looks like an
 * answer. `bounds` are for the one caller whose sane range is not a clamp.
 */
export function readInteger(
  params: URLSearchParams,
  name: string,
  bounds?: { least: number; most: number },
): number | undefined {
  const value = params.get(name);
  if (value === null || value === '') return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || (bounds && (parsed < bounds.least || parsed > bounds.most))) {
    invalidNumber(name, value);
  }
  return parsed;
}

/** The refusal `readInteger` and the coordinates share: a code, never prose. */
function invalidNumber(name: string, value: string): never {
  error(400, {
    message: `"${value}" is not a valid number for ${name}.`,
    code: 'INVALID_NUMBER',
    messageKey: 'web.error.INVALID_NUMBER',
    params: { parameter: name, value },
  });
}

/**
 * A coordinate out of the address: a float, and present means readable.
 *
 * Not `readInteger` — a latitude has a fraction — and not its absence rule
 * either: the parameter is already known to be present, so an empty one is
 * refused rather than defaulted. `Number('')` is 0, which would answer with
 * a chart for the Gulf of Guinea as if it had been asked for; `Number('abc')`
 * is NaN, which serializes as `null` and looks like an answer too.
 */
function readCoordinate(name: string, value: string): number {
  const parsed = Number(value);
  if (value.trim() === '' || !Number.isFinite(parsed)) invalidNumber(name, value);
  return parsed;
}

/**
 * The address of the page a chart is read at, built from the API's own.
 *
 * The one place here that writes an address rather than reading one, and it
 * is the same promise from the other side: the interface and the API take the
 * same query string, so the page is this URL with the section's path and
 * without the parameters only the API answers to. It travels inside what
 * gets copied, so that a reading pasted into a conversation somewhere else
 * still says which chart it was made from — and so that anybody can cast it
 * again and see whether it says what the reading claimed.
 */
export function pageAddress(url: URL, locale: Locale): string {
  const page = new URL(url);
  page.pathname = `/${locale}`;
  // The parameters only the API answers to — and the birth, which the chart
  // section does not take and which nobody's address should carry: the link
  // is there so the chart can be cast again and checked, and the chart is the
  // chart of its moment. The 年命 is already written out in the transcript
  // this address travels inside.
  for (const only of ['lang', 'asked', 'born', 'bornTime', 'bornTz', 'gender', 'years']) {
    page.searchParams.delete(only);
  }
  return page.toString();
}

/**
 * Where the chart is cast from.
 *
 * A place is never inferred from a name here either: the API takes an
 * identifier from `/api/locations` or an explicit triple, and nothing else.
 * With only a timezone, the place is taken to sit on the meridian the zone's
 * clock keeps at the chart's moment — which makes the longitude correction
 * zero rather than wrong. That longitude needs the date, which is read later,
 * so `meridianAssumed` marks it as a stand-in for `readMoment` to fill.
 */
export function readPlace(params: URLSearchParams): {
  place: Place;
  label?: string;
  meridianAssumed?: boolean;
} {
  const locationId = params.get('locationId');
  if (locationId) {
    const found = getLocation(Number(locationId));
    if (!found) {
      throw new ChartError('INVALID_COORDINATES', { longitude: locationId });
    }
    return {
      place: { latitude: found.latitude, longitude: found.longitude, timezone: found.timezone },
      label: [found.name, found.region, found.country].filter(Boolean).join(', '),
    };
  }

  const latitude = params.get('latitude');
  const longitude = params.get('longitude');
  const timezone = params.get('timezone') ?? systemTimezone();

  if (latitude !== null && longitude !== null) {
    return {
      place: {
        latitude: readCoordinate('latitude', latitude),
        longitude: readCoordinate('longitude', longitude),
        timezone,
      },
    };
  }
  if (latitude !== null || longitude !== null) {
    throw new ChartError('INVALID_COORDINATES', { longitude: longitude ?? '—' });
  }

  return { place: { latitude: 0, longitude: 0, timezone }, meridianAssumed: true };
}

/**
 * Whether the address fixes the instant.
 *
 * Cacheability rests on this and not on the endpoint: a chart is a pure
 * function of its URL only where the URL says when. A date alone does — the
 * missing time is noon, not the clock — while `?locationId=1816670` alone
 * means now, and an answer to that kept for a day is yesterday's chart
 * offered as today's.
 */
export function momentIsFixed(params: URLSearchParams): boolean {
  return params.has('date');
}

export function readOptions(params: URLSearchParams): ChartOptions {
  const options: ChartOptions = { ...DEFAULT_OPTIONS };

  const trueSolar = params.get('trueSolarTime');
  if (trueSolar !== null) options.trueSolarTime = trueSolar !== 'false';

  const dayBoundary = params.get('dayBoundary');
  if (dayBoundary === 'zishi' || dayBoundary === 'midnight') options.dayBoundary = dayBoundary;

  const yearBoundary = params.get('yearBoundary');
  if (yearBoundary === 'lichun' || yearBoundary === 'chunjie') options.yearBoundary = yearBoundary;

  // Strict, unlike the three above: their misspellings fall back to defaults
  // that show in the answer, but a chart cast by the wrong method looks right
  // and is not. maoshan passes through and the engine refuses it with a 501.
  const method = params.get('method');
  if (method !== null) {
    if (method !== 'chaibu' && method !== 'zhirun' && method !== 'maoshan') {
      throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: 'method', value: method });
    }
    options.method = method;
  }

  // Strict for the same reason: it moves the ju on most days.
  const yuan = params.get('yuan');
  if (yuan !== null) {
    if (yuan !== 'term' && yuan !== 'futou') {
      throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: 'yuan', value: yuan });
    }
    options.yuan = yuan;
  }

  // Strict for the same reason again, and worth saying why it is here at all
  // when only one register exists: a page cast under a second one would carry
  // different 神煞 under the same address, so the parameter has to travel in
  // the URL from before there is a second. The engine refuses anything else
  // with a 501 rather than quietly serving 協紀's.
  const shensha = params.get('shensha');
  if (shensha !== null) {
    if (shensha !== 'xieji') {
      throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: 'shensha', value: shensha });
    }
    options.shensha = shensha;
  }

  return options;
}

export interface ReadMoment {
  moment: Moment;
  place: Place;
  label?: string | undefined;
}

/**
 * The instant the address asks about.
 *
 * **A date without a time is noon on that date, not the hour it is asked at.**
 * Falling back to the clock would make the same address answer with a
 * different chart every time, which is the one thing a chart may never do: it
 * is a pure function of its URL, and a saved one has to reproduce. Noon is
 * the convention `bornTime` already declares. Omitting *both* is the other
 * case entirely — there the instant of asking is the instant that is cast.
 */
export function readMoment(params: URLSearchParams): ReadMoment {
  const { place, label, meridianAssumed } = readPlace(params);
  const now = currentMoment(place.timezone);
  const date = params.get('date');

  const input = {
    date: date ?? now.date,
    time: params.get('time') ?? (date === null ? now.time : '12:00'),
    timezone: place.timezone,
  };
  if (meridianAssumed) place.longitude = zoneMeridian(input);

  const moment = resolveMoment(input, place, readOptions(params), ephemerisContext());

  return { moment, place, label };
}

/**
 * 年命 — the birth to be looked up inside a chart, when one is asked for.
 *
 * `born=1990-06-01` is the whole of what is required; `bornTime` and `bornTz`
 * exist because a birth within hours of 立春 belongs to the year before, and
 * there the hour and the zone decide it. Everything else about the birth is
 * never asked for and never sent: only the year pillar is read from it.
 *
 * `gender` is read for the direction of the 行年 count and for nothing else —
 * the rule runs forward from 寅 or back from 申 — and without it only the
 * 本命 is placed.
 *
 * Nothing here is inferred. No birth, no 年命, and an unreadable one is an
 * error rather than a silently dropped parameter: a chart that quietly lost
 * the birth it was asked to place looks exactly like one that never had it.
 */
export function readNianming(
  params: URLSearchParams,
  chart: { moment: Moment },
): { birthYear: Ganzhi; years?: number; gender?: Gender } | undefined {
  const born = params.get('born');
  if (!born) return undefined;

  const place = readPlace(params).place;
  const input: LocalMoment = {
    date: born,
    // Noon for a date given alone: it decides nothing but a birth within
    // hours of 立春, and there the hour has to be given.
    time: params.get('bornTime') ?? '12:00',
    timezone: params.get('bornTz') ?? place.timezone,
  };
  const birth = resolveMoment(
    { ...input },
    { ...place, timezone: input.timezone, longitude: zoneMeridian(input) },
    chart.moment.options,
    ephemerisContext(),
  );

  const gender = params.get('gender');
  if (gender !== null && gender !== 'male' && gender !== 'female') {
    throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: 'gender', value: gender });
  }

  const count = params.get('years');
  if (count !== null && count !== 'sui' && count !== 'turns') {
    throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: 'years', value: count });
  }
  const options: NianmingOptions = { count: count ?? 'sui' };

  return {
    birthYear: birth.pillars.year,
    ...(gender ? { years: yearsLived(birth, chart.moment, options), gender } : {}),
  };
}

/** The count of years the 行年 steps by, read the same way everywhere. */
export function readNianmingOptions(params: URLSearchParams): NianmingOptions {
  const count = params.get('years');
  return { count: count === 'turns' ? 'turns' : 'sui' };
}

/**
 * The longest interval this surface will scan.
 *
 * The engine allows a year; a request is not the place to spend the seconds
 * that would take. A month is what somebody choosing a time actually looks
 * at, and it walks in under two seconds with true solar time on.
 */
export const MAX_WEB_SCAN_DAYS = 31;

export interface ReadInterval {
  from: LocalMoment;
  to: LocalMoment;
  place: Place;
  options: ChartOptions;
  label?: string | undefined;
}

/**
 * The two ends of a scan, and where it is made from.
 *
 * `from` and `to` are dates and both are required: an interval defaulting to
 * "now" is not an interval, and a scan is the one thing here that cannot be
 * asked without saying when. They open at midnight unless a time says
 * otherwise, because `from=2026-09-01` names a day and means all of it.
 */
export function readInterval(params: URLSearchParams): ReadInterval {
  const from = params.get('from');
  const to = params.get('to');

  if (!from) throw new ChartError('INVALID_DATE', { date: '' });
  if (!to) throw new ChartError('INVALID_DATE', { date: '' });

  const { place, label, meridianAssumed } = readPlace(params);
  const opens: LocalMoment = { date: from, time: params.get('fromTime') ?? '00:00', timezone: place.timezone };
  const closes: LocalMoment = { date: to, time: params.get('toTime') ?? '00:00', timezone: place.timezone };

  if (meridianAssumed) place.longitude = zoneMeridian(opens);

  const days = daysBetween(opens, closes);
  if (days > MAX_WEB_SCAN_DAYS) {
    throw new ChartError('INTERVAL_TOO_LONG', {
      days: Math.ceil(days),
      maximum: MAX_WEB_SCAN_DAYS,
    });
  }

  return { from: opens, to: closes, place, options: readOptions(params), label };
}

/** Whole days between two dates, near enough to refuse an interval by. */
function daysBetween(from: LocalMoment, to: LocalMoment): number {
  return (Date.parse(`${to.date}T00:00Z`) - Date.parse(`${from.date}T00:00Z`)) / 86_400_000;
}

/**
 * What the scan was asked for.
 *
 * Every identifier is checked against the ones the engine knows. An unchecked
 * one would not fail: it would match nothing, and the answer would say the
 * arrangement never occurred — which is what a correct question can also be
 * told, and indistinguishable from it.
 */
export function readCriteria(params: URLSearchParams): ScanCriteria {
  const criteria: ScanCriteria = {};

  const one = <T extends string>(name: string, known: readonly string[]): T | undefined => {
    const value = params.get(name);
    if (value === null || value === '') return undefined;
    if (!known.includes(value)) throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: name, value });
    return value as T;
  };

  const many = <T extends string>(name: string, known: readonly string[]): T[] => {
    const value = params.get(name);
    if (!value) return [];
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        if (!known.includes(entry)) {
          throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: name, value: entry });
        }
        return entry as T;
      });
  };

  const ids = (entries: readonly { id: string }[]): string[] => entries.map((entry) => entry.id);

  // 本命 as a criterion: the palaces the person's own year stands on, which
  // is the half of 「年命乘本局吉星奇門生旺之方」 that can be computed. What
  // makes a palace worth standing on is the other criteria.
  const born = params.get('born');
  if (born) {
    const place = readPlace(params).place;
    const input: LocalMoment = {
      date: born,
      time: params.get('bornTime') ?? '12:00',
      timezone: params.get('bornTz') ?? place.timezone,
    };
    criteria.benming = resolveMoment(
      input,
      { ...place, timezone: input.timezone, longitude: zoneMeridian(input) },
      readOptions(params),
      ephemerisContext(),
    ).pillars.year;
  }

  const gate = one<GateId>('gate', ids(GATES));
  const star = one<StarId>('star', ids(STARS));
  const spirit = one<SpiritId>('spirit', ids(SPIRITS_YANG));
  const stem = one<StemId>('stem', ids(STEMS));
  const minStrength = one<StrengthId>('minStrength', STRENGTHS);
  const directions = many<Direction>('towards', DIRECTIONS);
  const excludes = many<PatternId>('without', PATTERN_IDS);
  const requires = many<PatternId>('with', PATTERN_IDS);

  if (gate) criteria.gate = gate;
  if (star) criteria.star = star;
  if (spirit) criteria.spirit = spirit;
  if (stem) criteria.stem = stem;
  if (minStrength) criteria.minStrength = minStrength;
  if (directions.length) criteria.directions = directions;
  if (excludes.length) criteria.excludes = excludes;
  if (requires.length) criteria.requires = requires;

  return criteria;
}

export const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
export const STRENGTHS = ['wang', 'xiang', 'xiu', 'qiu', 'si'] as const;
