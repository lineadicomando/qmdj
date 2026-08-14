import sweph from 'sweph';
import { assertEphemerisRange } from './ephemeris.js';
import { ChartError } from './errors.js';

export interface TrueSolarTime {
  /**
   * The instant, unchanged.
   *
   * Correcting to true solar time does not move the moment: it changes the
   * hour the moment is *called*, and so which branch it falls under. The
   * ephemerides are still queried at this Julian Day.
   */
  julianDayUT: number;
  /** True solar time of day at the place, in hours, 0 ≤ hour < 24. */
  hour: number;
  /** Whole days by which the true solar date differs from the UT date. */
  dayShift: number;
  /** Total correction against clock time, in minutes. */
  correctionMinutes: number;
  /** The part of it owed to the distance from the zone's defining meridian. */
  longitudeMinutes: number;
  /** The part owed to the Earth's orbit being neither circular nor upright. */
  equationOfTimeMinutes: number;
}

/**
 * Converts clock time to true solar time at a place.
 *
 * Two corrections, from different causes and often of opposite sign:
 *
 * - **Longitude.** A timezone is an hour wide but a place sits anywhere in
 *   it. Four minutes per degree from the meridian that defines the zone —
 *   nearly half an hour at the edge of a European zone, and far more in China,
 *   where a single zone spans some sixty degrees.
 * - **Equation of time.** The Sun runs ahead of the clock in autumn and
 *   behind it in winter, by up to sixteen minutes either way, because the
 *   orbit is elliptical and tilted.
 *
 * Together they reach well over an hour, and an hour is exactly the half-width
 * of an hour branch. Whether to apply the correction at all is a school's
 * choice — `trueSolarTime` in the options — not the engine's.
 */
export function trueSolarTime(
  julianDayUT: number,
  longitude: number,
  offsetMinutes: number,
): TrueSolarTime {
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new ChartError('INVALID_COORDINATES', { longitude });
  }
  // The equation of time is an ephemeris question like any other, and this is
  // the first one a moment asks: refused here, an impossible date is named as
  // a date rather than as whatever sweph says about its files.
  assertEphemerisRange(julianDayUT);

  // Local mean time at the place: the Sun's *mean* motion seen from this
  // meridian, which is what `lmt_to_lat` expects as its argument.
  const localMean = julianDayUT + longitude / 360;
  const apparent = sweph.lmt_to_lat(localMean, longitude);
  if (typeof apparent.data !== 'number' || !Number.isFinite(apparent.data)) {
    throw new ChartError('EPHEMERIS_FAILURE', {
      reason: apparent.error || 'lmt_to_lat returned no date',
      julianDay: julianDayUT,
    });
  }

  const equationOfTimeMinutes = (apparent.data - localMean) * 1440;
  // The meridian the zone is named for: its offset from UTC, at fifteen
  // degrees an hour. Places east of it see the Sun early.
  const longitudeMinutes = (longitude - offsetMinutes / 4) * 4;

  // The same instant, told by the clock and then by the Sun. The correction
  // can carry across midnight, which is why the day shift is reported: at
  // 23:50 clock time a correction of +20 minutes lands on the next day, and
  // with it on the next day pillar.
  const clock = julianDayUT + offsetMinutes / 1440;

  return {
    julianDayUT,
    hour: fractionOfDay(apparent.data) * 24,
    dayShift: dayDifference(apparent.data, clock),
    correctionMinutes: longitudeMinutes + equationOfTimeMinutes,
    longitudeMinutes,
    equationOfTimeMinutes,
  };
}

/** Fraction of a day elapsed since local midnight, given a Julian Day. */
function fractionOfDay(julianDay: number): number {
  const shifted = julianDay + 0.5;
  return shifted - Math.floor(shifted);
}

/** Whole days separating the local dates of two Julian Days. */
function dayDifference(a: number, b: number): number {
  return Math.floor(a + 0.5) - Math.floor(b + 0.5);
}
