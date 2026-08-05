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
  zoneMeridian,
  DEFAULT_OPTIONS,
  type ChartOptions,
  type Direction,
  type EphemerisContext,
  type GateId,
  type LocalMoment,
  type Moment,
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
      place: { latitude: Number(latitude), longitude: Number(longitude), timezone },
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
 * function of its URL only where the URL says when. `?locationId=1816670`
 * alone means now, and an answer to that kept for a day is yesterday's chart
 * offered as today's.
 */
export function momentIsFixed(params: URLSearchParams): boolean {
  return params.has('date') && params.has('time');
}

export function readOptions(params: URLSearchParams): ChartOptions {
  const options: ChartOptions = { ...DEFAULT_OPTIONS };

  const trueSolar = params.get('trueSolarTime');
  if (trueSolar !== null) options.trueSolarTime = trueSolar !== 'false';

  const dayBoundary = params.get('dayBoundary');
  if (dayBoundary === 'zishi' || dayBoundary === 'midnight') options.dayBoundary = dayBoundary;

  const yearBoundary = params.get('yearBoundary');
  if (yearBoundary === 'lichun' || yearBoundary === 'chunjie') options.yearBoundary = yearBoundary;

  return options;
}

export interface ReadMoment {
  moment: Moment;
  place: Place;
  label?: string | undefined;
}

export function readMoment(params: URLSearchParams): ReadMoment {
  const { place, label, meridianAssumed } = readPlace(params);
  const now = currentMoment(place.timezone);

  const input = {
    date: params.get('date') ?? now.date,
    time: params.get('time') ?? now.time,
    timezone: place.timezone,
  };
  if (meridianAssumed) place.longitude = zoneMeridian(input);

  const moment = resolveMoment(input, place, readOptions(params), ephemerisContext());

  return { moment, place, label };
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
