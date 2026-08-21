import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DateTime } from 'luxon';
import sweph from 'sweph';
import { ChartError, warning, type ChartWarning } from './errors.js';
import { julianDayToMillis } from './time.js';

/**
 * Minimal ephemeris files for `swisseph` mode, covering 1800-2399.
 * Downloadable with `npm run ephe:download -w @shipan/core`.
 */
const REQUIRED_FILES = ['sepl_18.se1', 'semo_18.se1'];

/**
 * The directory holding the 距星 catalogue, which is versioned and never
 * downloaded.
 *
 * It goes on the ephemeris path in front of the downloadable directory, and
 * in either mode: the twenty-eight lines of `data/sefstars.txt` are the whole
 * of the 宿度 frame, so a chart that could not find them would have to refuse
 * rather than fall back, and a reader who downloaded the full Swiss Ephemeris
 * star file must not silently get a different frame from one who did not.
 */
const STAR_DATA_DIR = fileURLToPath(new URL('../data', import.meta.url));

/**
 * Separates directories in the ephemeris path.
 *
 * Swiss Ephemeris accepts a semicolon everywhere and a colon only on Unix,
 * where a colon would also cut a Windows drive letter in half.
 */
const PATH_SEPARATOR = ';';

export type EphemerisMode = 'swisseph' | 'moshier';

export interface EphemerisContext {
  /**
   * `swisseph` uses the `.se1` files (arc-second precision); `moshier` is the
   * built-in analytical mode, needing no external file, accurate to about a
   * tenth of an arc second for the Sun and the Moon.
   *
   * The distinction matters less here than in a natal chart: a tenth of an
   * arc second of solar longitude moves a solar term by well under a second
   * of time, and no pillar turns on that.
   */
  mode: EphemerisMode;
  /** Flags to pass to `calc_ut` and the crossing functions. */
  flags: number;
  /** Directory of the ephemeris files, `null` in Moshier mode. */
  path: string | null;
  warnings: ChartWarning[];
}

let cache: { key: string; context: EphemerisContext } | undefined;

/**
 * The Julian Days the Moshier ephemeris covers, which are the hard bounds in
 * either mode: outside its `.se1` files Swiss Ephemeris falls back to Moshier
 * by itself, and beyond Moshier there is nothing left to fall back to. The
 * numbers are sweph's own (MOSHPLEPH_START and MOSHPLEPH_END), roughly
 * 3000 BC to 3000 AD.
 */
const EPHEMERIS_START_JD = 625000.5;
const EPHEMERIS_END_JD = 2818000.5;

/**
 * Refuses an instant the ephemeris cannot answer for, before sweph is asked.
 *
 * Asked anyway, sweph reports the failure as an internal message about files
 * and Julian Days — a fault addressed to nobody. This names the date and the
 * range instead, which is what whoever typed the date can act on.
 */
export function assertEphemerisRange(julianDayUT: number): void {
  if (julianDayUT >= EPHEMERIS_START_JD && julianDayUT <= EPHEMERIS_END_JD) return;
  throw new ChartError('DATE_OUT_OF_RANGE', {
    date: calendarDay(julianDayUT),
    from: calendarDay(EPHEMERIS_START_JD),
    to: calendarDay(EPHEMERIS_END_JD),
  });
}

/** The UTC date a Julian Day falls on — or the day itself, past what a date can say. */
function calendarDay(julianDayUT: number): string {
  const day = DateTime.fromMillis(julianDayToMillis(julianDayUT), { zone: 'utc' });
  return day.isValid ? (day.toISODate() as string) : `JD ${julianDayUT}`;
}

/**
 * Prepares Swiss Ephemeris and settles the calculation mode.
 *
 * If the `.se1` files are absent it falls back to Moshier automatically: the
 * project stays usable without downloading anything.
 */
export function initEphemeris(explicitPath?: string): EphemerisContext {
  const path = explicitPath ?? process.env['SE_EPHE_PATH'] ?? defaultEphemerisPath();
  if (cache?.key === path) return cache.context;

  const hasRequired = REQUIRED_FILES.every((file) => existsSync(joinPath(path, file)));

  const context: EphemerisContext = hasRequired
    ? {
        mode: 'swisseph',
        flags: sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED,
        path,
        warnings: [],
      }
    : {
        mode: 'moshier',
        flags: sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SPEED,
        path: null,
        warnings: [warning('MOSHIER_FALLBACK', { path })],
      };

  sweph.set_ephe_path(
    hasRequired ? `${STAR_DATA_DIR}${PATH_SEPARATOR}${path}` : STAR_DATA_DIR,
  );

  cache = { key: path, context };
  return context;
}

/** Clears the initialisation cache. Needed by tests. */
export function resetEphemerisCache(): void {
  cache = undefined;
}

/**
 * Apparent geocentric ecliptic longitude of the Sun, in degrees.
 *
 * Apparent and not geometric: the solar terms are defined on the position the
 * Sun is seen at, aberration and nutation included, which is what every
 * published almanac tabulates.
 */
export function sunLongitude(julianDayUT: number, context: EphemerisContext): number {
  return bodyLongitude(julianDayUT, sweph.constants.SE_SUN, context);
}

