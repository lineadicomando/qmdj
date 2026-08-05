import { DateTime, IANAZone } from 'luxon';
import { ChartError, warning, type ChartWarning } from './errors.js';

/** A wall-clock moment: what the clock read, and where it was reading it. */
export interface LocalMoment {
  /** `YYYY-MM-DD`, never localised: a shared URL must mean the same everywhere. */
  date: string;
  /** `HH:mm` or `HH:mm:ss`, in local clock time. */
  time: string;
  /** IANA identifier, e.g. `Europe/Rome`, `Asia/Shanghai`. */
  timezone: string;
}

export interface ResolvedTime {
  /** Julian Day in Universal Time — what every ephemeris call takes. */
  julianDayUT: number;
  /** The instant in UTC, ISO 8601. */
  utc: string;
  /** The same instant as local clock time, ISO 8601 with offset. */
  local: string;
  /** Offset from UTC in minutes, at that instant and in that zone. */
  offsetMinutes: number;
}

export interface TimeResolution {
  time: ResolvedTime;
  warnings: ChartWarning[];
}

const DATE_PATTERN = /^-?\d{4,}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

/**
 * Converts a local date and time to Universal Time, applying the historical
 * rules of the zone — wartime summer time, the local mean time in force
 * before a country adopted a standard zone, and every later change.
 *
 * This is the most delicate step of the whole engine, more so than in a natal
 * chart. An hour of error moves the hour pillar outright, and for anyone born
 * near midnight it moves the day pillar with it — two of the four pillars,
 * from a mistake with no visible symptom.
 *
 * The zone database is the authority here and is deliberately not
 * second-guessed. Two cases where that matters: China ran five zones until
 * 1949 and has run one since, and it observed summer time from 1986 to 1991.
 * `Asia/Shanghai` knows both; a fixed +08:00 offset knows neither.
 */
export function resolveTime(moment: LocalMoment): TimeResolution {
  const warnings: ChartWarning[] = [];

  if (!DATE_PATTERN.test(moment.date)) {
    throw new ChartError('INVALID_DATE', { date: moment.date });
  }
  if (!TIME_PATTERN.test(moment.time)) {
    throw new ChartError('INVALID_TIME', { time: moment.time });
  }
  if (!IANAZone.isValidZone(moment.timezone)) {
    throw new ChartError('UNKNOWN_TIMEZONE', { timezone: moment.timezone });
  }

  const wallClock = `${moment.date}T${normalizeTime(moment.time)}`;
  const local = DateTime.fromISO(wallClock, { zone: moment.timezone });

  if (!local.isValid) {
    throw new ChartError('INVALID_DATE', {
      date: wallClock,
      reason: local.invalidReason ?? 'unknown',
    });
  }

  const interpretations = countInterpretations(wallClock, moment.timezone);
  if (interpretations === 0) {
    warnings.push(warning('NONEXISTENT_LOCAL_TIME', { ...moment }));
  } else if (interpretations > 1) {
    warnings.push(warning('AMBIGUOUS_LOCAL_TIME', { ...moment }));
  }

  const utc = local.toUTC();

  return {
    time: {
      julianDayUT: toJulianDay(
        utc.year,
        utc.month,
        utc.day,
        utc.hour + utc.minute / 60 + utc.second / 3600 + utc.millisecond / 3_600_000,
      ),
      utc: utc.toISO({ suppressMilliseconds: true }) ?? '',
      local: local.toISO({ suppressMilliseconds: true }) ?? '',
      offsetMinutes: local.offset,
    },
    warnings,
  };
}

/** The reverse of `resolveTime`: a Julian Day back to wall-clock time in a zone. */
export function fromJulianDay(julianDayUT: number, timezone: string): DateTime {
  if (!IANAZone.isValidZone(timezone)) {
    throw new ChartError('UNKNOWN_TIMEZONE', { timezone });
  }
  return DateTime.fromMillis(julianDayToMillis(julianDayUT), { zone: 'utc' }).setZone(timezone);
}

/**
 * The present instant, as local clock time in a zone.
 *
 * It lives here because "what time is it now" is a question about a timezone,
 * and every surface that accepts the present — the CLI without a date, an MCP
 * tool without one — must answer it the same way. It matters most for an
 * agent, which does not know the current date and must not guess it.
 */
export function currentMoment(timezone: string): LocalMoment {
  if (!IANAZone.isValidZone(timezone)) {
    throw new ChartError('UNKNOWN_TIMEZONE', { timezone });
  }
  const now = DateTime.now().setZone(timezone);
  return {
    date: now.toFormat('yyyy-MM-dd'),
    time: now.toFormat('HH:mm:ss'),
    timezone,
  };
}

/** The timezone of the system the process runs on. */
export function systemTimezone(): string {
  return DateTime.local().zoneName ?? 'UTC';
}

/**
 * The meridian a zone's clock keeps at a given moment: its offset from
 * Universal Time, at fifteen degrees an hour.
 *
 * This is the longitude to assume for a place given only as a timezone — the
 * one that leaves the longitude correction to true solar time at exactly
 * zero. The offset must be the one in force at the chart's moment, never the
 * present one: read from today's clock, an hour of summer time would put a
 * winter chart fifteen degrees east of its own zone, and the correction meant
 * to be zero at a full hour.
 */
export function zoneMeridian(moment: LocalMoment): number {
  return resolveTime(moment).time.offsetMinutes / 4;
}

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

/**
 * How many distinct UTC instants a given wall-clock reading corresponds to.
 *
 * - `0`: the time never existed (clocks jumped forward)
 * - `1`: the ordinary case
 * - `2`: the time is ambiguous (clocks fell back; it happened twice)
 */
function countInterpretations(wallClock: string, zone: string): number {
  const reference = DateTime.fromISO(wallClock, { zone: 'utc' });
  if (!reference.isValid) return 1;

  const base = DateTime.fromISO(wallClock, { zone });
  const candidateOffsets = new Set<number>([
    base.offset,
    base.minus({ days: 1 }).offset,
    base.plus({ days: 1 }).offset,
  ]);

  const target = reference.toFormat("yyyy-MM-dd'T'HH:mm:ss");
  let matches = 0;
  for (const offset of candidateOffsets) {
    const candidate = DateTime.fromMillis(reference.toMillis() - offset * 60_000, { zone });
    if (candidate.toFormat("yyyy-MM-dd'T'HH:mm:ss") === target) matches += 1;
  }
  return matches;
}

/** Milliseconds since the Unix epoch, from a Julian Day in UT. */
export function julianDayToMillis(julianDayUT: number): number {
  return Math.round((julianDayUT - 2440587.5) * 86_400_000);
}

/**
 * Julian Day from the Gregorian calendar (Meeus, *Astronomical Algorithms*,
 * chapter 7).
 *
 * Computed here rather than through `sweph.julday` to keep the time
 * conversion independent of the native module: it is the part that needs
 * testing most, and it must be testable without ephemeris files.
 */
export function toJulianDay(year: number, month: number, day: number, hour: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFraction = day + hour / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + b - 1524.5;
}
