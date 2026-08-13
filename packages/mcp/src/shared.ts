import {
  ChartError,
  currentMoment,
  initEphemeris,
  nianmingOf,
  resolveMoment,
  systemTimezone,
  yearsLived,
  zoneMeridian,
  type ChartOptions,
  type EphemerisContext,
  type LocalMoment,
  type Moment,
  type Nianming,
  type NianmingOptions,
  type Place,
  type QimenChart,
} from '@qimendunjia/core';
import { DEFAULT_OPTIONS } from '@qimendunjia/core';
import { GeoError, getLocation } from '@qimendunjia/geo';
import {
  DEFAULT_LOCALE,
  createTranslator,
  resolveLocale,
  translate,
  type MessageKey,
  type MessageParams,
  type Translator,
} from '@qimendunjia/i18n';
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

export type McpErrorCode = 'UNKNOWN_LOCATION' | 'INCOMPLETE_COORDINATES';

/**
 * A usage error of this server's own: input that never reaches an engine, so
 * no engine can name what is wrong with it.
 *
 * It carries a `code` and the `params` that describe the failure, never a
 * sentence chosen for one language. `message` is an English rendering meant
 * for logs and stack traces; `describeError` translates `messageKey` with
 * `params` in the locale the agent asked for.
 */
export class McpError extends Error {
  readonly code: McpErrorCode;
  readonly params: MessageParams;
  readonly messageKey: MessageKey;