/** Apparent geocentric ecliptic longitude of the Moon, in degrees. */
export function moonLongitude(julianDayUT: number, context: EphemerisContext): number {
  return bodyLongitude(julianDayUT, sweph.constants.SE_MOON, context);
}

function bodyLongitude(julianDayUT: number, body: number, context: EphemerisContext): number {
  assertEphemerisRange(julianDayUT);
  const result = sweph.calc_ut(julianDayUT, body, context.flags);
  if (result.flag < 0) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: result.error || 'calc_ut failed without a message',
      julianDay: julianDayUT,
    });
  }
  const longitude = result.data[0];
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: 'calc_ut returned no longitude',
      julianDay: julianDayUT,
    });
  }
  return normalize360(longitude);
}

/**
 * The bodies the engine asks for by name, sweph's numbers kept on this side.
 *
 * The two beyond the seven are elements rather than bodies, and they are the
 * *mean* ones deliberately. 羅睺, 計都 and 月孛 are 隱曜 — computed positions,
 * never observed ones — and what the tradition transmits for them is a mean
 * motion: eighteen years and some for the nodes, a little under nine for the
 * apogee. The osculating node wobbles a degree and a half either side of the
 * mean in a fortnight, which is a quantity no text that names these ever
 * meant. See the 七政四餘 section of `docs/sources.md`.
 */
const BODY_NUMBERS = {
  sun: sweph.constants.SE_SUN,
  moon: sweph.constants.SE_MOON,
  mercury: sweph.constants.SE_MERCURY,
  venus: sweph.constants.SE_VENUS,
  mars: sweph.constants.SE_MARS,
  jupiter: sweph.constants.SE_JUPITER,
  saturn: sweph.constants.SE_SATURN,
  /** 月之交點, ascending. The descending one is this plus 180°. */
  meanNode: sweph.constants.SE_MEAN_NODE,
  /** 月之遠地點, which 月孛 is. */
  meanApogee: sweph.constants.SE_MEAN_APOG,
} as const;

export type EphemerisBody = keyof typeof BODY_NUMBERS;

/** Where a body stands and how fast, both in degrees of ecliptic longitude. */
export interface BodyPosition {
  longitude: number;
  /** Degrees a day. Negative is retrograde, which the seven do and the two cannot. */
  speed: number;
}

/**
 * Apparent geocentric ecliptic longitude of a body, with its daily motion.
 *
 * The speed comes back because whether a planet goes forward or backward is
 * part of where it is, not a reading of it: 順 and 逆 are named in every text
 * that names the 七政. 留 is not derived from it, because a station is a
 * threshold on this number and no source consulted here states one.
 */
export function bodyPosition(
  body: EphemerisBody,
  julianDayUT: number,
  context: EphemerisContext,
): BodyPosition {
  assertEphemerisRange(julianDayUT);
  const result = sweph.calc_ut(julianDayUT, BODY_NUMBERS[body], context.flags);
  if (result.flag < 0) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: result.error || 'calc_ut failed without a message',
      julianDay: julianDayUT,
    });
  }
  const [longitude, , , speed] = result.data;
  if (!Number.isFinite(longitude) || !Number.isFinite(speed)) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: `calc_ut returned no position for ${body}`,
      julianDay: julianDayUT,
    });
  }
  return { longitude: normalize360(longitude as number), speed: speed as number };
}

/**
 * Apparent ecliptic longitude of a fixed star, by its nomenclature name.
 *
 * The leading comma is Swiss Ephemeris' own syntax for looking a star up by
 * `alVir` rather than by `Spica`: the traditional names are several per star
 * and the nomenclature is one, which is what a boundary has to be.
 */
export function starLongitude(
  nomenclature: string,
  julianDayUT: number,
  context: EphemerisContext,
): number {
  assertEphemerisRange(julianDayUT);
  const result = sweph.fixstar2_ut(`,${nomenclature}`, julianDayUT, context.flags);
  if (result.flag < 0 || !Number.isFinite(result.data[0])) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: result.error || `no position for the star ${nomenclature}`,
      julianDay: julianDayUT,
    });
  }
  return normalize360(result.data[0] as number);
}

/**
 * The instant at which the Sun's apparent longitude next crosses `target`,
 * searching forward from `after`.
 *
 * `solcross_ut` is Swiss Ephemeris' own crossing solver: it is both faster
 * and more accurate than bisecting on `calc_ut`, and it handles the wrap at
 * 360° without any special case.
 */
export function sunCrossing(
  target: number,
  after: number,
  context: EphemerisContext,
): number {
  assertEphemerisRange(after);
  const result = sweph.solcross_ut(normalize360(target), after, context.flags);
  if (typeof result.date !== 'number' || !Number.isFinite(result.date)) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: result.error || `no solar crossing of ${target}° found after JD ${after}`,
      julianDay: after,
    });
  }
  return result.date;
}

export function normalize360(degrees: number): number {
  const value = degrees % 360;
  return value < 0 ? value + 360 : value;
}

function defaultEphemerisPath(): string {
  // From `dist/ephemeris.js` (or `src/ephemeris.ts` under tsx) up to the package root.
  return fileURLToPath(new URL('../ephe', import.meta.url));
}

function joinPath(base: string, file: string): string {
  return base.endsWith('/') ? `${base}${file}` : `${base}/${file}`;
}
