import { CONTROLS } from './bazi/relations.js';
import { horseBranch } from './dunjia/horse.js';
import { ChartError } from './errors.js';
import { BRANCHES, STEMS, decade, type Branch, type Ganzhi, type Stem } from './ganzhi.js';
import { SOLAR_TERMS, type SolarTermDefinition, type SolarTermId } from './solar-terms.js';
import type { Element } from './types.js';

/**
 * 大六壬 — the second of the 三式, laid on the same instant as the first.
 *
 * Qi Men and Liu Ren are siblings: the same moment, the same 時辰, the same
 * sexagenary substrate, and the same act — a question asked now and answered
 * from the board the asking fell on. What differs is the board. Dunjia turns
 * nine palaces; Liu Ren turns twelve branches, reads four lessons (四課) off
 * the turn, and draws three transmissions (三傳) out of the four by a
 * procedure of nine named rules, the 九宗門.
 *
 * **It is procedure throughout, which is why it belongs here.** Every step
 * below is a rule with a stated condition and a stated precedence; not one of
 * them requires a question to have been asked. What the manuals hang on the
 * result — which transmission is the 用神, what the board says about the
 * matter, when it will happen — is the reader's, exactly as `purposes.ts`
 * declines the same for the gates.
 *
 * The 課體, the named courses, come back the way `Pattern` does: an
 * identifier, the hanzi and the reading. They name a shape of the board and
 * are not a verdict on it.
 *
 * See `PLAN.md` § 4 phase 13 for the references this was checked against and
 * the two divergences they settled, and the 六壬 section of `docs/sources.md`
 * for 《六壬大全》卷一 入手法 — the verse that states the nine rules, which was
 * read after this was written and is quoted there line against implementation.
 */

/** The divergences of this board. See `PLAN.md` § 3. */
export interface LiurenOptions {
  /**
   * When the 太陽 changes palace, which fixes the 月將.
   *
   * `zhongqi` is the classical rule and the only one implemented: the general
   * of the month turns at the 中氣 and holds through the 節氣 that follows it,
   * so 雨水 and 驚蟄 both stand at 亥. `jieqi` turns it half a term earlier;
   * `true` would place the Sun by its actual longitude rather than by the
   * term, which is a different quantity and not merely a more precise one.
   */
  yuejiang: 'zhongqi' | 'jieqi' | 'true';

  /**
   * Which transmission of the 貴人 verse places the noble.
   *
   * `chou` is the five-group verse — 甲戊庚 together at 丑未, 乙己 at 子申,
   * 丙丁 at 亥酉, 壬癸 at 巳卯, 辛 at 午寅. `wei` stands 甲 apart at 未丑 and
   * splits the pairs the first verse keeps together.
   *
   * The divergence is bounded, and worth knowing before reading a board by
   * it: **it moves the generals and never the transmissions.** The 三傳 are
   * drawn from the four courses, which the noble does not enter.
   */
  guiren: 'chou' | 'wei';

  /**
   * Where the day is cut, for the noble's day and night seats.
   *
   * `branch` cuts it on the hour branch, 卯 to 申 against 酉 to 寅, which is
   * what the verse assumes and the only value implemented. `solar` would cut
   * it at the actual sunrise and sunset of the place, which no source
   * consulted here states, and it stays unimplemented until one does.
   */
  zhouye: 'branch' | 'solar';
}

export const DEFAULT_LIUREN_OPTIONS: LiurenOptions = Object.freeze({
  yuejiang: 'zhongqi',
  guiren: 'chou',
  zhouye: 'branch',
});

/**
 * 月將 — the general of the month, which is the Sun's seat.
 *
 * The twelve are the Sun's twelve palaces read backwards: as the year runs
 * forward through the terms the general steps back one branch at each 中氣.
 * They are names of things and travel as names — 登明 is dēngmíng to every
 * reader — and the branch is what the board is turned by.
 */
export interface Yuejiang {
  id: YuejiangId;
  hanzi: string;
  pinyin: string;
  branch: Branch;
  /** The 中氣 that seated it. */
  term: SolarTermDefinition;
}

export type YuejiangId =
  | 'dengming' | 'hekui' | 'congkui' | 'chuansong'
  | 'xiaoji' | 'shengguang' | 'taiyi' | 'tiangang'
  | 'taichong' | 'gongcao' | 'daji' | 'shenhou';

/**
 * Which general each 中氣 seats, and on which branch.
 *
 * Keyed by the 中氣 alone: the 節氣 that follows one inherits its general,
 * which is what makes this a table of twelve and not of twenty-four.
 */
