import {
  moonLongitude,
  normalize360,
  sunCrossing,
  sunLongitude,
  type EphemerisContext,
} from './ephemeris.js';
import { fromJulianDay, toJulianDay } from './time.js';

/** Mean length of a lunation, in days. Used only to seed searches. */
const SYNODIC_MONTH = 29.530588853;

/**
 * The meridian the Chinese calendar is reckoned on: 120°E, eight hours ahead
 * of Universal Time.
 *
 * Fixed, and deliberately not the chart's timezone. The lunar calendar is a
 * published artefact rather than a local observation: the same date holds
 * worldwide, exactly as a Gregorian date does. Reckoning it on the observer's
 * zone would give a Roman chart a different lunar date from a Beijing one for
 * the same instant, which no almanac would recognise.
 *
 * It is not the civil offset of `Asia/Shanghai` either. China ran its clocks
 * an hour ahead through the war years of 1942 to 1945, and again each summer
 * from 1986 to 1991, while the calendar went on being computed here.
 */
const CALENDAR_OFFSET_DAYS = 8 / 24;

/**
 * The same meridian as an IANA zone, for the one place that needs a calendar
 * date back rather than a day number.
 *
 * The sign is inverted on purpose and not by mistake: in the `Etc/` zones the
 * offset counts degrees west, so `Etc/GMT-8` is eight hours *ahead* of UTC.
 */
export const CALENDAR_ZONE = 'Etc/GMT-8';

export interface LunarDate {
  /**
   * The year the lunar new year opened. Not the Gregorian year: January dates
   * usually still belong to the previous lunar year.
   */
  year: number;
  /** 1 to 12. A leap month repeats the number of the month it follows. */
  month: number;
  /** True when this is the intercalary repetition (閏月). */
  leap: boolean;
  /** 1 to 30. */
  day: number;
  /** Julian Day of the new moon that opened this month. */
  monthStartJD: number;
}

/**
 * The instant of the new moon nearest to `julianDayUT`, searching from it.
 *
 * A new moon is the instant the Moon and the Sun share an ecliptic longitude.
 * Swiss Ephemeris has no solver for it — `mooncross_ut` crosses a *fixed*
 * longitude, and the Sun's is moving — so the elongation is driven to zero
 * directly. It is well behaved: the elongation grows by about 12° a day and
 * never stalls, so a secant step converges in three or four iterations.
 */
export function newMoonNear(julianDayUT: number, context: EphemerisContext): number {
  let jd = julianDayUT;

  for (let iteration = 0; iteration < 30; iteration += 1) {
    const difference = signedElongation(jd, context);
    if (Math.abs(difference) < 1e-6) break;
    // Mean relative motion of Moon against Sun, degrees per day.
    jd -= difference / 12.190749;
  }

  return jd;
}

/** Moon minus Sun in ecliptic longitude, folded to (-180, 180]. */
function signedElongation(julianDayUT: number, context: EphemerisContext): number {
  const difference = normalize360(
    moonLongitude(julianDayUT, context) - sunLongitude(julianDayUT, context),
  );
  return difference > 180 ? difference - 360 : difference;
}

/** The last new moon at or before `julianDayUT`. */
export function newMoonBefore(julianDayUT: number, context: EphemerisContext): number {
  let candidate = newMoonNear(julianDayUT, context);
  while (candidate > julianDayUT + 1e-7) {
    candidate = newMoonNear(candidate - SYNODIC_MONTH, context);
  }
  return candidate;
}

/** The first new moon strictly after `julianDayUT`. */
export function newMoonAfter(julianDayUT: number, context: EphemerisContext): number {
  let candidate = newMoonNear(julianDayUT, context);
  while (candidate <= julianDayUT + 1e-7) {
    candidate = newMoonNear(candidate + SYNODIC_MONTH, context);
  }
  return candidate;
}

/**
 * The Julian Day Number of the local calendar date at a place.
 *
 * Derived from the calendar fields rather than from the epoch milliseconds:
 * local midnight east of Greenwich falls on the previous UTC day, and dividing
 * milliseconds would silently land a day early.
 */
export function localDayNumber(julianDayUT: number, timezone: string): number {
  const local = fromJulianDay(julianDayUT, timezone);
  return Math.round(toJulianDay(local.year, local.month, local.day, 12));
}

/**
 * The Julian Day Number of the date at the calendar's own meridian.
 *
 * The lunar calendar counts *days*, not instants: a new moon at 23:50 opens
 * the month on that date, one at 00:10 on the next. Every comparison below
 * goes through here, so that the boundary always falls at midnight on 120°E.
 */
function calendarDay(julianDayUT: number): number {
  return Math.floor(julianDayUT + 0.5 + CALENDAR_OFFSET_DAYS);
}

/**
 * The same day number, for the 曆注, which count days on the same meridian.
 *
 * An almanac page is the artefact the lunar date is: 建除 and the lodge are
 * printed against a date and that date is the same one in Rome as in Beijing.
 * So the layer reckons its day here rather than on the chart's zone, and
 * `dayBoundary` never reaches it — the page describes a day and the pillars
 * describe an instant, which is why the two can disagree and each says which
 * it is.
 */
export function calendarDayNumber(julianDayUT: number): number {
  return calendarDay(julianDayUT);
}

/**
 * The winter solstice at or before `julianDayUT`.
 *
 * Month eleven is defined as the month containing the winter solstice, so
 * every numbering below is anchored on it rather than on the new year.
 */
