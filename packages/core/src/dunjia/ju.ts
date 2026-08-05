import { ChartError } from '../errors.js';
import type { Moment } from '../pillars.js';
import type { SolarTermId } from '../solar-terms.js';
import type { ChartOptions } from '../types.js';

export type Yuan = 'shang' | 'zhong' | 'xia';

export const YUAN_HANZI: Record<Yuan, string> = {
  shang: '上元',
  zhong: '中元',
  xia: '下元',
};

export interface Ju {
  /** `true` for 陽遁, the half of the year running from the winter solstice. */
  yang: boolean;
  /** 1 to 9. */
  number: number;
  /** Which fifth-part of the term the moment falls in. */
  yuan: Yuan;
  /** Days elapsed since the term began, which is what fixes the yuan. */
  daysIntoTerm: number;
}

/**
 * The ju each term takes in each of its three yuan (陰陽二遁三元定局).
 *
 * The classical mnemonic in table form. Yang runs from the winter solstice to
 * Mangzhong, yin from the summer solstice to Daxue — the two halves of the
 * year, turning at the two solstices and not at the equinoxes.
 *
 * Read down a row and the three numbers step by six, modulo nine; the table
 * could be generated from its first column. It is written out because that is
 * how it is transmitted, and a table that matches the verse can be checked
 * against the verse.
 */
const JU_TABLE: Record<SolarTermId, { yang: boolean; ju: [number, number, number] }> = {
  dongzhi: { yang: true, ju: [1, 7, 4] },
  xiaohan: { yang: true, ju: [2, 8, 5] },
  dahan: { yang: true, ju: [3, 9, 6] },
  lichun: { yang: true, ju: [8, 5, 2] },
  yushui: { yang: true, ju: [9, 6, 3] },
  jingzhe: { yang: true, ju: [1, 7, 4] },
  chunfen: { yang: true, ju: [3, 9, 6] },
  qingming: { yang: true, ju: [4, 1, 7] },
  guyu: { yang: true, ju: [5, 2, 8] },
  lixia: { yang: true, ju: [4, 1, 7] },
  xiaoman: { yang: true, ju: [5, 2, 8] },
  mangzhong: { yang: true, ju: [6, 3, 9] },
  xiazhi: { yang: false, ju: [9, 3, 6] },
  xiaoshu: { yang: false, ju: [8, 2, 5] },
  dashu: { yang: false, ju: [7, 1, 4] },
  liqiu: { yang: false, ju: [2, 5, 8] },
  chushu: { yang: false, ju: [1, 4, 7] },
  bailu: { yang: false, ju: [9, 3, 6] },
  qiufen: { yang: false, ju: [7, 1, 4] },
  hanlu: { yang: false, ju: [6, 9, 3] },
  shuangjiang: { yang: false, ju: [5, 8, 2] },
  lidong: { yang: false, ju: [6, 9, 3] },
  xiaoxue: { yang: false, ju: [5, 8, 2] },
  daxue: { yang: false, ju: [4, 7, 1] },
};

const YUAN_ORDER: Yuan[] = ['shang', 'zhong', 'xia'];

/**
 * Determines the dun and the ju number.
 *
 * This is the most divisive step in the whole art, and the parameter that
 * governs it is `method`.
 *
 * Under `chaibu` (拆補) the term is simply split into three equal parts of
 * five days each, counted from the exact instant the term began: the first
 * five days are the upper yuan, the next five the middle, the rest the lower.
 * The name means "split and patch", and the patching is precisely this — the
 * fifteen days of a term and the sixty-day cycle of the days do not divide
 * into one another, and rather than carry the drift, this method re-divides
 * the term each time.
 *
 * `zhirun` (置閏) carries the drift instead, by inserting a repeated term; and
 * `maoshan` (茅山) differs again. Neither is implemented, and neither is
 * silently substituted: asking for one is an error rather than a chart that
 * looks right and is not.
 */
export function determineJu(moment: Moment, options: ChartOptions): Ju {
  if (options.method !== 'chaibu') {
    throw new ChartError('METHOD_NOT_IMPLEMENTED', { method: options.method });
  }

  const daysIntoTerm = moment.julianDayUT - moment.solarTerm.julianDayUT;
  const index = Math.min(2, Math.max(0, Math.floor(daysIntoTerm / 5)));
  const entry = JU_TABLE[moment.solarTerm.term.id];

  return {
    yang: entry.yang,
    number: entry.ju[index] as number,
    yuan: YUAN_ORDER[index] as Yuan,
    daysIntoTerm,
  };
}
