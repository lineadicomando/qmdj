import { CONTROLS, GENERATES } from '../bazi/relations.js';
import type { Element } from '../types.js';

/**
 * How a thing stands to the palace it is standing in (門宮 · 星宮).
 *
 * The five relations of the phases, named from the point of view of the thing
 * rather than of the palace: 我 is the gate or the star, 宮 is the ground it
 * has come to rest on. A gate of metal in a palace of wood is 我剋 — it
 * controls what it stands on.
 *
 * **These are the relations and not a school's labels for them.** 生我 / 我生
 * / 剋我 / 我剋 / 比和 is the plain five-phase vocabulary, uncontested and
 * descriptive; the names Qi Men attaches to some of these — 義, 和, 迫, 制 —
 * are transmitted, do not agree between sources on which relation takes which
 * word, and carry a fortune with them. One of the five already has such a name
 * here, and it comes back the way every named configuration does: 我剋 for a
 * gate is 門迫, and `patterns.ts` reports it with the fortune the sources give
 * it. The other four are reported as what they are and no more.
 *
 * A thing takes the element of the palace it belongs to at rest, which is why
 * nothing extra has to be stored to work this out — the same reckoning
 * `strengthOf` makes against the season, made against the ground instead.
 */
export type RelationId = 'bihe' | 'shengwo' | 'wosheng' | 'kewo' | 'woke';

export interface Relation {
  id: RelationId;
  hanzi: string;
}

const RELATION: Record<RelationId, string> = {
  bihe: '比和',
  shengwo: '生我',
  wosheng: '我生',
  kewo: '剋我',
  woke: '我剋',
};

/** The same list at runtime, for the surfaces that have to offer it. */
export const RELATION_IDS: readonly RelationId[] = Object.keys(RELATION) as RelationId[];

/**
 * How `mine` stands to `ground`.
 *
 * Exhaustive by construction: two elements are either the same or in one of
 * the four directed relations, and there is no fifth case to fall through to.
 */
export function relationOf(mine: Element, ground: Element): Relation {
  const id = idOf(mine, ground);
  return { id, hanzi: RELATION[id] };
}

function idOf(mine: Element, ground: Element): RelationId {
  if (mine === ground) return 'bihe';
  if (GENERATES[ground] === mine) return 'shengwo';
  if (GENERATES[mine] === ground) return 'wosheng';
  if (CONTROLS[ground] === mine) return 'kewo';
  return 'woke';
}
