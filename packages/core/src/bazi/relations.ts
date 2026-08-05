import type { Stem } from '../ganzhi.js';
import type { Element } from '../types.js';

/**
 * The generating cycle (相生): wood feeds fire, fire makes earth, earth bears
 * metal, metal carries water, water grows wood.
 */
export const GENERATES: Record<Element, Element> = {
  mu: 'huo',
  huo: 'tu',
  tu: 'jin',
  jin: 'shui',
  shui: 'mu',
};

/**
 * The controlling cycle (相剋): wood breaks earth, earth dams water, water
 * quenches fire, fire melts metal, metal cuts wood.
 */
export const CONTROLS: Record<Element, Element> = {
  mu: 'tu',
  tu: 'shui',
  shui: 'huo',
  huo: 'jin',
  jin: 'mu',
};

/** The reverse of each cycle, which the ten gods need as often as the forward one. */
export const GENERATED_BY: Record<Element, Element> = invert(GENERATES);
export const CONTROLLED_BY: Record<Element, Element> = invert(CONTROLS);

function invert(cycle: Record<Element, Element>): Record<Element, Element> {
  const result = {} as Record<Element, Element>;
  for (const [from, to] of Object.entries(cycle) as [Element, Element][]) result[to] = from;
  return result;
}

export type TenGodId =
  | 'bijian' | 'jiecai'
  | 'shishen' | 'shangguan'
  | 'piancai' | 'zhengcai'
  | 'qisha' | 'zhengguan'
  | 'pianyin' | 'zhengyin';

export interface TenGod {
  id: TenGodId;
  hanzi: string;
}

const TEN_GODS: Record<TenGodId, string> = {
  bijian: '比肩',
  jiecai: '劫財',
  shishen: '食神',
  shangguan: '傷官',
  piancai: '偏財',
  zhengcai: '正財',
  qisha: '七殺',
  zhengguan: '正官',
  pianyin: '偏印',
  zhengyin: '正印',
};

/**
 * How a stem stands to the day master (十神).
 *
 * Two questions decide it, and only two: which of the five relations the
 * elements are in, and whether the polarities agree. Same element and same
 * polarity is a peer; same element and opposite polarity is a rival. What the
 * relation *means* is not the engine's business — only that it holds.
 */
export function tenGod(dayMaster: Stem, other: Stem): TenGod {
  const same = dayMaster.yang === other.yang;
  const id = relationId(dayMaster.element, other.element, same);
  return { id, hanzi: TEN_GODS[id] };
}

function relationId(master: Element, other: Element, samePolarity: boolean): TenGodId {
  if (other === master) return samePolarity ? 'bijian' : 'jiecai';
  if (other === GENERATES[master]) return samePolarity ? 'shishen' : 'shangguan';
  if (other === CONTROLS[master]) return samePolarity ? 'piancai' : 'zhengcai';
  if (other === CONTROLLED_BY[master]) return samePolarity ? 'qisha' : 'zhengguan';
  return samePolarity ? 'pianyin' : 'zhengyin';
}
