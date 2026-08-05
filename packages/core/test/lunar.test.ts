import { beforeAll, describe, expect, it } from 'vitest';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { lunarDate, newMoonAfter, newMoonBefore } from '../src/lunar.js';
import { fromJulianDay, toJulianDay } from '../src/time.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

/** Noon on the calendar's own meridian, which is where the day boundary is. */
function noonAt120E(date: string): number {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return toJulianDay(year, month, day, 4);
}

describe('new moons', () => {
  it('finds one within a lunation of any date', () => {
    const jd = noonAt120E('2024-06-15');
    const before = newMoonBefore(jd, context);
    const after = newMoonAfter(jd, context);

    expect(before).toBeLessThanOrEqual(jd);
    expect(after).toBeGreaterThan(jd);
    expect(after - before).toBeGreaterThan(29);
    expect(after - before).toBeLessThan(30.1);
  });

  it('matches published conjunctions to the minute', () => {
    // Beijing time. A new moon is the instant the Moon and the Sun share an
    // ecliptic longitude, not the first sighting of the crescent.
    const format = (jd: number) => fromJulianDay(jd, 'Asia/Shanghai').toFormat('yyyy-MM-dd HH:mm');

    // This one opened the lunar year 2024, whose date is published: the
    // conjunction and the calendar have to agree on the day.
    expect(format(newMoonBefore(noonAt120E('2024-02-15'), context))).toBe('2024-02-10 06:59');
  });

  it('steps consistently in both directions', () => {
    const jd = noonAt120E('1985-03-15');

    expect(newMoonAfter(newMoonBefore(jd, context), context)).toBeGreaterThan(jd);
  });
});

describe('lunarDate', () => {
  /**
   * The first day of the first month is the lunar new year, and its Gregorian
   * date is published decades ahead. It is the cheapest check there is on the
   * whole month-numbering machinery.
   */
  const NEW_YEARS: [string, number][] = [
    ['1900-01-31', 1900],
    ['1949-01-29', 1949],
    ['1985-02-20', 1985],
    ['2000-02-05', 2000],
    ['2020-01-25', 2020],
    ['2023-01-22', 2023],
    ['2024-02-10', 2024],
    ['2025-01-29', 2025],
  ];

  it.each(NEW_YEARS)('%s opens the lunar year %i', (date, year) => {
    const lunar = lunarDate(noonAt120E(date), context);

    expect(lunar.month).toBe(1);
    expect(lunar.day).toBe(1);
    expect(lunar.leap).toBe(false);
    expect(lunar.year).toBe(year);
  });

  it('does not open the year a day early', () => {
    const eve = lunarDate(noonAt120E('2024-02-09'), context);

    expect(eve.month).toBe(12);
    expect(eve.year).toBe(2023);
  });

  it('numbers a leap month after the month it repeats', () => {
    // 2023 had a leap second month, running from 22 March to 19 April; 1984
    // had a leap tenth. The intercalary month takes no number of its own.
    const leap2023 = lunarDate(noonAt120E('2023-04-01'), context);
    expect(leap2023.month).toBe(2);
    expect(leap2023.leap).toBe(true);

    const leap1984 = lunarDate(noonAt120E('1984-12-18'), context);
    expect(leap1984.month).toBe(10);
    expect(leap1984.leap).toBe(true);
  });

  it('separates a leap month from the ordinary month of the same number', () => {
    const ordinary = lunarDate(noonAt120E('2023-03-01'), context);

    expect(ordinary.month).toBe(2);
    expect(ordinary.leap).toBe(false);
  });

  it('is reckoned on 120°E, not on the observer', () => {
    // The lunar calendar is a published artefact: the same instant carries
    // the same lunar date whether it is read in Beijing or in Rome. It is
    // also unaffected by China's wartime clocks of 1942 to 1945.
    const instant = toJulianDay(1943, 12, 9, 4);
    const lunar = lunarDate(instant, context);

    expect(lunar.month).toBe(11);
    expect(lunar.day).toBe(13);
  });

  it('keeps days within a month contiguous', () => {
    let previous = lunarDate(noonAt120E('2023-03-20'), context);

    for (let offset = 1; offset <= 40; offset += 1) {
      const current = lunarDate(noonAt120E('2023-03-20') + offset, context);
      const continued = current.day === previous.day + 1;
      const rolled = current.day === 1 && (previous.day === 29 || previous.day === 30);

      expect(continued || rolled, `day ${previous.day} -> ${current.day}`).toBe(true);
      previous = current;
    }
  });
});
