import type { Branch } from '../ganzhi.js';
import { CONTROLS, GENERATES } from '../bazi/relations.js';
import type { Element } from '../types.js';

export type StrengthId = 'wang' | 'xiang' | 'xiu' | 'qiu' | 'si';

export interface Strength {
  id: StrengthId;
  hanzi: string;
}

const STRENGTH: Record<StrengthId, string> = {
  wang: '旺',
  xiang: '相',
  xiu: '休',
  qiu: '囚',
  si: '死',
};

/**
 * The element a season belongs to, from the branch of the month.
 *
 * The four seasons take the four cardinal phases, and the four months that
 * close them — the branches of the tombs — are given to earth. Other schools
 * give earth only the last eighteen days of each season instead, which moves
 * the boundary but not the idea.
 */
export function seasonElement(monthBranch: Branch): Element {
  switch (monthBranch.index) {
    case 2:
    case 3:
      return 'mu';
    case 5:
    case 6:
      return 'huo';
    case 8:
    case 9:
      return 'jin';
    case 11:
    case 0:
      return 'shui';
    default:
      // 辰, 未, 戌, 丑 — the four that close a season.
      return 'tu';
  }
}

/**
 * How an element stands to the season (旺相休囚死).
 *
 * The classical five-phase reckoning, and the whole of it: what rules the
 * season prospers, what the season generates is supported, what generates the
 * season rests, what controls the season is imprisoned, and what the season
 * controls dies.
 *
 * Some Qi Men schools assign the nine stars a different set of states from
 * the one their element would take. This engine reports the five-phase
 * reckoning, which is stateable in a sentence and checkable against it.
 */
export function strengthOf(element: Element, season: Element): Strength {
  const id = idOf(element, season);
  return { id, hanzi: STRENGTH[id] };
}

function idOf(element: Element, season: Element): StrengthId {
  if (element === season) return 'wang';
  if (element === GENERATES[season]) return 'xiang';
  if (GENERATES[element] === season) return 'xiu';
  if (CONTROLS[element] === season) return 'qiu';
  return 'si';
}
