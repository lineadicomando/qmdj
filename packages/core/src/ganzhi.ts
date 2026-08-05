import type { Element } from './types.js';

/**
 * A heavenly stem (天干). Ten of them, cycling through the five phases in
 * yang/yin pairs.
 */
export interface Stem {
  index: number;
  id: StemId;
  hanzi: string;
  element: Element;
  yang: boolean;
}

/** An earthly branch (地支). Twelve of them. */
export interface Branch {
  index: number;
  id: BranchId;
  hanzi: string;
  element: Element;
  yang: boolean;
}

export type StemId = 'jia' | 'yi' | 'bing' | 'ding' | 'wu' | 'ji' | 'geng' | 'xin' | 'ren' | 'gui';

export type BranchId =
  | 'zi' | 'chou' | 'yin' | 'mao' | 'chen' | 'si'
  | 'wu' | 'wei' | 'shen' | 'you' | 'xu' | 'hai';

/**
 * The ten stems.
 *
 * Note that stem 戊 and branch 午 are both `wu` once the tones are dropped.
 * They never share a field — a pillar has one of each — and a combined
 * identifier reads stem first, so `wuwu` is 戊午 and nothing else.
 */
export const STEMS: readonly Stem[] = [
  { index: 0, id: 'jia', hanzi: '甲', element: 'mu', yang: true },
  { index: 1, id: 'yi', hanzi: '乙', element: 'mu', yang: false },
  { index: 2, id: 'bing', hanzi: '丙', element: 'huo', yang: true },
  { index: 3, id: 'ding', hanzi: '丁', element: 'huo', yang: false },
  { index: 4, id: 'wu', hanzi: '戊', element: 'tu', yang: true },
  { index: 5, id: 'ji', hanzi: '己', element: 'tu', yang: false },
  { index: 6, id: 'geng', hanzi: '庚', element: 'jin', yang: true },
  { index: 7, id: 'xin', hanzi: '辛', element: 'jin', yang: false },
  { index: 8, id: 'ren', hanzi: '壬', element: 'shui', yang: true },
  { index: 9, id: 'gui', hanzi: '癸', element: 'shui', yang: false },
];

export const BRANCHES: readonly Branch[] = [
  { index: 0, id: 'zi', hanzi: '子', element: 'shui', yang: true },
  { index: 1, id: 'chou', hanzi: '丑', element: 'tu', yang: false },
  { index: 2, id: 'yin', hanzi: '寅', element: 'mu', yang: true },
  { index: 3, id: 'mao', hanzi: '卯', element: 'mu', yang: false },
  { index: 4, id: 'chen', hanzi: '辰', element: 'tu', yang: true },
  { index: 5, id: 'si', hanzi: '巳', element: 'huo', yang: false },
  { index: 6, id: 'wu', hanzi: '午', element: 'huo', yang: true },
  { index: 7, id: 'wei', hanzi: '未', element: 'tu', yang: false },
  { index: 8, id: 'shen', hanzi: '申', element: 'jin', yang: true },
  { index: 9, id: 'you', hanzi: '酉', element: 'jin', yang: false },
  { index: 10, id: 'xu', hanzi: '戌', element: 'tu', yang: true },
  { index: 11, id: 'hai', hanzi: '亥', element: 'shui', yang: false },
];

/**
 * One of the sixty pairs.
 *
 * Only sixty of the hundred stem-branch combinations occur, because the two
 * cycles advance together: a yang stem never meets a yin branch.
 */
export interface Ganzhi {
  /** Position in the cycle, 0 = 甲子. */
  index: number;
  stem: Stem;
  branch: Branch;
  /** e.g. `甲子`. Travels in the output whatever the locale. */
  hanzi: string;
  /** e.g. `jiazi`. */
  id: string;
}

export function ganzhiOf(index: number): Ganzhi {
  const normalized = ((index % 60) + 60) % 60;
  const stem = STEMS[normalized % 10] as Stem;
  const branch = BRANCHES[normalized % 12] as Branch;
  return {
    index: normalized,
    stem,
    branch,
    hanzi: `${stem.hanzi}${branch.hanzi}`,
    id: `${stem.id}${branch.id}`,
  };
}

