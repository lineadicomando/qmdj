import { beforeAll, describe, expect, it } from 'vitest';
import { computeQimenChart } from '../src/dunjia/index.js';
import { horseBranch, horseOf } from '../src/dunjia/horse.js';
import { branchesOf, palaceOfBranch } from '../src/dunjia/palaces.js';
import { initEphemeris, type EphemerisContext } from '../src/ephemeris.js';
import { BRANCHES, type Branch } from '../src/ganzhi.js';
import { resolveMoment } from '../src/pillars.js';
import { DEFAULT_OPTIONS, type ChartOptions, type Place } from '../src/types.js';

let context: EphemerisContext;

beforeAll(() => {
  context = initEphemeris();
});

const BEIJING: Place = { latitude: 39.9075, longitude: 116.3972, timezone: 'Asia/Shanghai' };
const CLOCK: ChartOptions = { ...DEFAULT_OPTIONS, trueSolarTime: false, dayBoundary: 'midnight' };

const branch = (hanzi: string): Branch => BRANCHES.find((one) => one.hanzi === hanzi) as Branch;

describe('驛馬 — the post horse', () => {
  /**
   * The four transmitted couplets, which the rule has to reproduce exactly.
   * They are the data this is checked against, and the code holds none of it:
   * `horse.ts` derives the horse from the triad, so this list is a test of a
   * rule rather than a second copy of a table.
   */
  const COUPLETS: [string[], string][] = [
    [['申', '子', '辰'], '寅'],
    [['寅', '午', '戌'], '申'],
    [['巳', '酉', '丑'], '亥'],
    [['亥', '卯', '未'], '巳'],
  ];

  for (const [triad, horse] of COUPLETS) {
    it(`${triad.join('')}馬在${horse}`, () => {
      for (const member of triad) {
        expect(horseBranch(branch(member)).hanzi).toBe(horse);
      }
    });
  }

  it('answers for every one of the twelve branches', () => {
    // No branch falls outside a triad, so none can come back without a horse.
    for (const one of BRANCHES) expect(horseBranch(one)).toBeDefined();
  });

  it('faces the branch its triad opens at', () => {
    // The rule stated the other way round: the horse is six steps from the
    // 長生 of the triad's phase, which is the first branch of the triad as it
    // is recited. If this and the couplets above ever disagree, one of the two
    // is a typo and the test says which.
    for (const [triad, horse] of COUPLETS) {
      const opens = branch(triad[0] as string);
      expect(branch(horse).index).toBe((opens.index + 6) % 12);
    }
  });

  it('stands in a palace that holds it', () => {
    for (const one of BRANCHES) {
      const found = horseBranch(one);
      expect(branchesOf(palaceOfBranch(found)).map((each) => each.hanzi)).toContain(found.hanzi);
    }
  });

  it('never stands in the centre, which holds no branch', () => {
    // The centre has no direction and a branch is a direction before it is
    // anything else, so a horse landing there would mean the table is wrong.
    for (const one of BRANCHES) expect(palaceOfBranch(horseBranch(one))).not.toBe(5);
  });

  it('is reckoned from the day and from the hour, and says which is which', () => {
    const moment = resolveMoment(
      { date: '2026-09-01', time: '04:10', timezone: 'Asia/Shanghai' },
      BEIJING,
      CLOCK,
      context,
    );
    const chart = computeQimenChart(moment, CLOCK);

    expect(chart.horses).toHaveLength(2);
    expect(chart.horses.map((each) => each.from)).toEqual(['day', 'hour']);
    // Each is the horse of its own pillar and of no other. Naming only one of
    // the two would be a school chosen in the engine.
    expect(chart.horses[0]).toEqual(horseOf('day', moment.pillars.day.branch));
    expect(chart.horses[1]).toEqual(horseOf('hour', moment.pillars.hour.branch));
  });
});