const YUEJIANG: Record<string, { id: YuejiangId; hanzi: string; pinyin: string; branch: number }> =
  {
    yushui: { id: 'dengming', hanzi: '登明', pinyin: 'dēngmíng', branch: 11 },
    chunfen: { id: 'hekui', hanzi: '河魁', pinyin: 'hékuí', branch: 10 },
    guyu: { id: 'congkui', hanzi: '從魁', pinyin: 'cóngkuí', branch: 9 },
    xiaoman: { id: 'chuansong', hanzi: '傳送', pinyin: 'chuánsòng', branch: 8 },
    xiazhi: { id: 'xiaoji', hanzi: '小吉', pinyin: 'xiǎojí', branch: 7 },
    dashu: { id: 'shengguang', hanzi: '勝光', pinyin: 'shèngguāng', branch: 6 },
    chushu: { id: 'taiyi', hanzi: '太乙', pinyin: 'tàiyǐ', branch: 5 },
    qiufen: { id: 'tiangang', hanzi: '天罡', pinyin: 'tiāngāng', branch: 4 },
    shuangjiang: { id: 'taichong', hanzi: '太沖', pinyin: 'tàichōng', branch: 3 },
    xiaoxue: { id: 'gongcao', hanzi: '功曹', pinyin: 'gōngcáo', branch: 2 },
    dongzhi: { id: 'daji', hanzi: '大吉', pinyin: 'dàjí', branch: 1 },
    dahan: { id: 'shenhou', hanzi: '神后', pinyin: 'shénhòu', branch: 0 },
  };

/**
 * The general in force under a solar term.
 *
 * A 節氣 carries the general of the 中氣 before it, so a term of that kind is
 * stepped back 15° rather than looked up. No ephemeris is consulted: the term
 * in force already answers this.
 */
export function yuejiangOf(term: SolarTermDefinition, options: LiurenOptions): Yuejiang {
  if (options.yuejiang !== 'zhongqi') {
    throw new ChartError('OPTION_NOT_IMPLEMENTED', {
      option: 'yuejiang',
      value: options.yuejiang,
      implemented: 'zhongqi',
    });
  }
  const qi =
    term.kind === 'qi'
      ? term
      : (SOLAR_TERMS.find((t) => t.longitude === (term.longitude + 345) % 360) as SolarTermDefinition);
  const seat = YUEJIANG[qi.id] as (typeof YUEJIANG)[string];
  return { ...seat, branch: BRANCHES[seat.branch] as Branch, term: qi };
}

/** 十二天將 — the twelve generals, in the order they are laid from the noble. */
export type GeneralId =
  | 'guiren' | 'tengshe' | 'zhuque' | 'liuhe'
  | 'gouchen' | 'qinglong' | 'tiankong' | 'baihu'
  | 'taichang' | 'xuanwu' | 'taiyin' | 'tianhou';

export interface General {
  id: GeneralId;
  hanzi: string;
  pinyin: string;
}

export const GENERALS: readonly General[] = [
  { id: 'guiren', hanzi: '貴人', pinyin: 'guìrén' },
  { id: 'tengshe', hanzi: '螣蛇', pinyin: 'téngshé' },
  { id: 'zhuque', hanzi: '朱雀', pinyin: 'zhūquè' },
  { id: 'liuhe', hanzi: '六合', pinyin: 'liùhé' },
  { id: 'gouchen', hanzi: '勾陳', pinyin: 'gōuchén' },
  { id: 'qinglong', hanzi: '青龍', pinyin: 'qīnglóng' },
  { id: 'tiankong', hanzi: '天空', pinyin: 'tiānkōng' },
  { id: 'baihu', hanzi: '白虎', pinyin: 'báihǔ' },
  { id: 'taichang', hanzi: '太常', pinyin: 'tàicháng' },
  { id: 'xuanwu', hanzi: '玄武', pinyin: 'xuánwǔ' },
  { id: 'taiyin', hanzi: '太陰', pinyin: 'tàiyīn' },
  { id: 'tianhou', hanzi: '天后', pinyin: 'tiānhòu' },
];

/**
 * 寄宮 — the palace a stem lodges in.
 *
 * A stem has no palace of its own, so the board reads it at the branch it
 * lodges in: 甲寄寅, 乙寄辰, 丙戊寄巳, 丁己寄未, 庚寄申, 辛寄戌, 壬寄亥,
 * 癸寄丑. **This is not the 寄宮 of dunjia**, where the question is which
 * palace the centre is read at; the two words name two different detours.
 */
