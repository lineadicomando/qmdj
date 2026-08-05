import {
  ChartError,
  currentMoment,
  initEphemeris,
  resolveMoment,
  systemTimezone,
  zoneMeridian,
  DEFAULT_OPTIONS,
  type ChartOptions,
  type EphemerisContext,
  type Moment,
  type Place,
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
