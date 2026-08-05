import { describe, expect, it } from 'vitest';
import { ChartError } from '../src/errors.js';
import { fromJulianDay, resolveTime, toJulianDay, zoneMeridian } from '../src/time.js';

describe('toJulianDay', () => {
  it('agrees with the standard epochs', () => {
    // J2000.0, and the Unix epoch, are the two values every other conversion
    // in the engine is anchored on.
    expect(toJulianDay(2000, 1, 1, 12)).toBe(2451545);
    expect(toJulianDay(1970, 1, 1, 0)).toBe(2440587.5);
  });

  it('handles January and February through the year before', () => {
    // Meeus shifts them into months 13 and 14; getting it wrong moves every
    // date in the first two months of a year by a day or more.
    expect(toJulianDay(1900, 1, 1, 12)).toBe(2415021);
    expect(toJulianDay(1600, 2, 29, 12)).toBe(2305507);
  });
});

describe('resolveTime', () => {
  it('converts local time to Universal Time', () => {
    const { time } = resolveTime({
      date: '2024-06-15',
      time: '12:00',
      timezone: 'Asia/Shanghai',
    });

    expect(time.utc).toBe('2024-06-15T04:00:00Z');
    expect(time.offsetMinutes).toBe(480);
  });

  it('applies the historical offset, not the current one', () => {
    // China ran its clocks an hour ahead through the war years. A chart cast
    // for 1943 at +08:00 would put every pillar an hour out.
    const { time } = resolveTime({
      date: '1943-06-15',
      time: '12:00',
      timezone: 'Asia/Shanghai',
    });

    expect(time.offsetMinutes).toBe(540);
    expect(time.utc).toBe('1943-06-15T03:00:00Z');
  });

  it('applies Chinese summer time of 1986 to 1991', () => {
    const summer = resolveTime({ date: '1988-07-15', time: '12:00', timezone: 'Asia/Shanghai' });
    const winter = resolveTime({ date: '1988-01-15', time: '12:00', timezone: 'Asia/Shanghai' });

    expect(summer.time.offsetMinutes).toBe(540);
    expect(winter.time.offsetMinutes).toBe(480);
  });

  it('warns when a local time occurs twice', () => {
    // Italy went back to standard time at 03:00 on 29 October 2023.
    const { warnings } = resolveTime({
      date: '2023-10-29',
      time: '02:30',
      timezone: 'Europe/Rome',
    });

    expect(warnings.map((w) => w.code)).toContain('AMBIGUOUS_LOCAL_TIME');
  });

  it('warns when a local time never existed', () => {
    // Italy jumped from 02:00 to 03:00 on 26 March 2023.
    const { warnings } = resolveTime({
      date: '2023-03-26',
      time: '02:30',
      timezone: 'Europe/Rome',
    });

    expect(warnings.map((w) => w.code)).toContain('NONEXISTENT_LOCAL_TIME');
  });

  it('stays silent on an ordinary time', () => {
    const { warnings } = resolveTime({
      date: '2023-06-15',
      time: '02:30',
      timezone: 'Europe/Rome',
    });

    expect(warnings).toEqual([]);
  });

  it('rejects malformed input with a code, not a sentence', () => {
    const cases: [Record<string, string>, string][] = [
      [{ date: '15/06/2024', time: '12:00', timezone: 'Europe/Rome' }, 'INVALID_DATE'],
      [{ date: '2024-06-15', time: 'noon', timezone: 'Europe/Rome' }, 'INVALID_TIME'],
      [{ date: '2024-06-15', time: '12:00', timezone: 'Mars/Olympus' }, 'UNKNOWN_TIMEZONE'],
    ];

    for (const [input, code] of cases) {
      try {
        resolveTime(input as never);
        expect.unreachable(`should have thrown ${code}`);
      } catch (error) {
        expect(error).toBeInstanceOf(ChartError);
        expect((error as ChartError).code).toBe(code);
      }
    }
  });
});

describe('fromJulianDay', () => {
  it('round-trips through a timezone', () => {
    const { time } = resolveTime({
      date: '1968-03-12',
      time: '14:30',
      timezone: 'Europe/Rome',
    });

    expect(fromJulianDay(time.julianDayUT, 'Europe/Rome').toFormat('yyyy-MM-dd HH:mm')).toBe(
      '1968-03-12 14:30',
    );
  });
});

describe('zoneMeridian', () => {
  it('reads the offset at the moment, not at the present one', () => {
    // Whichever season this test runs in, one of the two would be fifteen
    // degrees out if the offset were read from today's clock — and the
    // longitude correction meant to be zero would be a full hour.
    expect(zoneMeridian({ date: '2024-01-15', time: '12:00', timezone: 'Europe/Rome' })).toBe(15);
    expect(zoneMeridian({ date: '2024-07-15', time: '12:00', timezone: 'Europe/Rome' })).toBe(30);
  });

  it('follows the historical rules of the zone', () => {
    // China observed summer time from 1986 to 1991; the zone remembers.
    expect(zoneMeridian({ date: '1988-07-15', time: '12:00', timezone: 'Asia/Shanghai' })).toBe(135);
    expect(zoneMeridian({ date: '2024-07-15', time: '12:00', timezone: 'Asia/Shanghai' })).toBe(120);
  });
});
