import { beforeAll, describe, expect, it } from 'vitest';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const ROME: Place = { latitude: 41.8919, longitude: 12.5113, timezone: 'Europe/Rome' };

/** Clock time, not solar: the reference implementations compare on the clock. */
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false };

function pillars(date: string, time: string, place = BEIJING, options = CLOCK): string {
  const moment = resolveMoment(
    { date, time, timezone: place.timezone },
    place,
    options,
    context,
  );
  const { year, month, day, hour } = moment.pillars;
  return `${year.hanzi} ${month.hanzi} ${day.hanzi} ${hour.hanzi}`;
}

describe('the four pillars', () => {
  /** Verified against an independent implementation over two centuries. */
  it.each([
    ['1968-03-12', '14:30', '戊申 乙卯 辛巳 乙未'],
    ['1984-02-02', '12:00', '癸亥 乙丑 丙寅 甲午'],
    ['2000-01-01', '00:00', '己卯 丙子 戊午 壬子'],
    ['2024-06-15', '09:15', '甲辰 庚午 庚戌 辛巳'],
  ])('%s %s in Beijing', (date, time, expected) => {
    expect(pillars(date, time)).toBe(expected);
  });
});

describe('the year turns at Lichun', () => {
  it('holds the old year until the crossing', () => {
    // Lichun 2024 fell at 16:27 Beijing time on 4 February. An hour either
    // side of it, the year pillar and the month pillar both change.
    expect(pillars('2024-02-04', '16:00').startsWith('癸卯 乙丑')).toBe(true);
    expect(pillars('2024-02-04', '17:00').startsWith('甲辰 丙寅')).toBe(true);
  });

  it('keeps January in the previous year', () => {
    expect(pillars('2024-01-15', '12:00').startsWith('癸卯')).toBe(true);
  });

  it('can be moved to the lunar new year instead', () => {
    // Between Lichun and the lunar new year the two conventions disagree by a
    // whole year pillar. In 2024 Lichun came on 4 February and the new year
    // on 10 February, so the week between them is where they part.
    const lichun = pillars('2024-02-06', '12:00');
    const chunjie = pillars('2024-02-06', '12:00', BEIJING, {
      ...CLOCK,
      yearBoundary: 'chunjie',
    });

    expect(lichun.startsWith('甲辰')).toBe(true);
    expect(chunjie.startsWith('癸卯')).toBe(true);
  });
});

describe('the day boundary', () => {
  it('advances the day pillar at 23:00 by default', () => {
    const before = resolveMoment(
      { date: '2024-06-15', time: '22:30', timezone: 'Asia/Shanghai' },
      BEIJING,
      CLOCK,
      context,
    );
    const after = resolveMoment(
      { date: '2024-06-15', time: '23:30', timezone: 'Asia/Shanghai' },
      BEIJING,
      CLOCK,
      context,
    );

    expect(after.pillars.day.index).toBe((before.pillars.day.index + 1) % 60);
    expect(after.hourBranch.hanzi).toBe('子');
  });

  it('holds the day pillar to midnight when asked', () => {
    const options: ChartOptions = { ...CLOCK, dayBoundary: 'midnight' };
    const evening = resolveMoment(
      { date: '2024-06-15', time: '23:30', timezone: 'Asia/Shanghai' },
      BEIJING,
      options,
      context,
    );
    const noon = resolveMoment(
      { date: '2024-06-15', time: '12:00', timezone: 'Asia/Shanghai' },
      BEIJING,
      options,
      context,
    );

    // Same day pillar, still the hour of the Rat: this is the disagreement
    // the option exists for, and it moves a quarter of the chart.
    expect(evening.pillars.day.hanzi).toBe(noon.pillars.day.hanzi);
    expect(evening.hourBranch.hanzi).toBe('子');
  });
});

describe('true solar time', () => {
  it('can move the hour branch', () => {
    // Rome sits about 12.5°E while its zone is drawn on 15°E, so the Sun runs
    // some ten minutes late there — before the equation of time is counted.
    const clock = resolveMoment(
      { date: '2024-11-03', time: '12:55', timezone: 'Europe/Rome' },
      ROME,
      CLOCK,
      context,
    );
    const solar = resolveMoment(
      { date: '2024-11-03', time: '12:55', timezone: 'Europe/Rome' },
      ROME,
      { ...CLOCK, trueSolarTime: true },
      context,
    );

    expect(clock.hourBranch.hanzi).toBe('午');
    expect(solar.hourBranch.hanzi).toBe('未');
    expect(solar.solar.correctionMinutes).toBeGreaterThan(6);
  });

  it('reports the correction even when it is not applied', () => {
    const moment = resolveMoment(
      { date: '2024-06-15', time: '12:00', timezone: 'Asia/Shanghai' },
      BEIJING,
      CLOCK,
      context,
    );

    // Beijing is west of the 120°E meridian its zone is named for, so the Sun
    // is late there all year: roughly a quarter of an hour.
    expect(moment.solar.longitudeMinutes).toBeCloseTo(-14.4, 1);
    expect(Math.abs(moment.solar.equationOfTimeMinutes)).toBeLessThan(17);
  });
});

describe('what a moment carries', () => {
  it('keeps the options that produced it', () => {
    const moment = resolveMoment(
      { date: '2024-06-15', time: '12:00', timezone: 'Asia/Shanghai' },
      BEIJING,
      CLOCK,
      context,
    );

    // A saved chart must reproduce identically, which it cannot do if the
    // options that shaped it are left behind.
    expect(moment.options).toEqual(CLOCK);
  });

  it('carries warnings rather than failing', () => {
    // 02:30 on 26 March 2023 never existed in Rome.
    const moment = resolveMoment(
      { date: '2023-03-26', time: '02:30', timezone: 'Europe/Rome' },
      ROME,
      CLOCK,
      context,
    );

    expect(moment.warnings.map((w) => w.code)).toContain('NONEXISTENT_LOCAL_TIME');
    expect(moment.pillars.day.hanzi).toBeTruthy();
  });

  it('reports the term, the jie and the lunar date together', () => {
    const moment = resolveMoment(
      { date: '2024-03-01', time: '12:00', timezone: 'Asia/Shanghai' },
      BEIJING,
      CLOCK,
      context,
    );

    expect(moment.solarTerm.term.id).toBe('yushui');
    expect(moment.jie.term.id).toBe('lichun');
    expect(moment.lunar).toMatchObject({ year: 2024, month: 1, leap: false, day: 21 });
  });
});
