import { ChartError } from './errors.js';
import type { LiurenOptions } from './liuren.js';
import type { NianmingOptions } from './nianming.js';
import type { QizhengOptions } from './qizheng.js';
import type { TaiyiOptions } from './taiyi.js';
import type { ChartOptions } from './types.js';
import type { ZiweiOptions } from './ziwei/index.js';

/**
 * Every school divergence, declared once: its values, which of them this
 * engine computes, and what it assumes when a caller says nothing.
 *
 * `docs/parameters.md` states the rule this file serves — no school is
 * implicit, so every divergence is a parameter with a declared default,
 * present in the input type from the start, and a value the engine has not
 * implemented is **refused rather than substituted**. What the rule did not
 * say is where the answer to «which values are implemented» is kept, and the
 * answer was: in five places at once. Each board spelled it out at its own
 * `throw` — `implemented: 'zhongqi'` — the table in `docs/parameters.md` said
 * it again in prose, `apps/web/src/lib/vocabulary.ts` said it a third time as
 * the list a form may offer, the CLI's help a fourth as the words after a
 * flag, and the MCP tool schema a fifth as an enum an agent is handed. The
 * only one of the five the compiler could see was the literal inside the
 * throw, which is the copy nobody reads. `docs/parameters.md` had already
 * drifted by a whole board.
 *
 * **A value moving from refused to implemented is one fact and is now one
 * edit here.** The refusals read this table, so a `false` turned `true`
 * without the code behind it fails the board's own tests rather than
 * answering with the wrong chart. The four surfaces above keep lists of their
 * own, because what each *offers* is a choice — a form and a tool schema name
 * only what can be computed, since an option that can only come back as an
 * error is not a choice, while the page names every declared value because a
 * reader weighing a school needs to know the others exist. What they no
 * longer keep is the fact: each is asserted against this table by a test, so
 * a list that falls behind fails rather than misinforms.
 *
 * **It is a description and not a validator.** Nothing here checks that a
 * caller's string is one of the declared values: TypeScript does that for a
 * caller in this repository, and a surface taking a value off a URL refuses
 * an unknown one with `UNKNOWN_IDENTIFIER` before the engine is reached —
 * which is a different error, meaning «no school is called that» rather than
 * «that school is not computed here». Both survive: an undeclared value
 * reaches `requireImplemented` as a value no entry matches, and is refused as
 * unimplemented, which is the true statement about it.
 */

/** Which layer of the engine a divergence belongs to. */
export type ParameterBoard =
  | 'qimen'
  | 'liuren'
  | 'qizheng'
  | 'taiyi'
  | 'ziwei'
  | 'almanac'
  | 'nianming'
  /**
   * The calendrical layer under every board, which is why it is a board here
   * and is not one anywhere else.
   *
   * `trueSolarTime`, `yearBoundary` and `dayBoundary` are declared in
   * `ChartOptions` beside dunjia's own, because that is the type a chart
   * carries, and they are not dunjia's: they say how an *instant* is read
   * into pillars, and 八字, 六壬 and every board built on those pillars
   * inherits the answer. Filed under `qimen` they would make 八字 a board
   * with no divergences at all, which is false — it has three and shares
   * every one of them.
   */
  | 'pillars';

/**
 * One value a parameter can take.
 *
 * `hanzi` is present where the value **names** something — a method, a
 * register, a book, a boundary — and absent where the identifier is already
 * an English word for a rule (`midnight`, `ascendant`, `off`). It carries no
 * reading beside it, which is the one place this engine's names do not: an
 * option value is named by its identifier, and that identifier already *is*
 * the toneless reading — `chaibu` is 拆補, `futou` is 符頭, `zhongqi` is 中氣.
 * A `pinyin` field here would be the same word a third time, tone marks
 * apart, and for the values whose identifier is a cut of the name — `zhuan`
 * for 轉盤 — it would print a reading the identifier does not match.
 */