const LODGING: readonly number[] = [2, 4, 5, 7, 5, 7, 8, 10, 11, 1];

export function lodgingOf(stem: Stem): Branch {
  return BRANCHES[LODGING[stem.index] as number] as Branch;
}

/** Where the noble sits by day and by night, under each verse. */
const GUIREN: Record<LiurenOptions['guiren'], readonly (readonly [number, number])[]> = {
  // 甲戊庚牛羊, 乙己鼠猴鄉, 丙丁豬雞位, 壬癸兔蛇藏, 六辛逢馬虎 — by stem index,
  // day seat first.
  chou: [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [6, 2], [5, 3], [5, 3]],
  // The finer table, which stands 甲 apart and splits the pairs the verse
  // above keeps together.
  wei: [[7, 1], [8, 0], [9, 11], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [3, 5], [5, 3]],
};

/**
 * The names of the four lessons and the three transmissions.
 *
 * Positions, and Chinese ones, so they travel as names: 初傳 is chūchuán to
 * every reader and the catalog supplies the gloss beside it. They are here
 * rather than in a surface for the same reason `NIANMING_NAMES` is.
 */
export const COURSE_NAMES = [
  { hanzi: '一課', pinyin: 'yīkè' },
  { hanzi: '二課', pinyin: 'èrkè' },
  { hanzi: '三課', pinyin: 'sānkè' },
  { hanzi: '四課', pinyin: 'sìkè' },
] as const;

export const TRANSMISSION_NAMES = {
  chu: { hanzi: '初傳', pinyin: 'chūchuán' },
  zhong: { hanzi: '中傳', pinyin: 'zhōngchuán' },
  mo: { hanzi: '末傳', pinyin: 'mòchuán' },
} as const;

/** One of the four lessons (課). */
export interface Course {
  /** 一課 to 四課, as the tradition numbers them. */
  number: 1 | 2 | 3 | 4;
  /** The 天盤 branch standing over the ground. */
  upper: Branch;
  /** What it stands on: the day stem for 一課, a branch otherwise. */
  lower: Branch | Stem;
  /** True when `lower` is the day stem, which is read at its 寄宮. */
  lowerIsStem: boolean;
  general: General;
}

/** One of the three transmissions (傳). */
export interface Transmission {
  /** 初傳, 中傳, 末傳. */
  position: 'chu' | 'zhong' | 'mo';
  branch: Branch;
  general: General;
  /**
   * The stem covering the branch in the day's decade (遁干).
   *
   * Absent when the branch is one of the two the decade leaves out, which is
   * the same fact as `empty`.
   */
  hiddenStem?: Stem;
  /** 空亡 — the branch falls outside the day's decade. */
  empty: boolean;
}

/** Which of the 九宗門 drew the transmissions. */
export type LiurenRuleId =
  | 'zeike' | 'biyong' | 'shehai' | 'yaoke' | 'maoxing'
  | 'bieze' | 'bazhuan' | 'fuyin' | 'fanyin';

export const LIUREN_RULES: Record<LiurenRuleId, { hanzi: string; pinyin: string }> = {
  zeike: { hanzi: '賊剋', pinyin: 'zéikè' },
  biyong: { hanzi: '比用', pinyin: 'bǐyòng' },
  shehai: { hanzi: '涉害', pinyin: 'shèhài' },
  yaoke: { hanzi: '遙剋', pinyin: 'yáokè' },
  maoxing: { hanzi: '昴星', pinyin: 'mǎoxīng' },
  bieze: { hanzi: '別責', pinyin: 'biézé' },
  bazhuan: { hanzi: '八專', pinyin: 'bāzhuān' },
  fuyin: { hanzi: '伏吟', pinyin: 'fúyín' },
  fanyin: { hanzi: '返吟', pinyin: 'fǎnyín' },
};

/**
 * The named course (課體) the board turned out to be.
 *
 * A name of a shape, carried the way a `Pattern` is. Where the sources name a
 * shape in one word this reports it; where they disagree or where this engine
 * has no witness, it reports nothing rather than choosing.
 */
export type KetiId =
  | 'yuanshou' | 'zhongshen' | 'zhiyi' | 'shehai'
  | 'haoshi' | 'tanshe' | 'hushi' | 'dongshe'
  | 'bieze' | 'bazhuan' | 'ziren' | 'zixin' | 'duchuan' | 'wuyi' | 'jinglan';

