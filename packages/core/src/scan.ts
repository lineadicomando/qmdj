import { computeQimenChart, type QimenChart } from './dunjia/index.js';
import { ChartError } from './errors.js';
import type { EphemerisContext } from './ephemeris.js';
import { resolveMoment } from './pillars.js';
import { fromJulianDay, resolveTime, type LocalMoment } from './time.js';
import type { ChartOptions, Place } from './types.js';

/**
 * Every chart an interval contains.
 *
 * The engine casts charts for an instant. Choosing a time is the other
 * question — which instants, in a stretch of days, hold which chart — and it
 * is the older of the two: 擇時擇方 is what the art was for long before it was
 * used to answer questions.
 *
 * Nothing here selects, ranks or recommends. A scan reports the charts that
 * stand over an interval and where each one stands; which of them is worth
 * anything is a reading, and readings are not made in this package.
 */

/** A stretch of time over which one chart holds. */
export interface ScanRun {
  /** When it opens, as local clock time at the place. ISO 8601. */
  start: string;
  /** When the next one opens. Half-open, so runs neither gap nor overlap. */
  end: string;
  /** The chart, cast for the instant the run opens. */
  chart: QimenChart;
}

/**
 * The longest interval that may be scanned at once.
 *
 * A year of double hours is some four thousand charts. The limit is here
 * rather than at a surface because an unbounded loop in a pure function is a
 * trap laid for whoever calls it next; a surface is free to be stricter.
 */
export const MAX_SCAN_DAYS = 366;

/** How finely the interval is walked before a change is looked for, in hours. */
const PROBE_HOURS = 1;

/** How closely a boundary is then pinned down, in days. */
const TOLERANCE = 1 / 1440;

/**
 * Walks an interval and reports the charts standing over it.
 *
 * The bounds are half-open, `[from, to)`.
 *
 * **A run is not a double hour**, though it usually is one. Two things can
 * end a run, and only one of them is the hour pillar:
 *
 * - The hour turns over, which under true solar time happens at an instant
 *   the clock does not name — the correction runs to over an hour, and it
 *   drifts through the year with the equation of time.
 * - The yuan turns over. Under 拆補 the ju changes five days into the term,
 *   counted from the instant the term began, and that instant is not
 *   midnight: the third yuan of 處暑 2026 opens on 2 September at 10:18:48,
 *   in the middle of the double hour of 巳. A double hour can therefore open
 *   under one ju and close under the next, and the two halves are different
 *   charts.
 *
 * So the double hours are neither computed nor trusted. The interval is
 * probed at a fixed step, and wherever two probes disagree the boundary
 * between them is bisected to the minute. Probing alone would place that ju
 * change at 11:00 and claim for the preceding run forty-two minutes it does
 * not hold; bisecting costs some seven casts a boundary and says where it
 * really falls.
 */
export function scanCharts(
  from: LocalMoment,
  to: LocalMoment,
  place: Place,
  options: ChartOptions,
  context: EphemerisContext,
): ScanRun[] {
  const opens = resolveTime(from).time.julianDayUT;
  const closes = resolveTime(to).time.julianDayUT;

  if (closes <= opens) {
    throw new ChartError('EMPTY_INTERVAL', { from: from.date, to: to.date });
  }
  if (closes - opens > MAX_SCAN_DAYS) {
    throw new ChartError('INTERVAL_TOO_LONG', {
      days: Math.ceil(closes - opens),
      maximum: MAX_SCAN_DAYS,
    });
  }

  const zone = from.timezone;
  const cast = (julianDay: number): QimenChart =>
    computeQimenChart(resolveMoment(clockAt(julianDay, zone), place, options, context), options);
  const say = (julianDay: number): string =>
    fromJulianDay(julianDay, zone).toISO({ suppressMilliseconds: true }) as string;

  const step = PROBE_HOURS / 24;
  // Counted up front and indexed, never accumulated: a twenty-fourth of a day
  // is not a binary fraction, and adding it round a day leaves the last probe
  // a few nanoseconds short of the closing instant — which is inside the
  // interval by the comparison and outside it by the clock, and shows up as a
  // spurious run of no length.
  const probes = Math.ceil((closes - opens) / step);

  let previous = { julianDay: opens, chart: cast(opens) };
  const runs: ScanRun[] = [{ start: say(opens), end: say(closes), chart: previous.chart }];

  for (let i = 1; i <= probes; i++) {
    const julianDay = Math.min(opens + i * step, closes);
    const chart = cast(julianDay);

    if (!sameChart(chart, previous.chart)) {
      const boundary = firstChange(previous.julianDay, julianDay, previous.chart, cast);
      if (boundary < closes) {
        (runs.at(-1) as ScanRun).end = say(boundary);
        runs.push({ start: say(boundary), end: say(closes), chart: cast(boundary) });
      }
    }

    previous = { julianDay, chart };
  }

  return runs;
}

/**
 * The instant a chart stops holding, between a probe that has it and one that
 * does not.
 *
 * Bisection, to within a minute. Nothing here is continuous — a chart is one
 * thing and then another — but it is monotonic across a single change, which
 * is all a bisection needs. Two changes inside one probe would need the probe
 * to be shorter than the shortest run, and the shortest run is a double hour.
 */
function firstChange(
  holds: number,
  broken: number,
  chart: QimenChart,
  cast: (julianDay: number) => QimenChart,
): number {
  let lo = holds;
  let hi = broken;

  while (hi - lo > TOLERANCE) {
    const middle = (lo + hi) / 2;
    if (sameChart(cast(middle), chart)) lo = middle;
    else hi = middle;
  }

  return hi;
}

/**
 * An instant as the clock reads it where the scan is being made.
 *
 * The walk is over instants and the clock is derived from them, never the
 * other way about. An interval spanning a change of summer time has a clock
 * hour that comes round twice and one that never comes at all; walking the
 * clock would scan the first of those twice and be refused the second.
 */
function clockAt(julianDay: number, timezone: string): LocalMoment {
  const clock = fromJulianDay(julianDay, timezone);
  return {
    date: clock.toFormat('yyyy-MM-dd'),
    // To the second: a boundary bisected to the minute is not on a minute,
    // and a chart cast for 10:18 when the probe asked for 10:18:45 is the
    // chart of a different double hour twice a day.
    time: clock.toFormat('HH:mm:ss'),
    timezone,
  };
}

/**
 * Whether two instants stand under the same chart.
 *
 * The hour pillar and the ju settle it between them: everything else on the
 * plates is derived from those two, so two instants agreeing on both agree
 * everywhere. Comparing the whole chart would be comparing nine palaces to
 * learn what two numbers already say.
 */
function sameChart(a: QimenChart, b: QimenChart): boolean {
  return (
    a.moment.pillars.hour.index === b.moment.pillars.hour.index &&
    a.ju.number === b.ju.number &&
    a.ju.yang === b.ju.yang
  );
}
