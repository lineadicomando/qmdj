import { sunCrossing, type EphemerisContext } from '../ephemeris.js';
import { ganzhiOf, type Ganzhi } from '../ganzhi.js';
import type { Moment } from '../pillars.js';
import { SOLAR_TERMS } from '../solar-terms.js';
import { fromJulianDay } from '../time.js';

/**
 * Whose reckoning the luck cycles follow.
 *
 * The tradition sets the direction from the polarity of the year stem
 * together with the person's gender: a yang year runs forwards for a man and
 * backwards for a woman, a yin year the other way about. It is stated here as
 * the traditional rule, and it is the only thing this value is used for.
 */
export type Gender = 'male' | 'female';

export interface LuckCycle {
  ganzhi: Ganzhi;
  /** Age at which the cycle opens, in whole years from the start of the run. */
  startAge: number;
  /** Julian Day at which it opens. */
  startJD: number;
}

export interface LuckCycles {
  /** `true` when the cycles run forwards from the month pillar (順行). */
  forward: boolean;
  /** How long after birth the run begins. */
  start: { years: number; months: number; days: number };
  /** Julian Day at which the first cycle opens. */
  startJD: number;
  cycles: LuckCycle[];
}

/**
 * How finely the distance to the solar term is measured.
 *
 * Both readings start from the same rule — three days of the calendar answer
 * to one year lived, a day to four months, a double hour to ten days — and
 * differ on where to stop:
 *
 * - `shichen` counts whole days and whole double hours, and drops what is
 *   left. It is the classical reading, from a time reckoned in double hours
 *   and not in minutes, and it yields starting days in multiples of ten.
 * - `minute` carries the division down to the minute.
 *
 * They disagree by up to ten days on when the first cycle opens. Neither is a
 * mistake, so neither is assumed.
 */
export type LuckGranularity = 'shichen' | 'minute';

/**
 * Minutes of elapsed time that stand for one year of life, for the `minute`
 * reading. The three constants are one rule divided three ways.
 */
const MINUTES_PER_YEAR = 3 * 1440;
const MINUTES_PER_MONTH = MINUTES_PER_YEAR / 12;
const MINUTES_PER_DAY = MINUTES_PER_MONTH / 30;

/**
 * The decade cycles of luck (大運), and when the run begins.
 *
 * The pillars step away from the month pillar, forwards or backwards. Where
 * the run *starts* is measured against the solar terms: forwards, the
 * distance to the next jie; backwards, the distance back to the one that
 * opened the month. It is the same distance a chart is already standing in,
 * read as an age.
 */
export function luckCycles(
  moment: Moment,
  gender: Gender,
  count: number,
  granularity: LuckGranularity,
  context: EphemerisContext,
): LuckCycles {
  const yearIsYang = moment.pillars.year.stem.yang;
  const forward = yearIsYang === (gender === 'male');

  // Forwards, the run is measured to the jie ahead; backwards, to the one
  // that opened the month. Either way it is the distance the chart already
  // stands in, read as an age.
  const boundary = forward ? nextJieAfter(moment.julianDayUT, context) : moment.jie.julianDayUT;
  const from = Math.min(moment.julianDayUT, boundary);
  const to = Math.max(moment.julianDayUT, boundary);

  const { years, months, days } =
    granularity === 'minute'
      ? byMinute(to - from)
      : byShichen(from, to, moment.input.timezone);

  const startJD =
    fromJulianDay(moment.julianDayUT, moment.input.timezone)
      .plus({ years, months, days })
      .toMillis() /
      86_400_000 +
    2440587.5;

  const cycles: LuckCycle[] = [];
  for (let step = 1; step <= count; step += 1) {
    cycles.push({
      ganzhi: ganzhiOf(moment.pillars.month.index + (forward ? step : -step)),
      startAge: years + (step - 1) * 10,
      startJD: startJD + (step - 1) * 3652.425,
    });
  }

  return { forward, start: { years, months, days }, startJD, cycles };
}

interface Elapsed {
  years: number;
  months: number;
  days: number;
}

/** The `minute` reading: one division, carried all the way down. */
function byMinute(elapsedDays: number): Elapsed {
  let minutes = elapsedDays * 1440;
  const years = Math.floor(minutes / MINUTES_PER_YEAR);
  minutes -= years * MINUTES_PER_YEAR;
  const months = Math.floor(minutes / MINUTES_PER_MONTH);
  minutes -= months * MINUTES_PER_MONTH;
  return { years, months, days: Math.floor(minutes / MINUTES_PER_DAY) };
}

/**
 * The `shichen` reading: whole days and whole double hours, nothing finer.
 *
 * Days are counted between calendar dates and double hours between positions
 * in the day, so a borrow is needed when the second position falls earlier
 * than the first — the same carry any date arithmetic needs.
 *
 * The double hour of the Rat straddles midnight, and here its late half is
 * counted as the last position of its own day rather than the first of the
 * next; otherwise the borrow and the day count would disagree.
 */
function byShichen(fromJD: number, toJD: number, timezone: string): Elapsed {
  const start = fromJulianDay(fromJD, timezone);
  const end = fromJulianDay(toJD, timezone);

  const position = (hour: number): number => (hour === 23 ? 11 : Math.floor((hour + 1) / 2));

  let hours = position(end.hour) - position(start.hour);
  let days = Math.round(end.startOf('day').diff(start.startOf('day'), 'days').days);
  if (hours < 0) {
    hours += 12;
    days -= 1;
  }

  const monthsFromHours = Math.floor((hours * 10) / 30);
  let months = days * 4 + monthsFromHours;
  const years = Math.floor(months / 12);
  months -= years * 12;

  return { years, months, days: hours * 10 - monthsFromHours * 30 };
}

/** The first jie strictly after an instant. */
function nextJieAfter(julianDayUT: number, context: EphemerisContext): number {
  let earliest = Infinity;
  for (const term of SOLAR_TERMS) {
    if (term.kind !== 'jie') continue;
    const crossing = sunCrossing(term.longitude, julianDayUT, context);
    if (crossing > julianDayUT && crossing < earliest) earliest = crossing;
  }
  return earliest;
}

/**
 * The year pillars a run of years carries (流年).
 *
 * Plain arithmetic on the sexagenary year, given here so that a surface does
 * not have to know that 1984 opened a cycle.
 */
export function annualPillars(fromYear: number, count: number): { year: number; ganzhi: Ganzhi }[] {
  return Array.from({ length: count }, (_, offset) => ({
    year: fromYear + offset,
    ganzhi: ganzhiOf(fromYear + offset - 1984),
  }));
}
