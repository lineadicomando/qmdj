import { beforeAll, describe, expect, it } from 'vitest';
import { computeBazi, type Bazi, type BaziOptions } from '../src/bazi/index.js';
import { MAX_ANNUAL_YEARS, annualPillars } from '../src/bazi/luck.js';
import { nayin } from '../src/bazi/nayin.js';
import { tenGod } from '../src/bazi/relations.js';
import { twelveStage } from '../src/bazi/hidden-stems.js';
import { ChartError } from '../src/errors.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { BRANCHES, STEMS, ganzhiOf } from '../src/ganzhi.js';
import { resolveMoment } from '../src/pillars.js';
import { fromJulianDay } from '../src/time.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };

/**
 * Clock time and the civil day boundary: the settings the reference charts
 * below were verified under. They are not the engine's defaults.
 */
const CLOCK: ChartOptions = {
  ...DEFAULT_OPTIONS,
  trueSolarTime: false,
  dayBoundary: 'midnight',
};

function chart(date: string, time: string, options: BaziOptions = {}): Bazi {
  return computeBazi(
    resolveMoment({ date, time, timezone: 'Asia/Shanghai' }, BEIJING, CLOCK, context),
    options,
    context,
  );
}

function column(bazi: Bazi, read: (pillar: Bazi['pillars'][number]) => string): string {
  return bazi.pillars.map(read).join(' ');
}

describe('a verified chart', () => {
  // 1968-03-12 14:30 in Beijing. Every value here was checked against an
  // independent implementation; none was recalled.
  let bazi: Bazi;

  beforeAll(() => {
    bazi = chart('1968-03-12', '14:30', { gender: 'male' });
  });

  it('has the four pillars', () => {
    expect(column(bazi, (p) => p.ganzhi.hanzi)).toBe('戊申 乙卯 辛巳 乙未');
  });

  it('takes the day stem as the day master', () => {
    expect(bazi.dayMaster.hanzi).toBe('辛');
  });

  /**
   * 戊申 乙卯 辛巳 乙未 by hand: stems 土金木木, branches 金木火土. The zero is
   * the point — water is nowhere in these eight, and the count has to say so
   * rather than drop the row.
   */
  it('counts the five elements over the eight characters, zeroes included', () => {
    expect(bazi.distribution).toStrictEqual({ mu: 3, huo: 1, tu: 2, jin: 2, shui: 0 });
    expect(Object.values(bazi.distribution).reduce((a, b) => a + b, 0)).toBe(8);
  });

  it('names the image of each pair', () => {
    expect(column(bazi, (p) => p.nayin.hanzi)).toBe('大驛土 大溪水 白蠟金 沙中金');
  });

  it('measures each stem against the day master', () => {
    // The day pillar has no god of its own: it is what the others are
    // measured from.
    expect(bazi.pillars.map((p) => p.stemGod?.hanzi ?? null)).toEqual([
      '正印',
      '偏財',
      null,
      '偏財',
    ]);
  });

  it('opens each branch to the stems it conceals', () => {
    expect(bazi.pillars.map((p) => p.hidden.map((h) => h.stem.stem.hanzi).join(''))).toEqual([
      '庚壬戊',
      '乙',
      '丙庚戊',
      '己丁乙',
    ]);
  });

  it('ranks the concealed stems by weight', () => {
    expect(bazi.pillars[0]?.hidden.map((h) => h.stem.rank)).toEqual(['ben', 'zhong', 'yu']);
    expect(bazi.pillars[1]?.hidden.map((h) => h.stem.rank)).toEqual(['ben']);
  });

  it('places the day master among the twelve stages', () => {
    expect(column(bazi, (p) => p.stage.hanzi)).toBe('帝旺 絕 死 衰');
  });

  it('names the branches the day decade leaves out', () => {
    expect(bazi.emptyBranches.map((b) => b.hanzi)).toEqual(['申', '酉']);
    // The year branch is one of them, so the year pillar sits on empty ground.
    expect(bazi.pillars.map((p) => p.empty)).toEqual([true, false, false, false]);
  });
});

