import type { GateId } from './dunjia/index.js';
import { ChartError } from './errors.js';
import type { ScanCriteria } from './scan.js';

/**
 * What somebody is choosing a time *for*, and the gate the tradition gives it.
 *
 * This is the one place in the engine that carries a claim about human
 * affairs rather than about the arrangement of the plates, and it is bounded
 * on every side:
 *
 * - **It expands, it does not filter.** `purposeCriteria` returns criteria a
 *   caller could have written by hand, and `matchRuns` never hears of a
 *   purpose. A surface shows what the expansion produced and lets it be
 *   edited; nothing here is applied where it cannot be seen.
 * - **The gate and nothing else.** No floor under the strength, no
 *   configuration excluded, no star. That a prospering gate shows better than
 *   a dying one is a reading, and readings are not made in this package.
 * - **Eight, because there are eight gates.** The table is a bijection: it is
 *   the gates read from the other side, not a list of undertakings somebody
 *   chose. Which is also why 死門 and 傷門 are here with their own uses — a
 *   table of transmitted associations, not a list of good things to do.
 *
 * **How sure this is**: the third of the three tiers this project
 * distinguishes. Chinese-language sources, no runnable reference, no
 * authority publishing the answer — the same standing as the configurations
 * in `patterns.ts`, and not the standing of the solar terms. What makes the
 * eight gates safe to ship where the rest of the 用神 doctrine is not is that
 * three independent witnesses carry the domains and carry them alike: the
 * Tang 《太乙金鏡式經》, an eight-line verse surviving in both the 道藏 and
 * 《奇門遁甲統宗》, and the 統宗's own prose 八門所主. Each entry below names
 * the passage it stands on, and **an entry says only what those passages say**
 * — the modern manuals carry more, and the surplus was cut rather than
 * shipped. See the 八門 section of `docs/sources.md`.
 *
 * Everything past the gates is left out and stays out: the stems as
 * significators of people, the nine stars, the eight spirits. There the
 * schools genuinely diverge, and what reached the West most widely reached it
 * as the teaching material of particular commercial lineages, which is not a
 * source this engine can stand a table on. 三奇得使 is the precedent for
 * saying so instead of guessing.
 *
 * There is deliberately **no `tradition` parameter yet**, though a second set
 * of associations would need one. The usual objection does not apply: a
 * purpose is not in a chart's address — a surface expands it into criteria
 * and the criteria are what travels — so a second tradition can arrive as a
 * second table and a parameter here without breaking a single shared link.
 */
export type PurposeId =
  | 'opening'
  | 'meeting'
  | 'wealth'
  | 'documents'
  | 'concealment'
  | 'pursuit'
  | 'ending'
  | 'dispute';

export interface Purpose {
  id: PurposeId;
  /** The gate the transmitted lists assign to it. */
  gate: GateId;
}

export const PURPOSES: readonly Purpose[] = [
  // 開門 — 主開向通達 (金鏡); 遠行 (verse); 入官見貴、應舉、商賈營建 (統宗).
  { id: 'opening', gate: 'kaimen' },
  // 休門 — 主休息安居 (金鏡); 遇君王 (verse); 面君謁貴、上官到任、嫁娶 (統宗).
  { id: 'meeting', gate: 'xiumen' },
  // 生門 — 主生育萬物 (金鏡); 欲求財利往生方 (verse). Money, and growth.
  // Not trade, not building — the 統宗 puts 商賈營建 under 開門 and 休門 —
  // and not medicine, which the tradition puts under a star: 求仙合藥見天心.
  { id: 'wealth', gate: 'shengmen' },
  // 景門 — 上書獻策、招賢、拜職遣使 (統宗); 思量酒食問景方 (verse). The two
  // strands name different errands rather than contradicting: the domain is
  // wider than either, and the label carries both. 應舉 is 開門's, not this.
  { id: 'documents', gate: 'jing3men' },
  // 杜門 — 主閉塞不通 (金鏡); 好逃藏 (verse); 捕盜剪凶、填塞溝壑 (統宗).
  { id: 'concealment', gate: 'dumen' },
  // 傷門 — 索債 (verse); 漁獵、討捕索債、博戲、收斂貨財 (統宗).
  { id: 'pursuit', gate: 'shangmen' },
  // 死門 — 主死喪葬埋 (金鏡); 葬獵 (verse); 吊喪埋葬、決斷 (統宗). Hunting
  // is left off: the verse puts it here and the 統宗 under 傷門, so it cannot
  // tell the two apart and an errand that names both is not a choice.
  { id: 'ending', gate: 'simen' },
  // 驚門 — 主驚恐奔走 (金鏡); 捉賊 (verse); 掩捕盜賊、恐惑亂眾 (統宗).
  // Litigation is **not** here: 刑獄 is 死門's and 獄形 is 杜門's, and only
  // the modern manuals moved it. The identifier outruns its sources.
  { id: 'dispute', gate: 'jing1men' },
];

/**
 * The criteria a purpose stands for.
 *
 * Deliberately a `ScanCriteria` and not a scan: what comes back is exactly
 * what a caller could have typed, so a surface can show it, and so nothing
 * reaches `matchRuns` that the person asking has not seen.
 */
export function purposeCriteria(id: PurposeId): ScanCriteria {
  const purpose = PURPOSES.find((candidate) => candidate.id === id);
  if (!purpose) {
    throw new ChartError('UNKNOWN_IDENTIFIER', { parameter: 'purpose', value: id });
  }
  return { gate: purpose.gate };
}

/** The purpose a gate answers to, for a surface naming a gate it found. */
export function purposeOfGate(gate: GateId): Purpose {
  return PURPOSES.find((candidate) => candidate.gate === gate) as Purpose;
}