export const KETI: Record<KetiId, { hanzi: string; pinyin: string }> = {
  yuanshou: { hanzi: '元首', pinyin: 'yuánshǒu' },
  zhongshen: { hanzi: '重審', pinyin: 'zhòngshěn' },
  zhiyi: { hanzi: '知一', pinyin: 'zhīyī' },
  shehai: { hanzi: '涉害', pinyin: 'shèhài' },
  haoshi: { hanzi: '蒿矢', pinyin: 'hāoshǐ' },
  tanshe: { hanzi: '彈射', pinyin: 'tánshè' },
  hushi: { hanzi: '虎視', pinyin: 'hǔshì' },
  dongshe: { hanzi: '冬蛇掩目', pinyin: 'dōngshéyǎnmù' },
  bieze: { hanzi: '別責', pinyin: 'biézé' },
  bazhuan: { hanzi: '八專', pinyin: 'bāzhuān' },
  ziren: { hanzi: '自任', pinyin: 'zìrèn' },
  zixin: { hanzi: '自信', pinyin: 'zìxìn' },
  duchuan: { hanzi: '杜傳', pinyin: 'dùchuán' },
  wuyi: { hanzi: '無依', pinyin: 'wúyī' },
  jinglan: { hanzi: '井欄', pinyin: 'jǐnglán' },
};

export interface LiurenBoard {
  /** The general of the month, and the branch the board was turned by. */
  yuejiang: Yuejiang;
  /** The day pillar the courses are read from. */
  day: Ganzhi;
  /** The branch of the hour the general was laid on. */
  hour: Branch;
  /**
   * The 天盤, by palace of the 地盤: `heaven[i]` stands over branch `i`.
   *
   * The 地盤 is not stored, because it is not a result: branch `i` is at
   * palace `i` and has been since before the board was turned.
   */
  heaven: readonly Branch[];
  /** The general over each palace of the 地盤, in the same order. */
  generals: readonly General[];
  /** Whether the noble was seated by its day or its night rule. */
  half: 'day' | 'night';
  /** The four lessons, 一課 first. */
  courses: readonly [Course, Course, Course, Course];
  /** The three transmissions, 初傳 first. */
  transmissions: readonly [Transmission, Transmission, Transmission];
  /** Which of the 九宗門 drew them. */
  rule: LiurenRuleId;
  /** The named course, where this engine has a witness for the name. */
  keti?: KetiId;
  /**
   * True when the rule that drew this board has no runnable reference.
   *
   * Only 返吟 sets it. `kinliuren` defines the method and never dispatches to
   * it, so a 返吟 board there falls through to 遙剋 and returns a degenerate
   * answer. **What this no longer means is unchecked.** 《六壬大全》卷一
   * enumerates the six days a 返吟 can show no control on and names the 初傳
   * for each, and this engine reproduces all six and nothing else — so the
   * rule is attested over the whole of its domain, by a text rather than by
   * something that runs. Whether a flag naming the weaker of the two kinds of
   * evidence should still be raised here is open; see `docs/sources.md`.
   */
  unverified?: true;
  options: LiurenOptions;
}

/**
 * Lays the board for a moment already resolved into pillars.
 *
 * It takes the term and the pillars rather than an instant, because those are
 * what the board is built from and this engine already computes them. Nothing
 * here reaches for an ephemeris.
 */
