import type { Ganzhi } from '../ganzhi.js';
import type { Element } from '../types.js';

/** The five elements in generation order, for a surface that prints all five. */
export const ELEMENTS: readonly Element[] = ['mu', 'huo', 'tu', 'jin', 'shui'];

/** How often each element appears among the eight characters. */
export type ElementCount = Record<Element, number>;

/**
 * The five elements counted over the eight characters.
 *
 * The count is of what the pillars show: each stem by its element, each
 * branch by its own — the principal qi, which is the element the branch *is*
 * in `ganzhi.ts`. A zero is part of the answer, not a missing row: an absent
 * element weighs as much as a dominant one, and a count that dropped it would
 * hide the one thing it is computed to show.
 *
 * What is deliberately not applied: weights for the concealed stems, seasonal
 * strength, any step toward calling the day master strong or weak. Those are
 * where the methods diverge, and the count ships without them so that taking
 * such a step remains a reader's step. See the 五行 section of
 * `docs/sources.md`.
 */
export function elementCount(pillars: readonly Ganzhi[]): ElementCount {
  const count: ElementCount = { mu: 0, huo: 0, tu: 0, jin: 0, shui: 0 };
  for (const pillar of pillars) {
    count[pillar.stem.element] += 1;
    count[pillar.branch.element] += 1;
  }
  return count;
}
