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
 * their functional domains are transmitted alike from the classical
 * literature to the modern manuals, and are not a thing the schools dispute.
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
  // 開門 — opening, beginnings, office and officials, travel, trade.
  { id: 'opening', gate: 'kaimen' },
  // 休門 — rest, marriage and bonds, meeting somebody, asking a favour.
  { id: 'meeting', gate: 'xiumen' },
  // 生門 — money and profit, health and treatment, building.
  { id: 'wealth', gate: 'shengmen' },
  // 景門 — documents, examinations, plans, information, publicity.
  { id: 'documents', gate: 'jing3men' },
  // 杜門 — hiding, avoiding, secrecy, work of the hands.
  { id: 'concealment', gate: 'dumen' },
  // 傷門 — hunting, recovering a debt, competition, going at somebody.
  { id: 'pursuit', gate: 'shangmen' },
  // 死門 — funerals and burial, fishing and hunting, closing a thing.
  { id: 'ending', gate: 'simen' },
  // 驚門 — litigation, dispute, finding what has been lost.
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
