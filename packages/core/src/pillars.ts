import { sunCrossing, type EphemerisContext } from './ephemeris.js';
import type { ChartWarning } from './errors.js';
import {
  dayGanzhi,
  hourBranch,
  hourGanzhi,
  monthGanzhi,
  yearGanzhi,
  type Branch,
  type Ganzhi,
} from './ganzhi.js';
import { lunarDate, localDayNumber, type LunarDate } from './lunar.js';
import { jieAt, solarTermAt, type SolarTerm } from './solar-terms.js';
import { fromJulianDay, resolveTime, type LocalMoment } from './time.js';
import { trueSolarTime, type TrueSolarTime } from './true-solar.js';
import type { ChartOptions, Place } from './types.js';
import { zhirunAssignment, type ZhirunAssignment } from './zhirun.js';

export interface Pillars {
  year: Ganzhi;
  month: Ganzhi;
  day: Ganzhi;
  hour: Ganzhi;
}

export interface Moment {
  /** The wall-clock input, as given. */
  input: LocalMoment;
  /** Julian Day in Universal Time — the instant itself. */
  julianDayUT: number;
  /** The instant in UTC, ISO 8601. */
  utc: string;
  /** The instant as local clock time, ISO 8601. */
  local: string;
  /** True solar time at the place, reported whether or not it was applied. */
  solar: TrueSolarTime;
  /** The four pillars. */
  pillars: Pillars;
  /** The hour branch the instant fell under, after any correction. */
  hourBranch: Branch;
  /** The solar term in force. */
  solarTerm: SolarTerm;
  /** The jie that opened the month. */
  jie: SolarTerm;
  /**
   * The lunar date, for display and for the methods that count by it.
   *
   * Computed the first time it is read, and kept thereafter. It is the only
   * field here that costs anything to produce — the Moon has to be searched
   * for, where the Sun is nearly free — and scanning an interval reads every
   * other field of every hour without ever reaching this one.
   */
  readonly lunar: LunarDate;
  /**
   * Where the day stands in the 置閏 bookkeeping — which term its block
   * serves, which yuan its stretch is, whether the block is intercalated.
   *
   * Deferred like `lunar`, and read only by the zhirun method, so no other
   * chart pays for the solstice searches. Unlike `lunar` it does not
   * serialise: it is working state, and what matters from it the ju of a
   * zhirun chart reports itself.
   */
  readonly zhirun: ZhirunAssignment;
  /** The options this was computed with. A saved result must reproduce. */
  options: ChartOptions;
  warnings: ChartWarning[];
}

/**
 * Resolves an instant into everything the charts are built on.
 *
 * The order of operations is the whole difficulty, because each step can move
 * the one after it:
 *
 * 1. Clock time becomes Universal Time, through the historical rules of the
 *    zone. An hour of error here is an hour of error everywhere below.
 * 2. Optionally, clock time becomes true solar time at the place. This does
 *    not move the instant, only the hour it is called — but that hour decides
 *    the hour branch, and near midnight it decides the day.
 * 3. The day pillar is read off the resulting date, advanced by one when the
 *    hour of the Rat has already opened the next day.
 * 4. The month and year pillars come from the solar terms, not from the
 *    calendar: the year turns at Lichun and the month at each jie.
 */
export function resolveMoment(
  input: LocalMoment,
  place: Place,
  options: ChartOptions,
  context: EphemerisContext,
): Moment {
  const { time, warnings } = resolveTime(input);
  const solar = trueSolarTime(time.julianDayUT, place.longitude, time.offsetMinutes);
  const clock = fromJulianDay(time.julianDayUT, input.timezone);

  // Which clock the pillars are read from. The instant is the same either
  // way; what changes is the hour it is called, and the date it falls on.
  const effectiveHour = options.trueSolarTime
    ? solar.hour
    : clock.hour + clock.minute / 60 + clock.second / 3600;
  const effectiveDay =
    localDayNumber(time.julianDayUT, input.timezone) + (options.trueSolarTime ? solar.dayShift : 0);

  // The hour of the Rat opens at 23:00, and from that moment the hour stem is
  // read from the day it opens — every school agrees on that much. What they
  // dispute is the day pillar: `zishi` turns it over at 23:00 with the hour,
  // `midnight` holds it back to the civil date. The two therefore disagree
  // only in that one hour, and there they disagree about a quarter of the
  // chart while leaving the other three pillars identical.
  const opensNextDay = effectiveHour >= 23 ? 1 : 0;
  const dayForHour = dayGanzhi(effectiveDay + opensNextDay);
  const day = options.dayBoundary === 'zishi' ? dayForHour : dayGanzhi(effectiveDay);

  const branch = hourBranch(Math.floor(effectiveHour));
  const hour = hourGanzhi(dayForHour.stem.index, branch.index);

  const solarTerm = solarTermAt(time.julianDayUT, context);
  const jie = jieAt(time.julianDayUT, context);

  // Deferred, because it is the one expensive thing here and most callers
  // never look at it. Finding the Sun's crossings is a matter of microseconds;
  // finding the Moon's costs around fifty times as much, and a Qi Men chart
  // cast by 拆補 reads the solar term alone. `chunjie` below is the exception,
  // and asking for it is what pays for it.
  const lunar = deferred(() => lunarDate(time.julianDayUT, context));

  const year = yearGanzhi(
    options.yearBoundary === 'chunjie'
      ? lunar().year
      : fromJulianDay(lastCrossingBefore(315, time.julianDayUT, context), input.timezone).year,
  );
  const month = monthGanzhi(year.stem.index, jie.term.monthBranch as number);

  const moment: Moment = {
    input,
    julianDayUT: time.julianDayUT,
    utc: time.utc,
    local: time.local,
    solar,
    pillars: { year, month, day, hour },
    hourBranch: branch,
    solarTerm,
    jie,
    options,
    // The context's warnings travel with the moment: which ephemeris answered
    // is a fact about how this was computed, and a saved chart must still
    // explain itself. This is the only road a MOSHIER_FALLBACK has to a
    // surface — the context itself never leaves the engine.
    warnings: [...context.warnings, ...warnings],
  } as Moment;

  // Enumerable, so a moment still serialises whole: whoever hands one to
  // `JSON.stringify` gets the lunar date, and pays for it there.
  Object.defineProperty(moment, 'lunar', { get: lunar, enumerable: true });

  // The futou is a fact about the day pillar, so the bookkeeping reads the
  // same day number the pillar was read from — shifted by the late hour of
  // the Rat exactly when the pillar was.
  const zhirun = deferred(() =>
    zhirunAssignment({
      day: options.dayBoundary === 'zishi' ? effectiveDay + opensNextDay : effectiveDay,
      julianDayUT: time.julianDayUT,
      dayOf: (jd) => localDayNumber(jd, input.timezone),
      context,
    }),
  );
  Object.defineProperty(moment, 'zhirun', { get: zhirun, enumerable: false });

  return moment;
}

/** A value computed at most once, when something first asks for it. */
function deferred<T>(compute: () => T): () => T {
  let value: T | undefined;
  return () => (value ??= compute());
}

/**
 * The last time the Sun reached `target`, at or before an instant.
 *
 * The crossing solver only searches forward, so the search starts more than a
 * year back — which guarantees at least one crossing — and steps until the
 * next one would overshoot.
 */
function lastCrossingBefore(
  target: number,
  julianDayUT: number,
  context: EphemerisContext,
): number {
  let latest = sunCrossing(target, julianDayUT - 400, context);
  for (;;) {
    const next = sunCrossing(target, latest + 1, context);
    if (next > julianDayUT) return latest;
    latest = next;
  }
}