describe('the ten gods', () => {
  it('reads the relation and the polarity, and nothing else', () => {
    const jia = STEMS[0]!; // 甲, yang wood

    expect(tenGod(jia, STEMS[0]!).hanzi).toBe('比肩'); // 甲 — same, same polarity
    expect(tenGod(jia, STEMS[1]!).hanzi).toBe('劫財'); // 乙 — same, opposite
    expect(tenGod(jia, STEMS[2]!).hanzi).toBe('食神'); // 丙 — I generate, same
    expect(tenGod(jia, STEMS[3]!).hanzi).toBe('傷官'); // 丁 — I generate, opposite
    expect(tenGod(jia, STEMS[4]!).hanzi).toBe('偏財'); // 戊 — I control, same
    expect(tenGod(jia, STEMS[5]!).hanzi).toBe('正財'); // 己 — I control, opposite
    expect(tenGod(jia, STEMS[6]!).hanzi).toBe('七殺'); // 庚 — controls me, same
    expect(tenGod(jia, STEMS[7]!).hanzi).toBe('正官'); // 辛 — controls me, opposite
    expect(tenGod(jia, STEMS[8]!).hanzi).toBe('偏印'); // 壬 — generates me, same
    expect(tenGod(jia, STEMS[9]!).hanzi).toBe('正印'); // 癸 — generates me, opposite
  });

  it('covers all ten from any day master', () => {
    for (const master of STEMS) {
      const gods = new Set(STEMS.map((other) => tenGod(master, other).id));
      expect(gods.size).toBe(10);
    }
  });
});

describe('nayin', () => {
  it('gives one image to each pair of pairs', () => {
    expect(nayin(ganzhiOf(0)).hanzi).toBe('海中金');
    expect(nayin(ganzhiOf(1)).hanzi).toBe('海中金');
    expect(nayin(ganzhiOf(2)).hanzi).toBe('爐中火');
    expect(nayin(ganzhiOf(59)).hanzi).toBe('大海水');
  });

  it('covers the sixty with thirty images', () => {
    const images = new Set(Array.from({ length: 60 }, (_, i) => nayin(ganzhiOf(i)).id));
    expect(images.size).toBe(30);
  });
});

describe('the twelve stages', () => {
  it('runs forwards for a yang stem and backwards for a yin one', () => {
    // 甲 is born at 亥 and runs on; 乙 is born at 午 and runs back.
    expect(twelveStage(STEMS[0]!, BRANCHES[11]!).id).toBe('changsheng');
    expect(twelveStage(STEMS[0]!, BRANCHES[0]!).id).toBe('muyu');
    expect(twelveStage(STEMS[1]!, BRANCHES[6]!).id).toBe('changsheng');
    expect(twelveStage(STEMS[1]!, BRANCHES[5]!).id).toBe('muyu');
  });

  it('visits all twelve for every stem', () => {
    for (const stem of STEMS) {
      const stages = new Set(BRANCHES.map((branch) => twelveStage(stem, branch).id));
      expect(stages.size).toBe(12);
    }
  });
});

