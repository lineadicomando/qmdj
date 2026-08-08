import type { Branch } from '../ganzhi.js';
import { CONTROLS, GENERATES } from '../bazi/relations.js';
import type { Element } from '../types.js';

export type StrengthId = 'wang' | 'xiang' | 'xiu' | 'qiu' | 'si';

export interface Strength {
  id: StrengthId;
  hanzi: string;
  /** The state said aloud, e.g. `wàng`. */
  pinyin: string;
}

// 相 is xiàng in this list — the supported state, not the xiāng of "each
// other". The identifier drops the tone and cannot say which; this can.
const STRENGTH: Record<StrengthId, { hanzi: string; pinyin: string }> = {
  wang: { hanzi: '旺', pinyin: 'wàng' },
  xiang: { hanzi: '相', pinyin: 'xiàng' },
  xiu: { hanzi: '休', pinyin: 'xiū' },
  qiu: { hanzi: '囚', pinyin: 'qiú' },
  si: { hanzi: '死', pinyin: 'sǐ' },
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
  return { id, ...STRENGTH[id] };
}

function idOf(element: Element, season: Element): StrengthId {
  if (element === season) return 'wang';
  if (element === GENERATES[season]) return 'xiang';
  if (GENERATES[element] === season) return 'xiu';
  if (CONTROLS[element] === season) return 'qiu';
  return 'si';
}