export function liurenBoard(
  request: { term: SolarTermDefinition; day: Ganzhi; hour: Branch },
  options: LiurenOptions,
): LiurenBoard {
  if (options.zhouye !== 'branch') {
    throw new ChartError('OPTION_NOT_IMPLEMENTED', {
      option: 'zhouye',
      value: options.zhouye,
      implemented: 'branch',
    });
  }

  const yuejiang = yuejiangOf(request.term, options);
  const { day, hour } = request;

  // 月將加時: the general is set on the palace of the hour, and the rest of
  // the branches follow it round. Every branch therefore stands a constant
  // step from where it lives, which is the one fact the whole board turns on.
  const step = (yuejiang.branch.index - hour.index + 12) % 12;
  const heavenAt = (palace: number): Branch =>
    BRANCHES[(palace + step + 12) % 12] as Branch;
  const palaceUnder = (branch: Branch): number => (branch.index - step + 12) % 12;

  const heaven = BRANCHES.map((_, palace) => heavenAt(palace));

  // The noble, and from it the other eleven. Its seat is a branch of the
  // 天盤; the palace that branch stands over decides which way the rest are
  // laid — forward from the six palaces that rise, backward from the six
  // that fall.
  const half: 'day' | 'night' = hour.index >= 3 && hour.index <= 8 ? 'day' : 'night';
  const seats = GUIREN[options.guiren][day.stem.index] as readonly [number, number];
  const nobleBranch = seats[half === 'day' ? 0 : 1];
  const noblePalace = palaceUnder(BRANCHES[nobleBranch] as Branch);
  const forward = noblePalace >= 11 || noblePalace <= 4;
  const generalOver = (branch: Branch): General => {
    const distance = forward
      ? (branch.index - nobleBranch + 12) % 12
      : (nobleBranch - branch.index + 12) % 12;
    return GENERALS[distance] as General;
  };
  const generals = heaven.map(generalOver);

  const courses = fourCourses(day, heavenAt, generalOver);
  const drawn = threeTransmissions({ day, hour, yuejiang, courses, heavenAt, palaceUnder });

  const { empty } = decade(day);
  const emptyBranches = new Set(empty.map((branch) => branch.index));
  const positions = ['chu', 'zhong', 'mo'] as const;
  const transmissions = drawn.branches.map((branch, index) => {
    const offset = (branch.index - decade(day).head.branch.index + 12) % 12;
    const transmission: Transmission = {
      position: positions[index] as 'chu' | 'zhong' | 'mo',
      branch,
      general: generalOver(branch),
      empty: emptyBranches.has(branch.index),
    };
    if (offset < 10) transmission.hiddenStem = STEMS[offset] as Stem;
    return transmission;
  }) as unknown as readonly [Transmission, Transmission, Transmission];

  const board: LiurenBoard = {
    yuejiang,
    day,
    hour,
    heaven,
    generals,
    half,
    courses,
    transmissions,
    rule: drawn.rule,
    options,
  };
  if (drawn.keti) board.keti = drawn.keti;
  if (drawn.rule === 'fanyin') board.unverified = true;
  return board;
}

/**
 * The four lessons.
 *
 * 一課 stands the 天盤 over the stem's lodging; 二課 stands it over what 一課
 * found; 三課 and 四課 do the same from the day's branch. The board is read
 * from the stem's side and then from the branch's, which is why the person and
 * the matter are two pairs and not one.
 */
function fourCourses(
  day: Ganzhi,
  heavenAt: (palace: number) => Branch,
  generalOver: (branch: Branch) => General,
): readonly [Course, Course, Course, Course] {
  const lodging = lodgingOf(day.stem);
  const first = heavenAt(lodging.index);
  const second = heavenAt(first.index);
  const third = heavenAt(day.branch.index);
  const fourth = heavenAt(third.index);
  return [
    { number: 1, upper: first, lower: day.stem, lowerIsStem: true, general: generalOver(first) },
    { number: 2, upper: second, lower: first, lowerIsStem: false, general: generalOver(second) },
    { number: 3, upper: third, lower: day.branch, lowerIsStem: false, general: generalOver(third) },
    { number: 4, upper: fourth, lower: third, lowerIsStem: false, general: generalOver(fourth) },
  ];
}

interface Drawn {
  branches: readonly [Branch, Branch, Branch];
  rule: LiurenRuleId;
  keti?: KetiId;
}

interface Context {
  day: Ganzhi;
  hour: Branch;
  yuejiang: Yuejiang;
  courses: readonly [Course, Course, Course, Course];
  heavenAt: (palace: number) => Branch;
  palaceUnder: (branch: Branch) => number;
}

/**
 * The 九宗門, in the order they are tried.
 *
 * The order is the method. 賊剋 asks the plainest question — does anything on
 * this board control anything under it — and each rule below it exists because
 * the one above returned nothing or returned too much. The two degenerate
 * boards are taken first, because on them the ordinary question is malformed
 * rather than merely unanswered: when the 天盤 has not moved, or has moved
 * exactly half a turn, the four courses stop being four independent readings.
 */
function threeTransmissions(context: Context): Drawn {
  const { day, yuejiang, hour } = context;
  if (yuejiang.branch.index === hour.index) return fuyin(context);
  if ((yuejiang.branch.index - hour.index + 12) % 12 === 6) return fanyin(context);

  const byControl = zeike(context);
  if (byControl) return byControl;

  // 八專 comes in **before** the board is read at a distance, because its
  // condition is 「如無上下相剋」 and a 遙剋 is not a control between a course
  // and its ground — it is what the board is asked once no such control
  // exists. A day whose stem lodges where its branch already stands has fewer
  // than four distinct courses because of the day itself, and that fact is
  // settled before anything is looked for outside them.
  if (lodgingOf(day.stem).index === day.branch.index) return bazhuan(context);

  const distant = yaoke(context);
  if (distant) return distant;

  const distinct = new Set(context.courses.map((course) => `${course.upper.index}`));
  if (distinct.size === 3) return bieze(context);

  return maoxing(context);
}

