import { BRANCHES, type Branch } from '../ganzhi.js';
import type { Element } from '../types.js';

/**
 * A palace of the nine (九宮).
 *
 * The Luoshu number is the identity, not the position in any array. It is
 * what the tradition counts with — a chart is "yang dun, ju nine" — and it is
 * what the flying orders step through.
 */
export interface Palace {
  /** Luoshu number, 1 to 9. The centre is 5. */
  number: number;
  /** Toneless pinyin of the trigram. */
  id: PalaceId;
  /** The trigram, e.g. `坎`. */
  hanzi: string;
  element: Element;
  /** Compass direction, `null` for the centre, which has none. */
  direction: Direction | null;
}

export type PalaceId = 'kan' | 'kun' | 'zhen' | 'xun' | 'zhong' | 'qian' | 'dui' | 'gen' | 'li';

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/** The eight, going round from the north. The centre is not one of them. */
export const DIRECTIONS: readonly Direction[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export const PALACES: readonly Palace[] = [
  { number: 1, id: 'kan', hanzi: '坎', element: 'shui', direction: 'n' },
  { number: 2, id: 'kun', hanzi: '坤', element: 'tu', direction: 'sw' },
  { number: 3, id: 'zhen', hanzi: '震', element: 'mu', direction: 'e' },
  { number: 4, id: 'xun', hanzi: '巽', element: 'mu', direction: 'se' },
  { number: 5, id: 'zhong', hanzi: '中', element: 'tu', direction: null },
  { number: 6, id: 'qian', hanzi: '乾', element: 'jin', direction: 'nw' },
  { number: 7, id: 'dui', hanzi: '兌', element: 'jin', direction: 'w' },
  { number: 8, id: 'gen', hanzi: '艮', element: 'tu', direction: 'ne' },
  { number: 9, id: 'li', hanzi: '離', element: 'huo', direction: 's' },
];

export function palace(number: number): Palace {
  const found = PALACES.find((candidate) => candidate.number === number);
  if (!found) throw new Error(`no palace numbered ${number}`);
  return found;
}

/**
 * The palace a branch belongs to.
 *
 * Twelve branches over eight outer palaces: the four that hold two are the
 * corners, which is why 艮 takes both 丑 and 寅. The centre holds none — it
 * has no direction, and a branch is a direction before it is anything else.
 *
 * A fact about the board and not about any one reading of it, which is why it
 * lives here: the void palaces of a decade, the post horse and the frame of
 * branches drawn around the grid all ask the same question of it.
 */
const BRANCH_PALACE: Record<number, number> = {
  0: 1, //  子 — 坎
  1: 8, //  丑 — 艮
  2: 8, //  寅 — 艮
  3: 3, //  卯 — 震
  4: 4, //  辰 — 巽
  5: 4, //  巳 — 巽
  6: 9, //  午 — 離
  7: 2, //  未 — 坤
  8: 2, //  申 — 坤
  9: 7, //  酉 — 兌
  10: 6, // 戌 — 乾
  11: 6, // 亥 — 乾
};

export function palaceOfBranch(branch: Branch): number {
  return BRANCH_PALACE[branch.index] as number;
}

/** The branches a palace holds — two at a corner, one on an axis, none in the centre. */
export function branchesOf(number: number): Branch[] {
  return BRANCHES.filter((branch) => BRANCH_PALACE[branch.index] === number);
}

/**
 * The palace the centre lodges in (寄宮).
 *
 * The centre has no direction, no gate and no spirit, so whatever the chart
 * puts there has to be read somewhere else. This project follows the common
 * choice of the palace of Kun.
 */
export const CENTRE_HOST = 2;

/** Sends the centre to its host, and leaves every other palace alone. */
export function lodge(number: number): number {
  return number === 5 ? CENTRE_HOST : number;
}

/**
 * The ring of eight, clockwise (順), starting from Xun.
 *
 * The centre is not on it. The heaven plate and the nine stars turn along
 * this ring, which is the geometry of the board rather than the arithmetic of
 * the Luoshu — neighbours here are neighbours on the page.
 */
export const RING_CLOCKWISE: readonly number[] = [4, 9, 2, 7, 6, 1, 8, 3];

/** The same ring the other way, which the spirits of a yin chart follow. */
export const RING_COUNTERCLOCKWISE: readonly number[] = [4, 3, 8, 1, 6, 7, 2, 9];

/**
 * The order the gates fly in (飛), which is not the ring.
 *
 * Flying counts through the Luoshu numbers themselves — one, two, three — and
 * so passes through the centre, where the ring never goes. Ascending in a
 * yang chart, descending in a yin one.
 */
export const FLIGHT_ASCENDING: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const FLIGHT_DESCENDING: readonly number[] = [1, 9, 8, 7, 6, 5, 4, 3, 2];

/** The order starting at `from` and continuing round the cycle. */
export function orbitFrom(order: readonly number[], from: number): number[] {
  const start = order.indexOf(from);
  if (start === -1) throw new Error(`palace ${from} is not on this order`);
  return [...order.slice(start), ...order.slice(0, start)];
}

/** Steps `count` places along an order, wrapping. */
export function step(order: readonly number[], from: number, count: number): number {
  const start = order.indexOf(from);
  if (start === -1) throw new Error(`palace ${from} is not on this order`);
  return order[(start + count) % order.length] as number;
}

/**
 * A value in each palace, keyed by Luoshu number.
 *
 * A plain object rather than an array, because the palaces are numbered from
 * one and an array would invite reading them from zero.
 */
export type ByPalace<T> = Record<number, T>;

export function emptyByPalace<T>(): ByPalace<T> {
  return {} as ByPalace<T>;
}
