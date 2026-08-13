import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart, type QimenChart } from '../src/dunjia/index.js';
import { ChartError } from '../src/errors.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { ganzhiOf, monthGanzhi, type Ganzhi } from '../src/ganzhi.js';
import { nianmingOf, xingnianGanzhi, yearsLived } from '../src/nianming.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };

const moment = (date: string, time: string) =>
  resolveMoment({ date, time, timezone: 'Asia/Shanghai' }, BEIJING, CLOCK, context);

const cast = (date: string, time: string): QimenChart =>
  computeQimenChart(moment(date, time), CLOCK);

const pair = (hanzi: string): Ganzhi => {
  for (let index = 0; index < 60; index += 1) {
    const candidate = ganzhiOf(index);
    if (candidate.hanzi === hanzi) return candidate;
  }
  throw new Error(`${hanzi} is not one of the sixty`);
};

describe('行年 — the year being lived', () => {
  /**
   * The transmitted rule, and the pairs it is transmitted with: a man opens at
   * 丙寅 at one and counts forward, a woman at 壬申 and counts back. The
   * eleventh year is the one the sources state alongside the first, and it is
   * the one that catches a count started from zero.
   */
  const TRANSMITTED: [number, 'male' | 'female', string][] = [
    [1, 'male', '丙寅'],
    [2, 'male', '丁卯'],
    [11, 'male', '丙子'],
    [1, 'female', '壬申'],
    [2, 'female', '辛未'],
    [11, 'female', '壬戌'],
  ];

  for (const [years, gender, hanzi] of TRANSMITTED) {
    it(`${gender === 'male' ? '男' : '女'}${years}歲行年${hanzi}`, () => {
      expect(xingnianGanzhi(years, gender).hanzi).toBe(hanzi);
    });
  }

  /**
   * 皆起五虎 is not a second rule beside 男順寅 女逆申: it is where those two
   * pairs come from. The month of 寅 in a 甲 year is 丙寅 and its month of 申
   * is 壬申, so the openings are derived here rather than copied.
   */
  it('opens where 五虎遁 puts the months of 寅 and 申', () => {
    expect(xingnianGanzhi(1, 'male').hanzi).toBe(monthGanzhi(0, 2).hanzi);
    expect(xingnianGanzhi(1, 'female').hanzi).toBe(monthGanzhi(0, 8).hanzi);
  });

  it('returns to its opening after sixty years, either way', () => {
    expect(xingnianGanzhi(61, 'male').hanzi).toBe('丙寅');
    expect(xingnianGanzhi(61, 'female').hanzi).toBe('壬申');
  });

  it('refuses a count that never opened', () => {
    expect(() => xingnianGanzhi(0, 'male')).toThrow(ChartError);
    expect(() => xingnianGanzhi(-3, 'female')).toThrow(ChartError);
  });
});

describe('the years counted', () => {
  /**
   * 虛歲 counts the year of the birth as the first, so it is one more than the
   * turns of the year pillar. Neither reading knows a birthday: both step at
   * the boundary the chart's own options set.
   */
  it('counts the turns of the year pillar, and 虛歲 one more', () => {
    const birth = moment('1990-06-01', '12:00');
    const chart = moment('2026-08-13', '12:00');

    expect(yearsLived(birth, chart, { count: 'turns' })).toBe(36);
    expect(yearsLived(birth, chart)).toBe(37);
  });

  /**
   * The turn is 立春 and not the first of January: a birth in the January of
   * 1990 still belongs to the year pillar of 1989, and a chart cast in the
   * January of 2026 to that of 2025. Read from the civil years the count
   * would be 36; read from the pillars both ends move and it stays 36 — the
   * case that catches it is one end moving and not the other.
   */
  it('turns the year at 立春, at both ends', () => {
    const early = moment('1990-01-20', '12:00');
    const late = moment('1990-06-01', '12:00');
    const chart = moment('2026-08-13', '12:00');

    expect(early.pillars.year.hanzi).toBe('己巳');
    expect(late.pillars.year.hanzi).toBe('庚午');
    expect(yearsLived(early, chart, { count: 'turns' })).toBe(37);
    expect(yearsLived(late, chart, { count: 'turns' })).toBe(36);
  });

  it('refuses a birth the chart has not reached', () => {
    const birth = moment('2026-08-13', '12:00');
    const chart = moment('1990-06-01', '12:00');
    expect(() => yearsLived(birth, chart)).toThrow(ChartError);
  });
});

