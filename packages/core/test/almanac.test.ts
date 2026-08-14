import { beforeAll, describe, expect, it } from 'vitest';
import { almanacAt, dayGodOf, lodgeOn, officerOf, DAY_GOD_LIST, LODGES, OFFICERS } from '../src/almanac.js';
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
    const page = almanacAt(noonAt(2026, 8, 4), context());
    expect(page.day.hanzi).toBe('庚戌');
    expect(page.monthBranch.hanzi).toBe('未');
    expect(page.officer.hanzi).toBe('平');
    expect(page.doubled).toBe(false);
  });

  it('gives the same officer to the two days a 交節 doubles', () => {
    // 立秋 falls on 2026-08-07. 「每月交節則疊兩值日」.
    const before = almanacAt(noonAt(2026, 8, 6), context());
    const onTheJie = almanacAt(noonAt(2026, 8, 7), context());
    const after = almanacAt(noonAt(2026, 8, 8), context());

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
    expect(almanacAt(noonAt(2026, 8, 6), context()).doubled).toBe(false);
    expect(almanacAt(noonAt(2026, 8, 7), context()).doubled).toBe(true);
    expect(almanacAt(noonAt(2026, 8, 8), context()).doubled).toBe(false);
  });

  it('gives the whole of a 節 day to the new month, hour by hour', () => {
    // 白露 2026 strikes late on 9 September UT; every hour of that date, before
    // the crossing as well as after it, carries the month the 節 opens. This is
    // the difference between the page and the month pillar, and it is the one
    // thing about this layer that could have gone wrong silently.
    for (const hour of [0, 6, 12, 18, 23]) {
      const page = almanacAt(toJulianDay(2026, 9, 7, hour) - 8 / 24, context());
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
    expect(almanacAt(evening, context()).day.hanzi).toBe('己丑');
    expect(almanacAt(evening, context()).officer.hanzi).toBe('開');

    const morning = toJulianDay(2026, 3, 15, 4);
    expect(almanacAt(morning, context()).day.hanzi).toBe('戊子');
    expect(almanacAt(morning, context()).officer.hanzi).toBe('收');
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
    expect(when.almanac.officer.hanzi).toBe('定');
    const fenced = chartTranscript(when, chart, en, {});

    expect(fenced).toContain('庚戌');
    expect(fenced).not.toContain('定 dìng');
    expect(fenced).not.toContain(en('cli.field.jianchu'));
  });

  it('runs the twenty-eight lodges in their own order, unbroken', () => {
    // A count of days and nothing else: it crosses a 節 where 建除 doubles.
    const run = Array.from({ length: 30 }, (_, i) => lodgeOn(2461042 + i).hanzi).join('');
    expect(run).toBe('井鬼柳星張翼軫角亢氐房心尾箕斗牛女虛危室壁奎婁胃昴畢觜參井鬼');
    expect(LODGES).toHaveLength(28);
  });

  it('keeps every lodge on its own weekday, which is what fixes the epoch', () => {
    // Twenty-eight is four sevens, so a lodge holds one weekday for ever, and
    // the tradition wrote the check into the names: the 金 in 鬼金羊 is Friday.
    // An epoch out by anything that is not a multiple of seven breaks all 28.
    const WEEKDAY_OF_PLANET: Record<string, number> = {
      日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6,
    };
    for (let dayNumber = 2461042; dayNumber < 2461042 + 400; dayNumber += 1) {
      const lodge = lodgeOn(dayNumber);
      // Julian Day Number 0 was a Monday, so this is the weekday with 0 = Sunday.
      expect(WEEKDAY_OF_PLANET[lodge.planet.hanzi]).toBe((dayNumber + 1) % 7);
    }
  });

  it('holds the lodge across a 節, where the officer doubles', () => {
    const before = almanacAt(noonAt(2026, 8, 6), context());
    const onTheJie = almanacAt(noonAt(2026, 8, 7), context());

    expect(before.officer.hanzi).toBe(onTheJie.officer.hanzi);
    expect(before.lodge.hanzi).not.toBe(onTheJie.lodge.hanzi);
    expect(onTheJie.lodge.hanzi).toBe('婁');
  });

  it("reproduces the source's own worked months for the twelve gods", () => {
    // 《協紀辨方書》卷七 works three cases out in full. They are the test.
    // 寅月: 「寅天刑卯朱雀辰金匱巳天德午白虎未玉堂申天牢酉元武戌司命亥勾陳子青龍丑明堂」
    const run = (month: string): string =>
      BRANCHES.map((d) => dayGodOf(branch(month), d).hanzi).join('');

    // Written from 子 round to 亥, which is the order BRANCHES runs in.
    expect(run('寅')).toBe('青龍明堂天刑朱雀金匱天德白虎玉堂天牢玄武司命勾陳');
    // 卯月 and 酉月 stand still — the source calls it 伏吟: 「卯明堂辰天刑…」
    expect(run('卯')).toBe('司命勾陳青龍明堂天刑朱雀金匱天德白虎玉堂天牢玄武');
    // 午月 and 子月 turn half way — 反吟: 「午司命未勾陳申青龍…」
    expect(run('午')).toBe('金匱天德白虎玉堂天牢玄武司命勾陳青龍明堂天刑朱雀');
    expect(run('申')).toBe(run('寅'));
    expect(run('酉')).toBe(run('卯'));
  });

  it('carries the fortune of the god and none of its errands', () => {
    // Six 吉 and six 凶 — 《神樞經》 by way of 卷七. The valence travels as
    // `Pattern`'s does; the 宜忌 in the same passage does not.
    const lucky = DAY_GOD_LIST.filter((g) => g.valence.id === 'ji').map((g) => g.hanzi);
    expect(lucky).toEqual(['司命', '青龍', '明堂', '金匱', '天德', '玉堂']);
    expect(DAY_GOD_LIST.filter((g) => g.valence.id === 'xiong')).toHaveLength(6);
  });

  it('carries the 節 that opened the month it counted from', () => {
    const page = almanacAt(noonAt(2026, 8, 4), context());
    expect(page.jie.hanzi).toBe('小暑');
    expect(page.jie.kind).toBe('jie');
  });
});
