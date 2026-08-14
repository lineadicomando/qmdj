import { beforeAll, describe, expect, it } from 'vitest';
import { jianchuAt, officerOf, OFFICERS } from '../src/almanac.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { BRANCHES, type Branch } from '../src/ganzhi.js';
import { toJulianDay } from '../src/time.js';
import { computeQimenChart } from '../src/dunjia/index.js';
import { chartTranscript } from '../src/prompt.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';
import { createTranslator } from '@qimendunjia/i18n';

/**
 * The values below were read off `lunar-javascript`, which every pillar in
 * this project was already verified against, and the boundaries were checked
 * against 《協紀辨方書》卷四 before they were written down. Nothing here is
 * recalled: see the 曆注 section of `docs/sources.md`.
 */

let ephemeris: EphemerisContext;
beforeAll(() => {
  ephemeris = initEphemeris();
});
const context = (): EphemerisContext => ephemeris;

/** Noon on 120°E, which is the meridian the page is reckoned on. */
const noonAt = (year: number, month: number, day: number): number =>
  toJulianDay(year, month, day, 12) - 8 / 24;

const branch = (hanzi: string): Branch => BRANCHES.find((b) => b.hanzi === hanzi) as Branch;

describe('建除十二神', () => {
  it('opens the count where the month branch and the day branch meet', () => {
    // 「如正月建寅則寅日起建」 — the month of 寅, on a 寅 day, is 建.
    expect(officerOf(branch('寅'), branch('寅')).hanzi).toBe('建');
    expect(officerOf(branch('寅'), branch('卯')).hanzi).toBe('除');
    expect(officerOf(branch('寅'), branch('丑')).hanzi).toBe('閉');
  });

  it('runs the twelve forward and closes the ring', () => {
    const run = BRANCHES.map((day) => officerOf(branch('子'), day).hanzi).join('');
    expect(run).toBe('建除滿平定執破危成收開閉');
    expect(OFFICERS).toHaveLength(12);
  });

  it('names the officer of an ordinary day', () => {
    const page = jianchuAt(noonAt(2026, 8, 4), context());
    expect(page.day.hanzi).toBe('庚戌');
    expect(page.monthBranch.hanzi).toBe('未');
    expect(page.officer.hanzi).toBe('平');
    expect(page.doubled).toBe(false);
  });

  it('gives the same officer to the two days a 交節 doubles', () => {
    // 立秋 falls on 2026-08-07. 「每月交節則疊兩值日」.
    const before = jianchuAt(noonAt(2026, 8, 6), context());
    const onTheJie = jianchuAt(noonAt(2026, 8, 7), context());
    const after = jianchuAt(noonAt(2026, 8, 8), context());

    expect([before.day.hanzi, onTheJie.day.hanzi, after.day.hanzi]).toEqual([
      '壬子',
      '癸丑',
      '甲寅',
    ]);
    expect(before.officer.hanzi).toBe('執');
    expect(onTheJie.officer.hanzi).toBe('執');
    expect(after.officer.hanzi).toBe('破');
  });

  it('marks the second of the doubled days and not the first', () => {
    expect(jianchuAt(noonAt(2026, 8, 6), context()).doubled).toBe(false);
    expect(jianchuAt(noonAt(2026, 8, 7), context()).doubled).toBe(true);
    expect(jianchuAt(noonAt(2026, 8, 8), context()).doubled).toBe(false);
  });

  it('gives the whole of a 節 day to the new month, hour by hour', () => {
    // 白露 2026 strikes late on 9 September UT; every hour of that date, before
    // the crossing as well as after it, carries the month the 節 opens. This is
    // the difference between the page and the month pillar, and it is the one
    // thing about this layer that could have gone wrong silently.
    for (const hour of [0, 6, 12, 18, 23]) {
      const page = jianchuAt(toJulianDay(2026, 9, 7, hour) - 8 / 24, context());
      expect(page.monthBranch.hanzi).toBe('酉');
      expect(page.officer.hanzi).toBe('閉');
      expect(page.doubled).toBe(true);
    }
  });

  it('turns its day on 120°E and not on the reader', () => {
    // 16:00 UT on 15 March is already one in the morning of the 16th at the
    // meridian the calendar is reckoned on, so the page is the 16th's — in
    // Rome, where it is still the evening of the 15th, exactly as in Beijing.
    // The layer takes no timezone at all, which is what makes that true.
    const evening = toJulianDay(2026, 3, 15, 16);
    expect(jianchuAt(evening, context()).day.hanzi).toBe('己丑');
    expect(jianchuAt(evening, context()).officer.hanzi).toBe('開');

    const morning = toJulianDay(2026, 3, 15, 4);
    expect(jianchuAt(morning, context()).day.hanzi).toBe('戊子');
    expect(jianchuAt(morning, context()).officer.hanzi).toBe('收');
  });

  it('stays out of what a model is handed', () => {
    // The officer is a function of the month branch and the day branch, and a
    // transcript prints both. Inside a fence that is one datum twice, and a
    // model reads the second as confirming the first. It belongs in the
    // sections that are addresses, where nothing is being asked.
    const options: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };
    const place: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
    const when = resolveMoment(
      { date: '2024-06-15', time: '14:00', timezone: 'Asia/Shanghai' },
      place,
      options,
      context(),
    );
    const en = createTranslator('en');
    const chart = computeQimenChart(when, options);

    // The officer of that day is 定, and the pillar it stands on is 庚戌.
    expect(when.jianchu.officer.hanzi).toBe('定');
    const fenced = chartTranscript(when, chart, en, {});

    expect(fenced).toContain('庚戌');
    expect(fenced).not.toContain('定 dìng');
    expect(fenced).not.toContain(en('cli.field.jianchu'));
  });

  it('carries the 節 that opened the month it counted from', () => {
    const page = jianchuAt(noonAt(2026, 8, 4), context());
    expect(page.jie.hanzi).toBe('小暑');
    expect(page.jie.kind).toBe('jie');
  });
});