describe('本命 — the birth placed on a chart', () => {
  let chart: QimenChart;

  beforeAll(() => {
    chart = cast('2024-05-14', '10:00');
  });

  it('finds the stem on both plates, and reports what stands there', () => {
    const placed = nianmingOf(chart, { birthYear: pair('庚午') }).benming;

    expect(placed.stem.hanzi).toBe('庚');
    expect(placed.concealed).toBe(false);
    // The seats are where the stem is, which is what the chart itself says.
    const earth = chart.palaces.find((p) => p.palace.number === placed.earth.palace.number);
    const heaven = chart.palaces.find((p) => p.palace.number === placed.heaven.palace.number);
    expect(earth?.earth.hanzi).toBe('庚');
    expect(heaven?.heaven.hanzi).toBe('庚');
  });

  /**
   * 甲 is on no plate — that is what 遁甲 names — so a year headed by it is
   * looked up under the instrument of its decade. The six pairs and their six
   * instruments are the transmitted table: 甲子戊, 甲戌己, 甲申庚, 甲午辛,
   * 甲辰壬, 甲寅癸.
   */
  const CONCEALED: [string, string][] = [
    ['甲子', '戊'],
    ['甲戌', '己'],
    ['甲申', '庚'],
    ['甲午', '辛'],
    ['甲辰', '壬'],
    ['甲寅', '癸'],
  ];

  for (const [year, instrument] of CONCEALED) {
    it(`looks ${year} up under ${instrument}`, () => {
      const placed = nianmingOf(chart, { birthYear: pair(year) }).benming;
      expect(placed.concealed).toBe(true);
      expect(placed.stem.hanzi).toBe(instrument);
      expect(placed.ganzhi.hanzi).toBe(year);
    });
  }

  /**
   * The mooring is fixed by the branch alone, without reference to the plates,
   * and the image is weighed against the ground it moors on: 甲子 is 海中金,
   * metal, and 子 moors in 坎, water — metal generating water is 我生.
   */
  it('moors by the branch and weighs the 納音 against that ground', () => {
    const placed = nianmingOf(chart, { birthYear: pair('甲子') }).benming;

    expect(placed.mooring.hanzi).toBe('坎');
    expect(placed.nayin.hanzi).toBe('海中金');
    expect(placed.nayinRelation.id).toBe('wosheng');
  });

  it('reads a pair standing in the centre at the palace it lodges in', () => {
    const centre = chart.palaces.find((p) => p.palace.number === 5)!;
    const inCentre = ganzhiOf(
      [...Array(60).keys()].find((i) => ganzhiOf(i).stem.index === centre.earth.index) as number,
    );
    const placed = nianmingOf(chart, { birthYear: inCentre }).benming;

    expect(placed.earth.palace.number).toBe(5);
    expect(placed.earth.host?.hanzi).toBe('坤');
  });

  it('places the 行年 only when the years and the direction are both known', () => {
    const birthYear = pair('庚午');

    expect(nianmingOf(chart, { birthYear }).xingnian).toBeUndefined();
    expect(nianmingOf(chart, { birthYear, years: 35 }).xingnian).toBeUndefined();

    const both = nianmingOf(chart, { birthYear, years: 35, gender: 'male' });
    expect(both.years).toBe(35);
    expect(both.xingnian?.ganzhi.hanzi).toBe(xingnianGanzhi(35, 'male').hanzi);
  });

  it('leaves the chart alone', () => {
    const before = JSON.stringify(chart.palaces);
    nianmingOf(chart, { birthYear: pair('甲子'), years: 40, gender: 'female' });
    expect(JSON.stringify(chart.palaces)).toBe(before);
  });
});
