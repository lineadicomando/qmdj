import { describe, expect, it } from 'vitest';
import {
  BRANCHES,
  STEMS,
  dayGanzhi,
  decade,
  ganzhiFrom,
  ganzhiOf,
  hourBranch,
  hourGanzhi,
  monthGanzhi,
  yearGanzhi,
} from '../src/ganzhi.js';
import { toJulianDay } from '../src/time.js';

describe('the two cycles', () => {
  it('has ten stems and twelve branches', () => {
    expect(STEMS).toHaveLength(10);
    expect(BRANCHES).toHaveLength(12);
  });

  it('alternates yang and yin', () => {
    expect(STEMS.every((stem) => stem.yang === (stem.index % 2 === 0))).toBe(true);
    expect(BRANCHES.every((branch) => branch.yang === (branch.index % 2 === 0))).toBe(true);
  });

  it('pairs stems and branches into sixty, not a hundred', () => {
    const pairs = new Set(Array.from({ length: 60 }, (_, i) => ganzhiOf(i).hanzi));

    expect(pairs.size).toBe(60);
    expect(ganzhiOf(0).hanzi).toBe('甲子');
    expect(ganzhiOf(59).hanzi).toBe('癸亥');
  });

  it('wraps in both directions', () => {
    expect(ganzhiOf(60).hanzi).toBe('甲子');
    expect(ganzhiOf(-1).hanzi).toBe('癸亥');
  });

  it('refuses a pairing of mismatched polarity', () => {
    // A yang stem never meets a yin branch: the cycles advance together.
    expect(() => ganzhiFrom(0, 1)).toThrow(/never pair/);
    expect(ganzhiFrom(0, 0).hanzi).toBe('甲子');
  });
});

describe('the day cycle', () => {
  /**
   * The day pillars have run unbroken for longer than any calendar reform, so
   * they are counted rather than derived. These anchors are the check on the
   * count; they were verified against an independent implementation.
   */
  const ANCHORS: [string, string][] = [
    ['1900-01-01', '甲戌'],
    ['1949-10-01', '甲子'],
    ['1968-03-12', '辛巳'],
    ['1984-02-02', '丙寅'],
    ['2000-01-01', '戊午'],
    ['2024-01-01', '甲子'],
    ['2026-08-05', '辛亥'],
  ];

  it.each(ANCHORS)('%s is %s', (date, expected) => {
    const [year, month, day] = date.split('-').map(Number) as [number, number, number];

    expect(dayGanzhi(Math.round(toJulianDay(year, month, day, 12))).hanzi).toBe(expected);
  });

  it('advances by one a day', () => {
    const base = Math.round(toJulianDay(2000, 1, 1, 12));

    expect(dayGanzhi(base + 1).index).toBe((dayGanzhi(base).index + 1) % 60);
    expect(dayGanzhi(base + 60).hanzi).toBe(dayGanzhi(base).hanzi);
  });
});

describe('the year cycle', () => {
  it('opens a cycle in 1984', () => {
    expect(yearGanzhi(1984).hanzi).toBe('甲子');
    expect(yearGanzhi(2024).hanzi).toBe('甲辰');
    expect(yearGanzhi(2023).hanzi).toBe('癸卯');
    expect(yearGanzhi(1924).hanzi).toBe('甲子');
  });
});

describe('hourBranch', () => {
  it('opens the hour of the Rat at 23:00', () => {
    expect(hourBranch(23).hanzi).toBe('子');
    expect(hourBranch(0).hanzi).toBe('子');
    expect(hourBranch(1).hanzi).toBe('丑');
  });

  it('gives each branch two hours', () => {
    // The hour of the Horse runs 11:00 to 13:00, so 13:00 already opens the
    // hour of the Goat rather than closing the one before it.
    expect(hourBranch(11).hanzi).toBe('午');
    expect(hourBranch(12).hanzi).toBe('午');
    expect(hourBranch(13).hanzi).toBe('未');
  });

  it('covers the whole day exactly once', () => {
    const counts = new Map<string, number>();
    for (let hour = 0; hour < 24; hour += 1) {
      const key = hourBranch(hour).hanzi;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    expect(counts.size).toBe(12);
    expect([...counts.values()].every((count) => count === 2)).toBe(true);
  });
});

describe('monthGanzhi', () => {
  it('follows 五虎遁 from the year stem', () => {
    // The month of the Tiger takes 丙 in a 甲 or 己 year, then two steps on
    // for each following pair of year stems.
    expect(monthGanzhi(0, 2).hanzi).toBe('丙寅'); // 甲 year
    expect(monthGanzhi(5, 2).hanzi).toBe('丙寅'); // 己 year
    expect(monthGanzhi(1, 2).hanzi).toBe('戊寅'); // 乙 year
    expect(monthGanzhi(4, 2).hanzi).toBe('甲寅'); // 戊 year
  });

  it('keeps the branch it was given', () => {
    for (let branch = 0; branch < 12; branch += 1) {
      expect(monthGanzhi(0, branch).branch.index).toBe(branch);
    }
  });
});

describe('hourGanzhi', () => {
  it('follows 五鼠遁 from the day stem', () => {
    // The hour of the Rat takes 甲 on a 甲 or 己 day.
    expect(hourGanzhi(0, 0).hanzi).toBe('甲子');
    expect(hourGanzhi(5, 0).hanzi).toBe('甲子');
    expect(hourGanzhi(1, 0).hanzi).toBe('丙子');
    expect(hourGanzhi(4, 0).hanzi).toBe('壬子');
  });

  it('matches the pillars of verified charts', () => {
    // 戊 day, hour of the Rooster; and 丙 day, hour of the Horse.
    expect(hourGanzhi(4, 9).hanzi).toBe('辛酉');
    expect(hourGanzhi(2, 6).hanzi).toBe('甲午');
  });
});

describe('decade', () => {
  it('finds the head of the decade', () => {
    expect(decade(ganzhiOf(0)).head.hanzi).toBe('甲子');
    expect(decade(ganzhiOf(9)).head.hanzi).toBe('甲子');
    expect(decade(ganzhiOf(10)).head.hanzi).toBe('甲戌');
  });

  it('names the two branches the decade leaves out', () => {
    // Ten stems cannot cover twelve branches: two are always left over, and
    // those are the void ones both traditions read.
    expect(decade(ganzhiOf(0)).empty.map((b) => b.hanzi)).toEqual(['戌', '亥']);
    expect(decade(ganzhiOf(10)).empty.map((b) => b.hanzi)).toEqual(['申', '酉']);
  });

  it('leaves out branches the decade never uses', () => {
    for (let index = 0; index < 60; index += 1) {
      const { head, empty } = decade(ganzhiOf(index));
      const used = new Set(
        Array.from({ length: 10 }, (_, i) => ganzhiOf(head.index + i).branch.hanzi),
      );

      for (const branch of empty) expect(used.has(branch.hanzi)).toBe(false);
    }
  });
});
