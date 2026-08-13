import { ChartError } from '../errors.js';
import type { Moment } from '../pillars.js';
import { SOLAR_TERMS, type SolarTermId } from '../solar-terms.js';
import type { ChartOptions } from '../types.js';

export type Yuan = 'shang' | 'zhong' | 'xia';

export const YUAN_HANZI: Record<Yuan, string> = {
  shang: '上元',
  zhong: '中元',
  xia: '下元',
};

export const YUAN_PINYIN: Record<Yuan, string> = {
  shang: 'shàngyuán',
  zhong: 'zhōngyuán',
  xia: 'xiàyuán',
};

export interface Ju {
  /** `true` for 陽遁, the half of the year running from the winter solstice. */
  yang: boolean;
  /** 1 to 9. */
  number: number;
  /** The moment's third of its term or, under zhirun, of its block. */
  yuan: Yuan;
  /** Days elapsed since the term began. It fixes the yuan under `term`. */
  daysIntoTerm: number;
  /**
   * The term whose ju was taken. Under chaibu, always the term in force;
   * under zhirun's 超神 it can be a term that has not yet begun.
   */
  term: { id: SolarTermId; hanzi: string; pinyin: string };
  /** True inside an intercalated block (閏), which repeats 芒種 or 大雪. */
  leap: boolean;
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
 * Three five-day stretches, each headed by a 甲 or 己 day.
 *
 * Fifteen divides sixty, so the cycle of the days carries the three yuan
 * round exactly four times and a day's place in it is a fact about the day
 * pillar alone.
 */
const FUTOU_CYCLE = 15;

/**
 * Determines the dun and the ju number.
 *
 * This is the most divisive step in the whole art, and the parameter that
 * governs it is `method`.
 *
 * Under `chaibu` (拆補) the term is split into three parts of five days and
 * the ju is read off the term in force. The name means "split and patch", and
 * the patching is precisely this — the fifteen days of a term and the
 * sixty-day cycle of the days do not divide into one another, and rather than
 * carry the drift, this method re-divides the term each time.
 *
 * *Where the three parts are cut* is `yuan`, and the two schools that cut
 * them differently do not agree on most days. Under `term` the cut is made
 * from the exact instant the term began: first five days upper, next five
 * middle, the rest lower. Under `futou` it is made on the days themselves —
 * where the day pillar stands in the fifteen-day cycle headed by 甲 and 己 is
 * the yuan, and the term's own edge does not move it.
 *
 * Under `zhirun` (置閏) the drift is carried instead of re-divided: the yuan
 * follows the day's futou through the sexagenary cycle, whole fifteen-day
 * blocks serve one term each, and the accumulated drift is paid off by a
 * repeated 芒種 or 大雪 block. The bookkeeping lives in `zhirun.ts`; the
 * moment carries it, and this function only reads the table with it. The
 * two methods therefore disagree not only on the yuan of a given day but,
 * around a term's edges, on which term's ju the day takes at all.
 *
 * `maoshan` (茅山) differs again. It is not implemented, and it is not
 * silently substituted: asking for it is an error rather than a chart that
 * looks right and is not.
 */
export function determineJu(moment: Moment, options: ChartOptions): Ju {
  const daysIntoTerm = moment.julianDayUT - moment.solarTerm.julianDayUT;

  if (options.method === 'zhirun') {
    const assignment = moment.zhirun;
    const entry = JU_TABLE[assignment.term];
    const definition = SOLAR_TERMS.find((candidate) => candidate.id === assignment.term);
    return {
      yang: entry.yang,
      number: entry.ju[assignment.yuanIndex] as number,
      yuan: YUAN_ORDER[assignment.yuanIndex] as Yuan,
      daysIntoTerm,
      term: {
        id: assignment.term,
        hanzi: definition?.hanzi as string,
        pinyin: definition?.pinyin as string,
      },
      leap: assignment.leap,
    };
  }

  if (options.method !== 'chaibu') {
    throw new ChartError('METHOD_NOT_IMPLEMENTED', { method: options.method });
  }

  // Two readings, and the term is the same under both: only where the yuan
  // is read from differs. `futou` needs nothing but the day pillar's place in
  // the sexagenary cycle, which the moment already carries — the same number
  // `zhirun.ts` heads its blocks by, read the same way and for the same
  // reason, so the two cannot drift apart.
  const index =
    options.yuan === 'futou'
      ? Math.floor((moment.pillars.day.index % FUTOU_CYCLE) / 5)
      : Math.min(2, Math.max(0, Math.floor(daysIntoTerm / 5)));
  const entry = JU_TABLE[moment.solarTerm.term.id];

  return {
    yang: entry.yang,
    number: entry.ju[index] as number,
    yuan: YUAN_ORDER[index] as Yuan,
    daysIntoTerm,
    term: {
      id: moment.solarTerm.term.id,
      hanzi: moment.solarTerm.term.hanzi,
      pinyin: moment.solarTerm.term.pinyin,
    },
    leap: false,
  };
}