export interface ParameterValue<V> {
  readonly id: V;
  readonly hanzi?: string;
  /**
   * Whether the engine computes it.
   *
   * `false` is not a promise that it one day will. `maoshan` is declared and
   * expected never to be implemented — there is no reference against which a
   * 茅山 chart could be falsified — and it is here for the reason every other
   * refused value is: the parameter has to exist before there is a second
   * value, or adding it breaks the API, the MCP tools, the CLI and every
   * shared URL at once.
   */
  readonly implemented: boolean;
}

export interface Parameter<V> {
  readonly board: ParameterBoard;
  readonly values: readonly ParameterValue<V>[];
  /** What the engine assumes when a caller says nothing. */
  readonly default: V;
  /**
   * The code a refusal carries, where it is not `OPTION_NOT_IMPLEMENTED`.
   *
   * One parameter has its own, and it is the ju's `method`:
   * `METHOD_NOT_IMPLEMENTED` shipped before any other divergence had been
   * declared, it is part of the API a caller reads and a surface translates,
   * and folding it into the general code to tidy this table would change
   * what every existing client sees for the most divisive option here. It is
   * a fact about the parameter, so it is recorded on the parameter.
   */
  readonly refusal?: 'METHOD_NOT_IMPLEMENTED';
}

/**
 * The parameters of one options type, keyed by the option itself.
 *
 * Mapped over `keyof O` rather than written as a list, and that is the whole
 * guard: an option added to an interface without an entry here does not
 * compile. A registry that could silently miss a divergence would be worse
 * than no registry, because it would be read as complete.
 */
export type ParameterSet<O> = { readonly [K in keyof O]-?: Parameter<O[K]> };

/** The parameters `ChartOptions` carries: dunjia's five, the pillars' three, the almanac's one. */
export const CHART_PARAMETERS: ParameterSet<ChartOptions> = {
  method: {
    board: 'qimen',
    values: [
      { id: 'chaibu', hanzi: '拆補', implemented: true },
      { id: 'zhirun', hanzi: '置閏', implemented: true },
      { id: 'maoshan', hanzi: '茅山', implemented: false },
    ],
    default: 'chaibu',
    refusal: 'METHOD_NOT_IMPLEMENTED',
  },
  yuan: {
    board: 'qimen',
    values: [
      { id: 'term', implemented: true },
      { id: 'futou', hanzi: '符頭', implemented: true },
    ],
    default: 'term',
  },
  plate: {
    board: 'qimen',
    values: [
      { id: 'zhuan', hanzi: '轉盤', implemented: true },
      { id: 'fei', hanzi: '飛盤', implemented: false },
    ],
    default: 'zhuan',
  },
  centreLodging: {
    board: 'qimen',
    values: [
      { id: 'kun', implemented: true },
      { id: 'dun', implemented: false },
    ],
    default: 'kun',
  },
  system: {
    board: 'qimen',
    values: [
      { id: 'shijia', hanzi: '時家', implemented: true },
      { id: 'rijia', hanzi: '日家', implemented: false },
      { id: 'yuejia', hanzi: '月家', implemented: false },
      { id: 'nianjia', hanzi: '年家', implemented: false },
    ],
    default: 'shijia',
  },
  trueSolarTime: {
    board: 'pillars',
    // The one parameter here whose values are not identifiers, and the
    // absence of `hanzi` on them is not an omission: a correction applied or
    // not applied names no school.
    values: [
      { id: true, implemented: true },
      { id: false, implemented: true },
    ],
    default: true,
  },
  yearBoundary: {
    board: 'pillars',
    values: [
      { id: 'lichun', hanzi: '立春', implemented: true },
      { id: 'chunjie', hanzi: '正月初一', implemented: true },
    ],
    default: 'lichun',
  },
  dayBoundary: {
    board: 'pillars',
    values: [
      { id: 'zishi', hanzi: '子時', implemented: true },
      { id: 'midnight', implemented: true },
    ],
    default: 'zishi',
  },
  shensha: {
    board: 'almanac',
    values: [{ id: 'xieji', hanzi: '協紀辨方書', implemented: true }],
    default: 'xieji',
  },
};