  constructor(code: McpErrorCode, params: MessageParams = {}) {
    const messageKey = `mcp.error.${code}` as MessageKey;
    super(translate(DEFAULT_LOCALE, messageKey, params));
    this.name = 'McpError';
    this.code = code;
    this.params = params;
    this.messageKey = messageKey;
  }
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
  if (error instanceof ChartError || error instanceof GeoError || error instanceof McpError) {
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
  .describe(
    'Language of the readable labels. Default en. Never changes the hanzi, the pinyin or the numbers.',
  );

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
    'Local clock time, HH:mm. As it was read on a clock at the place; the conversion to Universal Time is done here, using the historical rules of the zone. Do not convert it yourself. Omit for the present moment; omitted beside a date, it is noon on that date.',
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

/**
 * 年命 — the birth to be looked up inside the chart, when one is wanted.
 *
 * The classical direction and the reverse of a natal chart: the chart stays
 * the chart of its moment, and the birth is placed in it. Only the year
 * pillar is read from the date given.
 */
export const birthSchema = {
  born: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe(
      'Date of birth, YYYY-MM-DD, to place a 年命 inside the chart: 本命, the year pillar of the birth. The chart itself does not move — this is not a chart of a birth, and nothing in the answer says which palace stands for which part of a life.',
    ),
  born_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .optional()
    .describe(
      'Clock time of the birth. Default noon, and it decides nothing except for a birth within hours of 立春, where it decides which year pillar the birth belongs to.',
    ),
  born_timezone: z
    .string()
    .optional()
    .describe('IANA zone of the birth. Default the chart\'s own, and it matters for the same reason born_time does.'),
  gender: z
    .enum(['male', 'female'])
    .optional()
    .describe(
      'Read for the direction of the 行年 count and for nothing else: the traditional rule runs forward from 寅 for a man and back from 申 for a woman. Without it only the 本命 is placed, and the year being lived is left out rather than guessed.',
    ),
  years_count: z
    .enum(['sui', 'turns'])
    .optional()
    .describe(
      'How the years are counted for the 行年: sui is 虛歲, counting the year of the birth itself, and is the count the rule was written for; turns counts the turns of the year pillar and is one less. Default sui.',
    ),
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
  method: z
    .enum(['chaibu', 'zhirun'])
    .optional()
    .describe(
      'How the ju of a Qi Men chart is determined. Default chaibu, which splits each term into three five-day thirds from the instant it begins. zhirun follows the day\'s futou through whole fifteen-day blocks and pays the drift off with an intercalated Mangzhong or Daxue; its ju can belong to a term the Sun has not reached yet, and the answer says which. The two are different schools, not approximations of one another. Does not affect the Four Pillars.',
    ),
  yuan: z
    .enum(['term', 'futou'])
    .optional()
    .describe(
      'Under chaibu, where the third of the term is counted from. Default term, counting from the instant the term began. futou counts from the days instead: where the day pillar stands in the fifteen-day cycle headed by Jia and Ji is the yuan, whatever the term is doing. A divergence inside chaibu, and it moves the ju on most days. No bearing under zhirun, where the yuan is the futou\'s by construction. Does not affect the Four Pillars.',
    ),
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
  method?: 'chaibu' | 'zhirun' | undefined;
  yuan?: 'term' | 'futou' | undefined;
  born?: string | undefined;
  born_time?: string | undefined;
  born_timezone?: string | undefined;
  gender?: 'male' | 'female' | undefined;
  years_count?: 'sui' | 'turns' | undefined;
}

/**
 * Turns what an agent passed into a moment the engine can use.
 *
 * Two things are deliberately not guessed. A place is never inferred from a
 * name — that is what `search_location` is for, and choosing among the dozens
 * of Romes would produce a chart that is plausible and wrong. And the current
 * date is supplied here rather than by the agent, which does not know it.
 *
 * **A date without a time is noon on that date, not the hour it is asked in.**
 * Falling back to the clock would make the same call return a different chart
 * every time it ran, which is the one thing a chart may never do: it is a pure
 * function of its input, and a saved one has to reproduce. Noon is the
 * convention `born_time` already declares. Omitting *both* is the other case
 * entirely — there the instant of asking is the instant that is cast.
 */
export function resolveInput(raw: RawInput, context: ToolContext): ResolvedInput {
  const { place, meridianAssumed } = resolvePlace(raw, context);
  const now = currentMoment(place.timezone);
  const input: LocalMoment = {
    date: raw.date ?? now.date,
    time: raw.time ?? (raw.date === undefined ? now.time : '12:00'),
    timezone: place.timezone,
  };
  if (meridianAssumed) place.longitude = zoneMeridian(input);

  const options: ChartOptions = { ...DEFAULT_OPTIONS };
  if (raw.true_solar_time !== undefined) options.trueSolarTime = raw.true_solar_time;
  if (raw.day_boundary) options.dayBoundary = raw.day_boundary;
  if (raw.year_boundary) options.yearBoundary = raw.year_boundary;
  if (raw.method) options.method = raw.method;
  if (raw.yuan) options.yuan = raw.yuan;

  const ephemeris: EphemerisContext = initEphemeris(context.ephemerisPath);
  return {
    moment: resolveMoment(input, place, options, ephemeris),
    place,
    label: labelFor(raw, place, context),
  };
}

/**
 * The 年命 an agent asked for, placed on a chart already cast.
 *
 * Nothing is inferred: without `born` there is no 年命, and without `gender`
 * there is no 行年 — the count runs one way from 寅 and the other from 申, and
 * a direction guessed is a pair placed in the wrong palace.
 */
export function resolveNianming(
  raw: RawInput,
  chart: QimenChart,
  context: ToolContext,
): Nianming | undefined {
  if (!raw.born) return undefined;

  const options: NianmingOptions = { count: raw.years_count ?? 'sui' };
  const birth = resolveBirth(raw, chart.moment.input.timezone, chart.moment.options, context);

  return nianmingOf(
    chart,
    {
      birthYear: birth.pillars.year,
      ...(raw.gender ? { years: yearsLived(birth, chart.moment, options), gender: raw.gender } : {}),
    },
    options,
  );
}

/**
 * The moment of a birth, read on its own clock.
 *
 * The zone is the birth's own when given, the fallback's otherwise — and it
 * wins over whatever `resolvePlace` answers, because a `location_id` names
 * where the question is asked, not where the birth was. The place is then
 * pinned to the zone's meridian so the true-solar correction is exactly
 * zero: a birth is a calendar fact, and the calendar runs on the clock.
 * Noon for a date given alone; it decides nothing but a birth within hours
 * of 立春, and there the hour has to be given.
 */
export function resolveBirth(
  raw: RawInput,
  timezone: string,
  options: ChartOptions,
  context: ToolContext,
): Moment {
  const input: LocalMoment = {
    date: raw.born as string,
    time: raw.born_time ?? '12:00',
    timezone: raw.born_timezone ?? timezone,
  };
  const { place } = resolvePlace({ ...raw, timezone: input.timezone }, context);
  return resolveMoment(
    input,
    { ...place, timezone: input.timezone, longitude: zoneMeridian(input) },
    options,
    initEphemeris(context.ephemerisPath),
  );
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
      throw new McpError('UNKNOWN_LOCATION', { id: raw.location_id });
    }
    return {
      place: { latitude: found.latitude, longitude: found.longitude, timezone: found.timezone },
    };
  }

  if (raw.latitude !== undefined && raw.longitude !== undefined && raw.timezone) {
    return { place: { latitude: raw.latitude, longitude: raw.longitude, timezone: raw.timezone } };
  }

  if (raw.latitude !== undefined || raw.longitude !== undefined) {
    throw new McpError('INCOMPLETE_COORDINATES');
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