describe('the luck cycles', () => {
  it('runs forwards for a man born in a yang year', () => {
    // 1968 is 戊申, a yang year.
    const bazi = chart('1968-03-12', '14:30', { gender: 'male' });

    expect(bazi.luck?.forward).toBe(true);
    expect(bazi.luck?.start).toEqual({ years: 7, months: 10, days: 0 });
    expect(bazi.luck?.cycles.slice(0, 4).map((c) => c.ganzhi.hanzi)).toEqual([
      '丙辰',
      '丁巳',
      '戊午',
      '己未',
    ]);
  });

  it('runs backwards when the polarities disagree', () => {
    // 1999 is 己卯, a yin year, and the subject is male: the run reverses.
    const bazi = chart('2000-01-01', '06:00', { gender: 'male' });

    expect(bazi.luck?.forward).toBe(false);
    expect(bazi.luck?.start).toEqual({ years: 8, months: 1, days: 10 });
    expect(bazi.luck?.cycles.slice(0, 4).map((c) => c.ganzhi.hanzi)).toEqual([
      '乙亥',
      '甲戌',
      '癸酉',
      '壬申',
    ]);
  });

  it('starts the run from the month pillar', () => {
    const bazi = chart('1984-02-02', '12:00', { gender: 'female' });

    expect(bazi.pillars[1]?.ganzhi.hanzi).toBe('乙丑');
    expect(bazi.luck?.forward).toBe(true);
    expect(bazi.luck?.cycles[0]?.ganzhi.hanzi).toBe('丙寅');
    expect(bazi.luck?.start).toEqual({ years: 0, months: 9, days: 20 });
  });

  it('opens each decade on the date the one before it opened', () => {
    // Counted in calendar years, not in multiples of the mean year: over ten
    // cycles the second reckoning slides a day or two off the date, and
    // `startAge` would then name an instant that is not the one it means.
    const bazi = chart('1968-03-12', '14:30', { gender: 'male', cycles: 10 });
    const cycles = bazi.luck?.cycles as NonNullable<Bazi['luck']>['cycles'];
    const dayOf = (julianDay: number): string =>
      fromJulianDay(julianDay, BEIJING.timezone).toFormat('MM-dd HH:mm');

    expect(cycles).toHaveLength(10);
    for (const cycle of cycles) expect(dayOf(cycle.startJD)).toBe(dayOf(cycles[0]?.startJD ?? 0));
    // And the years themselves still step by ten.
    expect(fromJulianDay(cycles[9]?.startJD ?? 0, BEIJING.timezone).year).toBe(
      fromJulianDay(cycles[0]?.startJD ?? 0, BEIJING.timezone).year + 90,
    );
  });

  it('measures the start more finely when asked', () => {
    // The classical reading counts whole double hours, so its days come out
    // in tens; the minute reading carries the division further. They differ
    // by up to ten days, and neither is a mistake.
    const classical = chart('1968-03-12', '14:30', { gender: 'male' });
    const fine = chart('1968-03-12', '14:30', { gender: 'male', luckGranularity: 'minute' });

    expect(classical.luck?.start.days).toBe(0);
    expect(fine.luck?.start.days).not.toBe(classical.luck?.start.days);
    expect(fine.luck?.start.years).toBe(classical.luck?.start.years);
  });

  it('is left out entirely without a gender', () => {
    // The direction cannot be settled without it, and guessing would produce
    // a plausible run that is wrong half the time.
    expect(chart('1968-03-12', '14:30').luck).toBeUndefined();
  });

  it('projects as many cycles as asked', () => {
    expect(chart('1968-03-12', '14:30', { gender: 'male', cycles: 3 }).luck?.cycles).toHaveLength(3);
  });
});

describe('annualPillars', () => {
  it('walks the sexagenary years', () => {
    expect(annualPillars(1984, 3).map((y) => `${y.year} ${y.ganzhi.hanzi}`)).toEqual([
      '1984 甲子',
      '1985 乙丑',
      '1986 丙寅',
    ]);
  });

  it('refuses a run longer than it will answer for', () => {
    // Ten cycles is already past any life these are read over. The bound is
    // the point: an unbounded count is a loop a caller can hang the engine
    // with, and it refuses by code like everything else.
    expect(annualPillars(1984, MAX_ANNUAL_YEARS)).toHaveLength(MAX_ANNUAL_YEARS);

    try {
      annualPillars(1984, MAX_ANNUAL_YEARS + 1);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ChartError);
      expect((error as ChartError).code).toBe('TOO_MANY_YEARS');
    }
  });
});

describe('the engine does not interpret', () => {
  it('reports relations, never judgements', () => {
    const bazi = chart('1968-03-12', '14:30', { gender: 'male' });
    const serialised = JSON.stringify(bazi);

    // Nothing in the output should read as advice. The gods, the stages and
    // the images are names of configurations; what they mean belongs to
    // whoever reads them.
    for (const word of ['lucky', 'unlucky', 'favourable', 'auspicious', 'good', 'bad']) {
      expect(serialised.toLowerCase()).not.toContain(word);
    }
  });
});