export const LIUREN_PARAMETERS: ParameterSet<LiurenOptions> = {
  yuejiang: {
    board: 'liuren',
    values: [
      { id: 'zhongqi', hanzi: '中氣', implemented: true },
      { id: 'jieqi', hanzi: '節氣', implemented: false },
      { id: 'true', hanzi: '太陽實躔', implemented: false },
    ],
    default: 'zhongqi',
  },
  guiren: {
    board: 'liuren',
    values: [
      { id: 'chou', hanzi: '丑', implemented: true },
      { id: 'wei', hanzi: '未', implemented: true },
    ],
    default: 'chou',
  },
  zhouye: {
    board: 'liuren',
    values: [
      { id: 'branch', implemented: true },
      { id: 'solar', implemented: false },
    ],
    default: 'branch',
  },
};

export const QIZHENG_PARAMETERS: ParameterSet<QizhengOptions> = {
  xiudu: {
    board: 'qizheng',
    values: [
      { id: 'juxing', hanzi: '距星', implemented: true },
      { id: 'shixian', hanzi: '時憲曆', implemented: false },
      { id: 'shoushi', hanzi: '授時曆', implemented: false },
    ],
    default: 'juxing',
  },
  ziqi: {
    board: 'qizheng',
    values: [
      { id: 'off', implemented: true },
      { id: 'yinianyisu', hanzi: '一年一宿', implemented: false },
    ],
    default: 'off',
  },
  luohou: {
    board: 'qizheng',
    values: [
      { id: 'descending', implemented: true },
      { id: 'ascending', implemented: true },
    ],
    default: 'descending',
  },
  minggong: {
    board: 'qizheng',
    values: [
      { id: 'yuejiang', hanzi: '月將', implemented: true },
      { id: 'ascendant', implemented: false },
    ],
    default: 'yuejiang',
  },
  gong: {
    board: 'qizheng',
    values: [
      { id: 'zhongqi', hanzi: '中氣', implemented: true },
      { id: 'ci', hanzi: '次', implemented: false },
    ],
    default: 'zhongqi',
  },
};

export const TAIYI_PARAMETERS: ParameterSet<TaiyiOptions> = {
  epoch: {
    board: 'taiyi',
    values: [{ id: 'jinjing', hanzi: '太乙金鏡式經', implemented: true }],
    default: 'jinjing',
  },
  // 月計, 日計 and 時計 are the registers this one is the first of, and they
  // are absent here because they are absent from the type: a value is
  // declared when the engine is ready to refuse it by name, and until then
  // what the option says is that there is a choice to be made and one
  // reckoning of it. See `docs/parameters.md`.
  ji: {
    board: 'taiyi',
    values: [{ id: 'nianji', hanzi: '年計', implemented: true }],
    default: 'nianji',
  },
  yearBoundary: {
    board: 'taiyi',
    values: [
      { id: 'lichun', hanzi: '立春', implemented: true },
      { id: 'dongzhi', hanzi: '冬至', implemented: false },
      { id: 'chunjie', hanzi: '正月初一', implemented: false },
    ],
    default: 'lichun',
  },
};

/**
 * 紫微斗數's divergences, `gender` apart.
 *
 * `gender` is declared in `ZiweiOptions` beside these and is not one of them:
 * it is input, not a school — what a board is laid *for*, the way a date is,
 * and a board laid without it is the same board with four rings left out
 * rather than a different school's board. Omitted from the type this set is
 * mapped over so that the omission is stated once and checked, rather than
 * being an entry here explaining that it does not belong.
 */
export const ZIWEI_PARAMETERS: ParameterSet<Omit<ZiweiOptions, 'gender'>> = {
  leapMonth: {
    board: 'ziwei',
    values: [
      { id: 'following', implemented: true },
      { id: 'current', implemented: false },
      { id: 'split', implemented: false },
    ],
    default: 'following',
  },
  sihua: {
    board: 'ziwei',
    values: [{ id: 'quanshu', hanzi: '紫微斗數全書', implemented: true }],
    default: 'quanshu',
  },
  huoling: {
    board: 'ziwei',
    values: [
      { id: 'fixed', implemented: true },
      { id: 'hour', implemented: false },
    ],
    default: 'fixed',
  },
  daxian: {
    board: 'ziwei',
    values: [
      { id: 'adjacent', implemented: true },
      { id: 'ming', hanzi: '命宮', implemented: false },
    ],
    default: 'adjacent',
  },
  yearBoundary: {
    board: 'ziwei',
    // Two implemented values, where every other parameter on this board has
    // one. The book says nothing either way and the two lay different boards
    // for a birth in the weeks between them, so neither could be chosen on
    // its behalf.
    values: [
      { id: 'lichun', hanzi: '立春', implemented: true },
      { id: 'chunjie', hanzi: '正月初一', implemented: true },
    ],
    default: 'chunjie',
  },
};

