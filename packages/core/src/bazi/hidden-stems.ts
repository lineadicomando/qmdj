import { STEMS, type Branch, type Stem } from '../ganzhi.js';

/**
 * The rank a hidden stem holds inside its branch.
 *
 * `ben` is the branch's own nature and carries the weight; `zhong` and `yu`
 * are the qi of the season leaving and arriving. Four branches hold one stem
 * only, the four that sit squarely in a season.
 */
export type HiddenRank = 'ben' | 'zhong' | 'yu';

export interface HiddenStem {
  stem: Stem;
  rank: HiddenRank;
}

/**
 * The stems each branch conceals (藏干), in descending weight.
 *
 * This table is where schools begin to differ, and the differences are small
 * but real — the order of the two lesser stems of 巳 is not agreed, and some
 * traditions give 午 a third stem. The listing here is the common 人元司令
 * one. Anything reading it should treat the ranks as ordered, not the raw
 * array positions.
 */
const HIDDEN: Record<number, [number, number?, number?]> = {
  0: [9], //  子 — 癸
  1: [5, 9, 7], //  丑 — 己 癸 辛
  2: [0, 2, 4], //  寅 — 甲 丙 戊
  3: [1], //  卯 — 乙
  4: [4, 1, 9], //  辰 — 戊 乙 癸
  5: [2, 6, 4], //  巳 — 丙 庚 戊
  6: [3, 5], //  午 — 丁 己
  7: [5, 3, 1], //  未 — 己 丁 乙
  8: [6, 8, 4], //  申 — 庚 壬 戊
  9: [7], //  酉 — 辛
  10: [4, 7, 3], // 戌 — 戊 辛 丁
  11: [8, 0], // 亥 — 壬 甲
};

const RANKS: HiddenRank[] = ['ben', 'zhong', 'yu'];

/** The stems concealed in a branch, strongest first. */
export function hiddenStems(branch: Branch): HiddenStem[] {
  const indices = HIDDEN[branch.index] as number[];
  return indices.map((stemIndex, position) => ({
    stem: STEMS[stemIndex] as Stem,
    rank: RANKS[position] as HiddenRank,
  }));
}

export type TwelveStageId =
  | 'changsheng' | 'muyu' | 'guandai' | 'linguan' | 'diwang' | 'shuai'
  | 'bing' | 'si' | 'mu' | 'jue' | 'tai' | 'yang';

export interface TwelveStage {
  id: TwelveStageId;
  hanzi: string;
  /** Position in the cycle, 0 at 長生. */
  index: number;
}

const STAGES: [TwelveStageId, string][] = [
  ['changsheng', '長生'],
  ['muyu', '沐浴'],
  ['guandai', '冠帶'],
  ['linguan', '臨官'],
  ['diwang', '帝旺'],
  ['shuai', '衰'],
  ['bing', '病'],
  ['si', '死'],
  ['mu', '墓'],
  ['jue', '絕'],
  ['tai', '胎'],
  ['yang', '養'],
];

/** The branch at which each stem is born, indexed by stem. */
const BIRTH_BRANCH = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];

/**
 * Where a stem stands in the twelve stages, seen from a branch (十二長生).
 *
 * The cycle runs forwards for a yang stem and backwards for a yin one — the
 * two halves of a phase are held to rise and fall in opposite directions.
 *
 * Note that the stage `mu` (墓) and the element `mu` (木) are the same three
 * letters once the tones are dropped. They never meet in one field.
 */
export function twelveStage(stem: Stem, branch: Branch): TwelveStage {
  const birth = BIRTH_BRANCH[stem.index] as number;
  const steps = stem.yang ? branch.index - birth : birth - branch.index;
  const index = ((steps % 12) + 12) % 12;
  const [id, hanzi] = STAGES[index] as [TwelveStageId, string];
  return { id, hanzi, index };
}