/** The pair made of a given stem and branch. Throws if they cannot meet. */
export function ganzhiFrom(stemIndex: number, branchIndex: number): Ganzhi {
  const stem = ((stemIndex % 10) + 10) % 10;
  const branch = ((branchIndex % 12) + 12) % 12;
  // Solve index ≡ stem (mod 10), index ≡ branch (mod 12) over 0..59.
  for (let index = stem; index < 60; index += 10) {
    if (index % 12 === branch) return ganzhiOf(index);
  }
  throw new Error(
    `stem ${STEMS[stem]?.hanzi} and branch ${BRANCHES[branch]?.hanzi} never pair: ` +
      'the two cycles advance together, so parities cannot differ',
  );
}

/**
 * The epoch that anchors the day cycle.
 *
 * The day pillars have run unbroken for far longer than any calendar reform,
 * so they are counted rather than derived: 1 January 2000 was 戊午, index 54,
 * and Julian Day Number 2451545. Every other day follows by arithmetic.
 *
 * Expressed as the offset that turns a Julian Day Number into a cycle
 * position, it is 49 — the value `(2451545 + 49) mod 60 = 54` produces.
 */
const DAY_CYCLE_OFFSET = 49;

/**
 * The day pillar of a civil date.
 *
 * `julianDayNumber` is the integer Julian Day Number of the *local* calendar
 * date — the day as the calendar on the wall shows it, not as UTC does.
 * Choosing that date, and in particular whether the hour of the Rat has
 * already begun it, is the caller's decision: see `dayBoundary`.
 */
export function dayGanzhi(julianDayNumber: number): Ganzhi {
  return ganzhiOf(Math.round(julianDayNumber) + DAY_CYCLE_OFFSET);
}

/**
 * The year pillar of a sexagenary year.
 *
 * 1984 was 甲子, the opening of a cycle, which is the anchor almanacs use.
 * The argument is the year the pillars are in, which is not always the
 * Gregorian year: before Lichun the pillars still belong to the year before.
 */
export function yearGanzhi(sexagenaryYear: number): Ganzhi {
  return ganzhiOf(sexagenaryYear - 1984);
}

/**
 * The month pillar, from the year's stem and the month's branch.
 *
 * The branch is fixed by the solar term — Lichun always opens the month of
 * the Tiger — while the stem comes from the year through 五虎遁: the first
 * month of a 甲 or 己 year takes stem 丙, of a 乙 or 庚 year 戊, and so on in
 * steps of two.
 */
export function monthGanzhi(yearStemIndex: number, monthBranchIndex: number): Ganzhi {
  const monthsFromYin = (((monthBranchIndex - 2) % 12) + 12) % 12;
  const firstMonthStem = ((yearStemIndex % 5) * 2 + 2) % 10;
  return ganzhiFrom(firstMonthStem + monthsFromYin, monthBranchIndex);
}

/**
 * The hour pillar, from the day's stem and the hour's branch.
 *
 * The same rule as the month, one cycle down: 五鼠遁 gives the hour of the
 * Rat stem 甲 on a 甲 or 己 day, 丙 on a 乙 or 庚 day, and so on.
 */
export function hourGanzhi(dayStemIndex: number, hourBranchIndex: number): Ganzhi {
  const firstHourStem = (dayStemIndex % 5) * 2;
  return ganzhiFrom(firstHourStem + hourBranchIndex, hourBranchIndex);
}

/**
 * The branch of a clock hour.
 *
 * Each branch spans two hours, and the hour of the Rat straddles midnight:
 * 23:00 to 01:00. Everything else follows from that shift.
 */
export function hourBranch(hour: number): Branch {
  return BRANCHES[Math.floor(((hour + 1) % 24) / 2)] as Branch;
}

/**
 * The decade (旬) a pair belongs to, and the two branches it leaves out.
 *
 * Sixty pairs divide into six decades of ten. Because twelve branches do not
 * fit into ten slots, each decade misses two — the 空亡, which Qi Men and the
 * Four Pillars both read.
 */
export function decade(ganzhi: Ganzhi): { head: Ganzhi; empty: [Branch, Branch] } {
  const head = ganzhiOf(ganzhi.index - (ganzhi.index % 10));
  const first = (head.branch.index + 10) % 12;
  return {
    head,
    empty: [BRANCHES[first] as Branch, BRANCHES[(first + 1) % 12] as Branch],
  };
}
