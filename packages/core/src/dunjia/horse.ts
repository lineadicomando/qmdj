import { BRANCHES, type Branch } from '../ganzhi.js';
import { palaceOfBranch } from './palaces.js';

/**
 * The post horse (驛馬), and which palace it stands in.
 *
 * **Derived, not tabulated.** The transmitted couplets — 申子辰馬在寅,
 * 寅午戌馬在申, 巳酉丑馬在亥, 亥卯未馬在巳 — are one rule said four times: a
 * branch belongs to one of the four triads, each triad is the frame of a
 * phase, and the horse is the branch facing that phase's 長生. Water is born
 * at 申, so the horse of 申子辰 stands at 寅, which faces it. Deriving it
 * makes the four couplets a test rather than data beside the code.
 *
 * The frame's 長生 is the *first* branch of the triad as it is always
 * recited, which is why nothing here needs the twelve stages: 申子辰 opens at
 * 申, 寅午戌 at 寅, and so on for the other two.
 *
 * **Reckoned from the day and from the hour, both, and not from one of them
 * by a choice made here.** 日馬 and 時馬 are two things the tradition names
 * separately, not two readings of one thing, and which of them bears on a
 * question is the reader's business — the same boundary `purposes.ts` holds.
 * A chart carries both and says which is which.
 */
export interface Horse {
  /** Which pillar's branch it was reckoned from. */
  from: 'day' | 'hour';
  /** The branch the horse stands on. */
  branch: Branch;
  /** The palace that branch falls in. */
  palace: number;
}

/**
 * The four triads, by the branch each opens at.
 *
 * Every branch is three steps from the next of its own triad, so the opening
 * branch of a triad is the one whose index the branch is congruent to modulo
 * four — 申 is 8, 子 is 0, 辰 is 4, and all three leave 0 on division by 4.
 */
const OPENS: Record<number, number> = {
  0: 8, //  申子辰 — water, born at 申
  1: 5, //  巳酉丑 — metal, born at 巳
  2: 2, //  寅午戌 — fire, born at 寅
  3: 11, // 亥卯未 — wood, born at 亥
};

/** The branch the horse of a given branch stands on. */
export function horseBranch(branch: Branch): Branch {
  const opens = OPENS[branch.index % 4] as number;
  // Facing it: six steps round a ring of twelve.
  return BRANCHES[(opens + 6) % 12] as Branch;
}

/** The horse of a branch, and where on the board it falls. */
export function horseOf(from: 'day' | 'hour', branch: Branch): Horse {
  const horse = horseBranch(branch);
  return { from, branch: horse, palace: palaceOfBranch(horse) };
}