function winterSolsticeBefore(julianDayUT: number, context: EphemerisContext): number {
  // Search from more than a year back, then step forward while the next one
  // still precedes the date.
  let candidate = sunCrossing(270, julianDayUT - 400, context);
  for (;;) {
    const next = sunCrossing(270, candidate + 1, context);
    if (next > julianDayUT) return candidate;
    candidate = next;
  }
}

/**
 * The new moon opening the month that *contains* a given instant's day.
 *
 * Not the same as the last new moon before that instant. The calendar
 * compares days, not moments: when the winter solstice falls at 00:23 and the
 * new moon at 19:47 of the same date, the month opening that evening is still
 * the month the solstice belongs to — and so it is month eleven, on which the
 * whole numbering hangs.
 */
function monthStartContaining(julianDayUT: number, context: EphemerisContext): number {
  const candidate = newMoonBefore(julianDayUT, context);
  const next = newMoonAfter(candidate, context);
  return calendarDay(next) <= calendarDay(julianDayUT) ? next : candidate;
}

/** Whether a lunar month contains a zhongqi — a term at a multiple of 30°. */
function containsZhongqi(startJD: number, endJD: number, context: EphemerisContext): boolean {
  const startLongitude = sunLongitude(startJD, context);
  // The next multiple of 30° the Sun will reach after the month opens.
  const target = (Math.floor(startLongitude / 30) + 1) * 30;
  const crossing = sunCrossing(target, startJD, context);
  return calendarDay(crossing) < calendarDay(endJD);
}

/**
 * The lunar date of an instant, as read at a place.
 *
 * The rules, in the order they bite:
 *
 * 1. A month runs from one new moon to the next, and the day of the new moon
 *    is day one.
 * 2. The month containing the winter solstice is month eleven.
 * 3. Between one month eleven and the next there are twelve months, or
 *    thirteen. When there are thirteen, the first month containing no zhongqi
 *    is intercalary and repeats the number of the month before it.
 *
 * Rule three is what makes the calendar hard, and it is why the leap month
 * cannot be decided by looking at one month alone: it is a property of the
 * whole year between two solstices.
 */
export function lunarDate(julianDayUT: number, context: EphemerisContext): LunarDate {
  const day = calendarDay(julianDayUT);

  // The span to number within runs from one month eleven to the next, and the
  // date has to sit inside it. Neither bound follows from the solstice alone:
  // month eleven opens at the new moon *before* the solstice, so in December
  // a date can fall on either side of that new moon while the solstice itself
  // stays put. Both directions therefore need correcting.
  let solstice = winterSolsticeBefore(julianDayUT, context);
  let eleventh = monthStartContaining(solstice, context);
  if (calendarDay(eleventh) > day) {
    solstice = winterSolsticeBefore(eleventh - 1, context);
    eleventh = monthStartContaining(solstice, context);
  }

  let nextSolstice = sunCrossing(270, solstice + 1, context);
  let nextEleventh = monthStartContaining(nextSolstice, context);
  if (calendarDay(nextEleventh) <= day) {
    solstice = nextSolstice;
    eleventh = nextEleventh;
    nextSolstice = sunCrossing(270, solstice + 1, context);
    nextEleventh = monthStartContaining(nextSolstice, context);
  }

  // Every new moon from this month eleven up to (not including) the next.
  const starts: number[] = [eleventh];
  for (;;) {
    const next = newMoonAfter(starts[starts.length - 1] as number, context);
    if (calendarDay(next) >= calendarDay(nextEleventh)) break;
    starts.push(next);
  }
  starts.push(nextEleventh);

  const monthCount = starts.length - 1;
  let leapIndex = -1;
  if (monthCount === 13) {
    for (let i = 0; i < monthCount; i += 1) {
      if (!containsZhongqi(starts[i] as number, starts[i + 1] as number, context)) {
        leapIndex = i;
        break;
      }
    }
  }

  // Number the months from eleven onwards. The intercalary month does not
  // take a number of its own: it repeats the one before it, which is why the
  // counter is held back on the step *into* it rather than on the step out.
  let number = 11;
  for (let index = 0; index < monthCount; index += 1) {
    const start = starts[index] as number;
    const end = starts[index + 1] as number;

    if (calendarDay(start) <= day && day < calendarDay(end)) {
      return {
        year: lunarYearOf(starts, leapIndex, index),
        month: number,
        leap: index === leapIndex,
        day: day - calendarDay(start) + 1,
        monthStartJD: start,
      };
    }
    if (index + 1 !== leapIndex) number = (number % 12) + 1;
  }

  // Unreachable: the loop spans month eleven to the next month eleven, and
  // the date was placed inside that span above.
  throw new Error(`lunar date not resolved for Julian Day ${julianDayUT}`);
}

/**
 * The year a lunar month belongs to.
 *
 * The lunar year turns at month one, not at month eleven where the numbering
 * is anchored: months eleven and twelve of the span still belong to the year
 * that is ending.
 */
function lunarYearOf(starts: readonly number[], leapIndex: number, index: number): number {
  // Position of month one within the span: two months after month eleven,
  // plus one if the intercalary month falls in between — a leap eleventh
  // month at index 1, or a leap twelfth at index 2, both push month one back.
  let firstMonthIndex = 2;
  if (leapIndex >= 0 && leapIndex <= 2) firstMonthIndex += 1;

  const reference = fromJulianDay(starts[firstMonthIndex] as number, CALENDAR_ZONE);
  return index >= firstMonthIndex ? reference.year : reference.year - 1;
}