/** Whether `a` controls `b`. */
const controls = (a: Element, b: Element): boolean => CONTROLS[a] === b;

/** The element a course stands on: a stem's own, or a branch's. */
const groundOf = (course: Course): Element => course.lower.element;

/**
 * 賊剋 — the first and plainest question.
 *
 * 「先取下賊上，無下賊上則取上剋下」. A lower controlling its upper is 賊 and
 * outranks an upper controlling its lower, which is 剋. One of either kind
 * settles the 初傳 outright: 重審 for the first, 元首 for the second. Several
 * of one kind is not a failure of the rule but its next clause, and goes to
 * 比用.
 */
function zeike(context: Context): Drawn | undefined {
  const robbed = context.courses.filter((course) => controls(groundOf(course), course.upper.element));
  const controlled = context.courses.filter((course) =>
    controls(course.upper.element, groundOf(course)),
  );

  const candidates = robbed.length > 0 ? robbed : controlled;
  if (candidates.length === 0) return undefined;

  if (candidates.length === 1) {
    const only = candidates[0] as Course;
    return {
      branches: chain(context, only.upper),
      rule: 'zeike',
      keti: robbed.length > 0 ? 'zhongshen' : 'yuanshou',
    };
  }
  return biyong(context, candidates);
}

/**
 * 比用 — several controls, and the day stem chooses between them.
 *
 * 「俱比則取比，不比則涉害」. The upper that shares the day stem's yin or yang
 * is the one taken; where that leaves one candidate the board is 知一, and
 * where it leaves none or several the question passes to 涉害.
 */
function biyong(context: Context, candidates: readonly Course[]): Drawn {
  const alike = candidates.filter((course) => course.upper.yang === context.day.stem.yang);
  if (alike.length === 1) {
    const only = alike[0] as Course;
    return { branches: chain(context, only.upper), rule: 'biyong', keti: 'zhiyi' };
  }
  return shehai(context, alike.length > 1 ? alike : candidates);
}

/**
 * 涉害 — the deepest wading wins.
 *
 * Each candidate stands somewhere that is not its own palace, and the rule
 * counts what it has to pass through to get home: every palace of the 地盤 on
 * the way whose branch controls it is one harm taken. The one that took most
 * is the 初傳.
 *
 * When the count ties, the tradition breaks it by where the candidates stand
 * rather than by what they suffered — 見機 takes one standing on a 孟 palace
 * (寅申巳亥), and failing that 察微 takes one on a 仲 (子午卯酉).
 *
 * A tie that survives both is left to the order of the courses, and 《六壬大全》
 * 卷一 has a clause for exactly that — 「復等柔辰剛日宜」. **It was implemented
 * and it moves nothing**: over the whole 8 640-board space, under all three
 * readings of what 辰 and 日 name there, the clause never selects a different
 * course from the one the order of the courses already gives. So it is not
 * carried, because a branch that cannot be taken is not a rule, it is
 * decoration on one.
 *
 * The line above it, 「孟深仲淺季當休」, is a live divergence rather than a
 * settled one. Read in the verse's own order — depth first, the palaces
 * breaking a tie — it scores 98.19 % against the reference where the order
 * implemented here scores 99.58 %. This engine follows the two implementations
 * and not the syntax, which is a choice and is recorded as one in the 六壬
 * section of `docs/sources.md`.
 */
function shehai(context: Context, candidates: readonly Course[]): Drawn {
  const depth = (course: Course): number => {
    const from = context.palaceUnder(course.upper);
    let harms = 0;
    // Home is the palace bearing the branch's own name. Walking forward from
    // where it stands reaches it in the same number of steps for every
    // candidate; what differs is what lies along the way.
    for (let step = 1; step <= (course.upper.index - from + 12) % 12; step += 1) {
      const passed = BRANCHES[(from + step) % 12] as Branch;
      if (controls(passed.element, course.upper.element)) harms += 1;
    }
    return harms;
  };

  // 「孟深仲淺季當休」 — where a candidate stands is asked *before* what it
  // suffered, not after it. A board with a candidate on one of the four 孟
  // palaces (寅申巳亥) never weighs one standing on a 仲, and one standing on
  // a 季 is out of the reckoning while either of the others is present. Depth
  // decides inside that group and not across it.
  const meng = candidates.filter((course) => context.palaceUnder(course.upper) % 3 === 2);
  const zhong = candidates.filter((course) => context.palaceUnder(course.upper) % 3 === 0);
  const pool = meng.length > 0 ? meng : zhong.length > 0 ? zhong : candidates;

  const deepest = Math.max(...pool.map(depth));
  const chosen = pool.find((course) => depth(course) === deepest) as Course;
  return { branches: chain(context, chosen.upper), rule: 'shehai', keti: 'shehai' };
}