export const NIANMING_PARAMETERS: ParameterSet<NianmingOptions> = {
  count: {
    board: 'nianming',
    values: [
      { id: 'sui', hanzi: '虛歲', implemented: true },
      { id: 'turns', implemented: true },
    ],
    default: 'sui',
  },
};

/** A parameter with its own name on it, for a caller reading the lot. */
export interface ParameterEntry extends Parameter<string | boolean> {
  /** The key it is passed under, which is its name everywhere it is written. */
  readonly id: string;
}

const entriesOf = <O>(set: ParameterSet<O>): ParameterEntry[] =>
  Object.entries(set).map(([id, parameter]) => ({
    ...(parameter as Parameter<string | boolean>),
    id,
  }));

/**
 * Every parameter of every board, flat.
 *
 * The six sets above are keyed by option because that is how a refusal
 * reaches one; this is the same table as a list, because that is how a
 * surface prints one. Neither is the copy: both are the sets, and this is
 * built from them.
 *
 * An `id` is unique only within its board — `yearBoundary` is three
 * parameters here, one of the pillars and one apiece on 太乙 and 紫微斗數,
 * with different values and different defaults. Anything keying on the name
 * alone is keying on half of it.
 */
export const PARAMETERS: readonly ParameterEntry[] = [
  ...entriesOf(CHART_PARAMETERS),
  ...entriesOf(LIUREN_PARAMETERS),
  ...entriesOf(QIZHENG_PARAMETERS),
  ...entriesOf(TAIYI_PARAMETERS),
  ...entriesOf(ZIWEI_PARAMETERS),
  ...entriesOf(NIANMING_PARAMETERS),
];

/** The values of a parameter the engine computes, in the order it declares them. */
export function implementedValues<V>(parameter: Parameter<V>): V[] {
  return parameter.values.filter((value) => value.implemented).map((value) => value.id);
}

/**
 * Refuses an option this engine declares and does not compute.
 *
 * Called at the top of whatever the option reaches first, for every option
 * that function reads — including the ones with nothing refusable in them
 * today. A parameter whose values are all implemented costs one comparison
 * and buys the guarantee the rule asks for: when a value is added to the
 * type, the board that has no branch for it refuses it instead of answering
 * by the nearest rule it does have. `yuan` was exactly that case — an
 * unrecognised value fell through to `term` and produced a chart nobody had
 * asked for.
 *
 * The message says which values *are* computed, joined as the surfaces
 * already printed them, because a refusal that only says no leaves a caller
 * to find the list in a table they may not have.
 */
export function requireImplemented<O extends object, K extends keyof O & string>(
  set: ParameterSet<O>,
  options: Pick<O, K>,
  ...ids: readonly K[]
): void {
  for (const id of ids) {
    // One cast, here: the set is keyed to its own options type so that the
    // declaration cannot drift, and reading it back through a loop is the
    // one place that precision cannot be carried through.
    const parameter = set[id] as unknown as Parameter<string | boolean>;
    const value = options[id] as unknown as string | boolean;
    if (parameter.values.some((candidate) => candidate.id === value && candidate.implemented)) {
      continue;
    }

    if (parameter.refusal === 'METHOD_NOT_IMPLEMENTED') {
      throw new ChartError('METHOD_NOT_IMPLEMENTED', { method: String(value) });
    }
    throw new ChartError('OPTION_NOT_IMPLEMENTED', {
      option: id,
      value: String(value),
      implemented: implementedValues(parameter).map(String).join(', '),
    });
  }
}
