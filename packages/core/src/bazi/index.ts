import type { EphemerisContext } from '../ephemeris.js';
import { decade, type Branch, type Ganzhi, type Stem } from '../ganzhi.js';
import type { Moment } from '../pillars.js';
import { hiddenStems, twelveStage, type HiddenStem, type TwelveStage } from './hidden-stems.js';
import { luckCycles, type Gender, type LuckCycles, type LuckGranularity } from './luck.js';
import { nayin, type Nayin } from './nayin.js';
import { tenGod, type TenGod } from './relations.js';

export type PillarPosition = 'year' | 'month' | 'day' | 'hour';

export interface BaziPillar {
  position: PillarPosition;
  ganzhi: Ganzhi;
  /**
   * How the pillar's stem stands to the day master.
   *
   * `null` on the day pillar alone: the day master is the point everything
   * else is measured from, and measuring it against itself says nothing.
   */
  stemGod: TenGod | null;
  /** The stems the branch conceals, strongest first, each with its own god. */
  hidden: { stem: HiddenStem; god: TenGod }[];
  nayin: Nayin;
  /** Where the day master stands in this branch, among the twelve stages. */
  stage: TwelveStage;
  /** Whether this branch is one of the two the day's decade leaves out (空亡). */
  empty: boolean;
}

export interface Bazi {
  /** The stem of the day pillar: the self, and the reference for every god. */
  dayMaster: Stem;
  pillars: BaziPillar[];
  /** The two branches missing from the day pillar's decade. */
  emptyBranches: [Branch, Branch];
  /** Absent unless a gender was given: the direction depends on it. */
  luck?: LuckCycles;
}

export interface BaziOptions {
  /**
   * Needed only for the luck cycles, whose direction the tradition takes from
   * it together with the polarity of the year stem. Omit it and the pillars
   * are still complete; only the cycles are left out.
   */
  gender?: Gender;
  /** How many decade cycles to project. Default 8, which reaches past eighty. */
  cycles?: number;
  /**
   * How finely the distance to the solar term is measured when placing the
   * start of the run. Default `shichen`, the classical reading.
   */
  luckGranularity?: LuckGranularity;
}

/**
 * The Four Pillars of an instant, with everything read off them.
 *
 * The pillars themselves come from `resolveMoment`; what this adds is the
 * reading: which stems each branch conceals, how each stands to the day
 * master, which image the pair carries, and where the day master finds itself
 * in the cycle of twelve.
 *
 * All of it is structural. That 正官 sits in the month says something to a
 * practitioner and nothing to the engine, which reports only that it is there.
 */
export function computeBazi(
  moment: Moment,
  options: BaziOptions,
  context: EphemerisContext,
): Bazi {
  const dayMaster = moment.pillars.day.stem;
  const { empty } = decade(moment.pillars.day);
  const emptySet = new Set(empty.map((branch) => branch.index));

  const order: [PillarPosition, Ganzhi][] = [
    ['year', moment.pillars.year],
    ['month', moment.pillars.month],
    ['day', moment.pillars.day],
    ['hour', moment.pillars.hour],
  ];

  const pillars = order.map(([position, ganzhi]): BaziPillar => ({
    position,
    ganzhi,
    stemGod: position === 'day' ? null : tenGod(dayMaster, ganzhi.stem),
    hidden: hiddenStems(ganzhi.branch).map((stem) => ({
      stem,
      god: tenGod(dayMaster, stem.stem),
    })),
    nayin: nayin(ganzhi),
    stage: twelveStage(dayMaster, ganzhi.branch),
    empty: emptySet.has(ganzhi.branch.index),
  }));

  const bazi: Bazi = { dayMaster, pillars, emptyBranches: empty };
  if (options.gender) {
    bazi.luck = luckCycles(
      moment,
      options.gender,
      options.cycles ?? 8,
      options.luckGranularity ?? 'shichen',
      context,
    );
  }
  return bazi;
}

export { hiddenStems, twelveStage, type HiddenRank, type HiddenStem, type TwelveStage, type TwelveStageId } from './hidden-stems.js';
export {
  annualPillars,
  luckCycles,
  type Gender,
  type LuckCycle,
  type LuckCycles,
  type LuckGranularity,
} from './luck.js';
export { nayin, type Nayin } from './nayin.js';
export {
  CONTROLLED_BY,
  CONTROLS,
  GENERATED_BY,
  GENERATES,
  tenGod,
  type TenGod,
  type TenGodId,
} from './relations.js';