/**
 * 遙剋 — nothing near, so the board is read at a distance.
 *
 * With no control anywhere among the four courses, the rule looks past the
 * ground each upper stands on and asks how it stands to the *day stem*. An
 * upper controlling the stem is 蒿矢, an arrow already loosed, and outranks
 * the stem controlling an upper, which is 彈射. Several of a kind are settled
 * by 比, as they are above.
 */
function yaoke(context: Context): Drawn | undefined {
  const stem = context.day.stem;
  const shooting = context.courses.filter((course) => controls(course.upper.element, stem.element));
  const shot = context.courses.filter((course) => controls(stem.element, course.upper.element));

  const candidates = shooting.length > 0 ? shooting : shot;
  if (candidates.length === 0) return undefined;

  const keti: KetiId = shooting.length > 0 ? 'haoshi' : 'tanshe';
  const alike = candidates.filter((course) => course.upper.yang === stem.yang);
  const chosen = (alike.length === 1 ? alike[0] : candidates[0]) as Course;
  return { branches: chain(context, chosen.upper), rule: 'yaoke', keti };
}

/**
 * 昴星 — nothing controls anything, near or far.
 *
 * The board has stopped answering, so the rule reads it at a fixed place
 * instead: 酉, the gate the tradition falls back to. A yang day takes what
 * stands over it — 虎視, the tiger looking out — and a yin day takes what it
 * stands on, 冬蛇掩目, the winter snake with its eyes covered. The two remaining
 * transmissions are the branch's seat and the stem's, in the order the day's
 * own polarity gives them.
 */
function maoxing(context: Context): Drawn {
  const { day, heavenAt, palaceUnder, courses } = context;
  const overStem = courses[0].upper;
  const overBranch = courses[2].upper;

  if (day.stem.yang) {
    const first = heavenAt(9);
    return { branches: [first, overBranch, overStem], rule: 'maoxing', keti: 'hushi' };
  }
  const first = BRANCHES[palaceUnder(BRANCHES[9] as Branch)] as Branch;
  return { branches: [first, overStem, overBranch], rule: 'maoxing', keti: 'dongshe' };
}

/**
 * 別責 — three courses where there should be four.
 *
 * A duplicate has collapsed the board, so the 初傳 is fetched from outside it:
 * a yang day takes what stands over the lodging of the stem its own stem pairs
 * with (甲己合, 乙庚合 …), a yin day takes the branch three places on from its
 * own, which is the near corner of its triangle. Both remaining transmissions
 * are the stem's seat, because the board has nothing else left to say.
 */
function bieze(context: Context): Drawn {
  const { day, heavenAt, courses } = context;
  const overStem = courses[0].upper;
  const first = day.stem.yang
    ? heavenAt(lodgingOf(STEMS[(day.stem.index + 5) % 10] as Stem).index)
    : (BRANCHES[(day.branch.index + 4) % 12] as Branch);
  return { branches: [first, overStem, overStem], rule: 'bieze', keti: 'bieze' };
}

/**
 * 八專 — the stem and the branch keep one palace.
 *
 * On the eight days whose stem lodges where its branch already is, the first
 * and third courses read the same place and the board cannot be four things.
 * A yang day counts three forward from what stands over the stem, a yin day
 * three back from the fourth course, and the rest is the stem's seat twice.
 */
function bazhuan(context: Context): Drawn {
  const { day, courses } = context;
  const overStem = courses[0].upper;
  const first = day.stem.yang
    ? (BRANCHES[(overStem.index + 2) % 12] as Branch)
    : (BRANCHES[(courses[3].upper.index - 2 + 12) % 12] as Branch);
  return { branches: [first, overStem, overStem], rule: 'bazhuan', keti: 'bazhuan' };
}

/**
 * 伏吟 — the 天盤 has not moved.
 *
 * When the general of the month falls on its own hour, every branch stands at
 * home and the board is silent. The rule reads the 刑 instead of the 剋: a
 * yang day opens at the stem's seat and a yin day at the branch's — 自任 and
 * 自信, the board taking its own word for it — and each transmission punishes
 * the one before it. A branch that punishes itself has nothing to hand on, and
 * the tradition sends the board to the branch's seat instead.
 */
