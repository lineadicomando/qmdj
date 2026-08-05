import {
  ChartError,
  currentMoment,
  initEphemeris,
  resolveMoment,
  systemTimezone,
  zoneMeridian,
  type ChartOptions,
  type EphemerisContext,
  type LocalMoment,
  type Moment,
  type Place,
} from '@qimendunjia/core';
import { DEFAULT_OPTIONS } from '@qimendunjia/core';
import { GeoError, getLocation } from '@qimendunjia/geo';
import { createTranslator, resolveLocale, type Translator } from '@qimendunjia/i18n';
import { z } from 'zod';

export interface ToolContext {
  /** Where the GeoNames database lives, when it is not in the default place. */
  databasePath?: string;
  /** Where the ephemeris files live, when they are not in the default place. */
  ephemerisPath?: string;
}

/**
 * What a tool hands back.
 *
 * The index signature is what the SDK's handler type asks for — it allows a
 * result to carry fields this server does not use — and without it the
 * narrower shape is rejected.
 */
export interface ToolResult {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

export function ok(text: string): ToolResult {
  return { content: [{ type: 'text', text }] };
}

export function fail(text: string): ToolResult {
  return { content: [{ type: 'text', text }], isError: true };
}

/**
 * Turns whatever went wrong into something an agent can act on.
 *
 * Domain errors are translated from their code, so the sentence an agent
 * reads is the same one a person would. Anything else is passed through
 * rather than dressed up: an agent that is told a plausible story about an
 * unexpected failure will retry forever.
 */
export function describeError(error: unknown, t: Translator): string {
  if (error instanceof ChartError || error instanceof GeoError) {
    return t(error.messageKey, error.params);
  }
  return error instanceof Error ? error.message : String(error);
}

/** The locale an agent asked for, if it asked. */
export function translatorFor(lang: string | undefined): Translator {
  return createTranslator(resolveLocale(lang));
}

export const langSchema = z
  .enum(['en', 'it'])
  .optional()
  .describe('Language of the readable labels. Default en. Never changes the hanzi or the numbers.');

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .describe(
    'Local date, YYYY-MM-DD. OMIT THIS for the present moment: the server supplies the current date, and you do not know it. Only pass it when the user named a date.',
  );

export const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/)
  .optional()
  .describe(
    'Local clock time, HH:mm. As it was read on a clock at the place; the conversion to Universal Time is done here, using the historical rules of the zone. Do not convert it yourself. Omit for the present moment.',
  );

export const placeSchema = {
  location_id: z
    .number()
    .int()
    .optional()
    .describe('GeoNames identifier from search_location. Preferred over raw coordinates.'),
  latitude: z.number().min(-90).max(90).optional().describe('Degrees, positive north.'),
  longitude: z.number().min(-180).max(180).optional().describe('Degrees, positive east.'),
  timezone: z
    .string()
    .optional()
    .describe('IANA identifier, e.g. Asia/Shanghai. Required with raw coordinates.'),
};

export const optionSchema = {
  true_solar_time: z
    .boolean()
    .optional()
    .describe(
      'Correct clock time to true solar time at the place. Default true. Turning it off is a school\'s choice, not a simplification.',
    ),
  day_boundary: z
    .enum(['zishi', 'midnight'])
    .optional()
    .describe(
      'Where the day pillar turns over: at 23:00 with the hour of the Rat, or at midnight. Default zishi. The two disagree only for that one hour, and there about a quarter of the chart.',
    ),
  year_boundary: z
    .enum(['lichun', 'chunjie'])
    .optional()
    .describe('Where the year of the pillars begins. Default lichun.'),
};

export interface ResolvedInput {
  moment: Moment;
  place: Place;
  label: string;
}

interface RawInput {
  date?: string | undefined;
  time?: string | undefined;
  location_id?: number | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  timezone?: string | undefined;
  true_solar_time?: boolean | undefined;
  day_boundary?: 'zishi' | 'midnight' | undefined;
  year_boundary?: 'lichun' | 'chunjie' | undefined;
}

/**
 * Turns what an agent passed into a moment the engine can use.
 *
 * Two things are deliberately not guessed. A place is never inferred from a
 * name — that is what `search_location` is for, and choosing among the dozens
 * of Romes would produce a chart that is plausible and wrong. And the current
 * date is supplied here rather than by the agent, which does not know it.
 */
export function resolveInput(raw: RawInput, context: ToolContext): ResolvedInput {
  const { place, meridianAssumed } = resolvePlace(raw, context);
  const now = currentMoment(place.timezone);
  const input: LocalMoment = {
    date: raw.date ?? now.date,
    time: raw.time ?? now.time,
    timezone: place.timezone,
  };
  if (meridianAssumed) place.longitude = zoneMeridian(input);

  const options: ChartOptions = { ...DEFAULT_OPTIONS };
  if (raw.true_solar_time !== undefined) options.trueSolarTime = raw.true_solar_time;
  if (raw.day_boundary) options.dayBoundary = raw.day_boundary;
  if (raw.year_boundary) options.yearBoundary = raw.year_boundary;

  const ephemeris: EphemerisContext = initEphemeris(context.ephemerisPath);
  return {
    moment: resolveMoment(input, place, options, ephemeris),
    place,
    label: labelFor(raw, place, context),
  };
}

function resolvePlace(
  raw: RawInput,
  context: ToolContext,
): { place: Place; meridianAssumed?: boolean } {
  if (raw.location_id !== undefined) {
    const found = getLocation(
      raw.location_id,
      context.databasePath ? { databasePath: context.databasePath } : {},
    );
    if (!found) {
      throw new Error(
        `No place has the GeoNames identifier ${raw.location_id}. Use search_location to get one; do not invent it.`,
      );
    }
    return {
      place: { latitude: found.latitude, longitude: found.longitude, timezone: found.timezone },
    };
  }

  if (raw.latitude !== undefined && raw.longitude !== undefined && raw.timezone) {
    return { place: { latitude: raw.latitude, longitude: raw.longitude, timezone: raw.timezone } };
  }

  if (raw.latitude !== undefined || raw.longitude !== undefined) {
    throw new Error(
      'Coordinates are incomplete. Pass latitude, longitude and timezone together, or pass location_id from search_location instead.',
    );
  }

  // A timezone on its own is a complete answer for the calendar and the
  // terms, which do not depend on where they are read. For anything that does
  // — the correction to true solar time — the place is taken to sit on the
  // meridian the zone's clock keeps at the chart's moment, which makes that
  // correction exactly zero rather than wrong by half an hour. The moment is
  // not known yet, so the longitude is a stand-in that `resolveInput` fills.
  const timezone = raw.timezone ?? systemTimezone();
  return { place: { latitude: 0, longitude: 0, timezone }, meridianAssumed: true };
}

function labelFor(raw: RawInput, place: Place, context: ToolContext): string {
  if (raw.location_id !== undefined) {
    const found = getLocation(
      raw.location_id,
      context.databasePath ? { databasePath: context.databasePath } : {},
    );
    if (found) {
      return [found.name, found.region, found.country].filter(Boolean).join(', ');
    }
  }
  return `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)} (${place.timezone})`;
}

export function ephemerisOf(context: ToolContext): EphemerisContext {
  return initEphemeris(context.ephemerisPath);
}