function fuyin(context: Context): Drawn {
  const { day, courses } = context;
  const lodging = lodgingOf(day.stem);

  // A 伏吟 board can still show one control, and only one: the branches of the
  // second, third and fourth courses stand on themselves, so nothing there can
  // control anything. What is left is the first, the lodging over the stem —
  // and where it controls or is controlled, the board is answered by the
  // ordinary rule and named 杜傳 rather than for its own silence.
  const struck = courses.find(
    (course) =>
      controls(groundOf(course), course.upper.element) ||
      controls(course.upper.element, groundOf(course)),
  );

  const opening = struck ? struck.upper : day.stem.yang ? lodging : day.branch;
  const keti: KetiId = struck ? 'duchuan' : day.stem.yang ? 'ziren' : 'zixin';

  // Each transmission punishes the one before it. Two things break that chain.
  // For the first the verse has an answer: a branch that punishes itself hands
  // on nothing, so the board crosses to its other seat — 「若也自刑為發用，次傳
  // 顛倒日辰併」, the stem's if it was standing on the branch's and the
  // branch's if the stem's — and where the middle punishes itself in turn the
  // last is its opposite, 「次傳更復自刑者，冲取末傳不論刑」.
  //
  // The second is this engine's own reading and is marked as such in
  // `docs/sources.md`: a punishment that leads back to the opening is no
  // advance either, so it is taken the same way. 《六壬大全》卷一 addresses
  // only the self-punishing middle, and no witness has been found for this.
  const other = opening.index === lodging.index ? day.branch : lodging;
  const punished = punishment(opening);
  const middle = punished.index === opening.index ? other : punished;

  const third = punishment(middle);
  const revisits = third.index === middle.index || third.index === opening.index;
  const last = revisits ? (BRANCHES[(middle.index + 6) % 12] as Branch) : third;

  return { branches: [opening, middle, last], rule: 'fuyin', keti };
}

/**
 * 返吟 — the 天盤 has turned exactly half.
 *
 * Every branch faces its opposite, and nothing stands where it belongs. Where
 * the board still shows a control the ordinary rule is applied to it and the
 * course is 無依 — 「返吟有尅亦為用」; where it shows none, the tradition puts
 * the 驛馬 in front and follows it with the branch's seat and the stem's.
 *
 * **This is the one rule here with no runnable reference.** `kinliuren`
 * defines a `fanyin` and never dispatches to it, and what it returns is not a
 * set of transmissions at all. Every board drawn by this rule is marked
 * `unverified`, and every surface says so.
 *
 * The text checks it where no implementation could. 《六壬大全》卷一 does not
 * carry the formula 「返吟無剋以馬推」 this comment used to cite; it enumerates
 * instead — 「若知六日該無尅，丑未同干丁己辛，丑日登眀未太乙」 — and the six
 * days it names are the six this engine produces, opening on 亥 and 巳, which
 * are the 驛馬 of 丑 and of 未. Enumeration and derivation meet exactly.
 *
 * The 課體 is the verse's own: 「無尅别有井欄名」. It used to be `wuqin` 無親,
 * a name no source consulted carries, and the rename is the register catching
 * one. See `docs/sources.md`.
 */
function fanyin(context: Context): Drawn {
  const byControl = zeike(context);
  if (byControl) return { ...byControl, rule: 'fanyin', keti: 'wuyi' };
  const { day, courses } = context;
  return {
    branches: [horseBranch(day.branch), courses[2].upper, courses[0].upper],
    rule: 'fanyin',
    keti: 'jinglan',
  };
}

/**
 * The 三刑 — which branch punishes which.
 *
 * 寅刑巳, 巳刑申, 申刑寅 without gratitude; 丑刑戌, 戌刑未, 未刑丑 by
 * presuming on strength; 子刑卯 and 卯刑子 without manners; and 辰午酉亥, which
 * punish themselves and hand the board nothing.
 */
const PUNISHES: readonly number[] = [3, 10, 5, 0, 4, 8, 6, 1, 2, 9, 7, 11];

function punishment(branch: Branch): Branch {
  return BRANCHES[PUNISHES[branch.index] as number] as Branch;
}

/**
 * The two transmissions that follow the first.
 *
 * Each is what stands over the one before it. The board is being read upward
 * twice, which is why the three are a chain and not three separate findings.
 */
function chain(context: Context, first: Branch): readonly [Branch, Branch, Branch] {
  const middle = context.heavenAt(first.index);
  return [first, middle, context.heavenAt(middle.index)];
}
