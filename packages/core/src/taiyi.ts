import { GATES, type Gate } from './dunjia/plates.js';
import { PALACES, type Direction, type Palace, type PalaceId } from './dunjia/palaces.js';
import { VALENCE, type Valence } from './dunjia/patterns.js';
import type { EphemerisContext } from './ephemeris.js';
import { BRANCHES, ganzhiOf, yearGanzhi, type Branch, type Ganzhi } from './ganzhi.js';
import { TAIYI_PARAMETERS, requireImplemented } from './parameters.js';
import { lastCrossingBefore } from './pillars.js';
import { fromJulianDay } from './time.js';
import type { Element } from './types.js';

/**
 * 太乙神數 — the third of the 三式, and the one whose subject is a year.
 *
 * Qi Men is asked a question and 八字 is laid on a birth. This board is laid
 * on neither: 太乙主天, and what it is a function of is the year the world is
 * standing in. Nobody's data enters it, which is why the section that shows it
 * can be linked and cached in public where a chart never can.
 *
 * Everything here comes from 《太乙金鏡式經》 (王希明, 唐, c. 730, 十卷,
 * 四庫全書本), read once for the domains of the gates and read again whole for
 * this. **The text states its own epoch and then checks it**, which is what
 * made this board possible at all: three 上元積年 appear in it, in three
 * different chapters and differing by millions, and all three are congruent
 * modulo 周紀法 三百六十 — the one residue every placement in the 年計 reduces
 * by. The magnitude is unsettled and irrelevant; the board is not. See the
 * 太乙 section of `docs/sources.md`, where the figures are quoted and the
 * arithmetic is done.
 *
 * **What it refuses is what the received doctrine is mostly made of.** The
 * transmitted readings of this board are dynastic — wars, famines, mutations,
 * dated — which is the class this engine already declines, arriving in a
 * register where it is more dangerous rather than less. And it never says who
 * is 主 and who is 客: identifying host and guest is the first interpretive
 * act the system asks for, and it is the reader's, for the reason the 用神 is.
 * The board names positions and numbers and stops.
 */

/** The divergences of this board. See `docs/parameters.md`. */
export interface TaiyiOptions {
  /**
   * Which 上元積年 the count runs from.
   *
   * `jinjing` is 《太乙金鏡式經》's own, and the only one implemented: the text
   * hands down 一百九十三萬七千二百八十一 at 開元十二年甲子 (724 CE) and
   * two shorter reckonings beside it, and since all three agree modulo 360
   * they are one epoch for this register. 《太乙統宗寶鑑》 states another; it
   * has not been read here, and a branch nobody has read is worse than a
   * branch that does not exist yet. This exists so that reading it later
   * cannot break a shared link.
   */
  epoch: 'jinjing';

  /**
   * Which register the board is laid in.
   *
   * `nianji` (年計) is the register of the year, the only one implemented and
   * the one 卷二 assigns to the highest subject — 王者用嵗計. 月計, 日計 and
   * 時計 run the same placements over a count of months, days or hours; the
   * text states all four and this engine computes one.
   */
  ji: 'nianji';

  /**
   * Where the counted year begins.
   *
   * It is upstream of everything here: the board is a function of a year, and
   * this is what decides which year an instant is in. `lichun` is the default
   * because the pillars beside it turn there, and a board that cut the year
   * elsewhere would be two calendars in one output. The text states no
   * boundary of its own, which is why this is a parameter and not a constant.
   *
   * Only `lichun` is implemented. See `taiyiYearOf`, which is where it bites.
   */
  yearBoundary: 'lichun' | 'dongzhi' | 'chunjie';
}

export const DEFAULT_TAIYI_OPTIONS: TaiyiOptions = Object.freeze({
  epoch: 'jinjing',
  ji: 'nianji',
  yearBoundary: 'lichun',
});

/**
 * The year the epoch is anchored on: 大唐開元十二年甲子, 724 CE.
 *
 * 「自上元混沌甲子之嵗至今大唐開元十二年甲子嵗積得一百九十三萬七千二百八十
 * 一筭」, and then the line that makes the figure usable at all: 「上考往古每
 * 年减一筭，下檢將来每年加一筭」.
 */
const ANCHOR_YEAR = 724;

/**
 * The counts the text anchors at 開元十二年, each with its own 上元.
 *
 * They are not one number scaled: 卷一's is the count the 年計 proper runs on,
 * 卷四's 小遊 count and 卷五's 五福, 大遊 and 三基 counts each come from a
 * different epoch, and the text states each separately. Every one of them is
 * quoted in `docs/sources.md`.
 */
const ACCUMULATED_AT_ANCHOR = {
  /** 卷一 推上元積年. 卷三's 三萬一筭 and 卷一's 四萬八百一筭 agree with it mod 360. */
  taiyi: 1_937_281,
  /** 卷四 推三門具不具, 「與小遊同」 — and 卷五's 小遊 count, 三千三百六十一. */
  xiaoyou: 3_361,
  /** 卷五 推五福太乙法 and 推大遊太乙, both 一萬三千三百三十一. */
  wufu: 13_331,
  /** 卷五 推積年法, 二十八萬五千一十一 — with 六百十一 from 漢安帝元初甲寅 beside it. */
  sanji: 285_011,
} as const;

/* ── The eight palaces, in this board's own numbering ─────────────────── */

/**
 * 太乙式九宮 — the palaces, which are **not** numbered as the 洛書 numbers them.
 *
 * 卷二: 「黄帝又命風后為太乙式，九宫皆差一位」, and the text gives the whole
 * map — 「一宫在乾…二宫在離…三宫在艮…四宫在震…六宫在兑…七宫在坤…八宫在坎…
 * 九宫在巽」. Each number has moved one seat anticlockwise from where the 洛書
 * puts it, so that 一 reaches 乾: 「所以差一宫以就乾位」.
 *
 * This is the first thing to hold on to when reading this board beside a Qi
 * Men chart, because the two figures look identical and agree nowhere. 一宮
 * here is the north-west, not the north; 九宮 is the south-east, not the
 * south. A reader who carries the chart's numbering across gets every palace
 * wrong by one seat and no output anywhere will contradict them.
 */
export interface TaiyiPalace {
  /** The number this board counts with, 1 to 9. 太乙 never enters 5. */
  number: number;
  /** Toneless pinyin of the trigram, as in a chart. */
  id: PalaceId;
  hanzi: string;
  /** The trigram said aloud, e.g. `qián`. */
  pinyin: string;
  /** Compass direction. The centre has none. */
  direction: Direction | null;
}

/**
 * The map 卷二 gives, and the whole of what this board changes: which trigram
 * each number reaches. What 乾 is called, how it is said and which way it
 * faces are the same facts a chart reads, so they are taken from `PALACES`
 * rather than written down a second time — the number is the difference, and
 * a second copy of the other three would be three ways to drift apart from a
 * table that is not in dispute.
 */
const TAIYI_TRIGRAMS: readonly PalaceId[] = [
  'qian', 'li', 'gen', 'zhen', 'zhong', 'dui', 'kun', 'kan', 'xun',
];

export const TAIYI_PALACES: readonly TaiyiPalace[] = TAIYI_TRIGRAMS.map((id, index) => {
  const { hanzi, pinyin, direction } = PALACES.find((one) => one.id === id) as Palace;
  return { number: index + 1, id, hanzi, pinyin, direction };
});

export function taiyiPalace(number: number): TaiyiPalace {
  const found = TAIYI_PALACES.find((candidate) => candidate.number === number);
  if (!found) throw new Error(`no taiyi palace numbered ${number}`);
  return found;
}

/**
 * The order 太乙 walks: 「命起一宫，順行八宫，不遊中五」.
 *
 * The numbers in order, not the compass in order — 卷三's 立成 of seventy-two
 * settles it, giving 太乙 in 一宮 for 局 1 to 3, 二宮 for 4 to 6 and so on to
 * 九宮 at 22 to 24. The walk therefore zigzags across the board exactly as
 * 順飛 does in dunjia, and 不遊中五 is what makes it eight and not nine.
 */
const WALK: readonly number[] = [1, 2, 3, 4, 6, 7, 8, 9];

/**
 * The same eight in compass order, clockwise from 乾.
 *
 * 卷一: 「順歴乾坎艮震四卦八宫」 for the yang half and 「巽離坤兑」 for the
 * yin. It is the ring the sixteen gods are seated on, and the ring the 參將
 * is found on.
 */
const RING: readonly number[] = [1, 8, 3, 4, 9, 2, 7, 6];

/**
 * 陽宮 and 陰宮: 卷二, 「八三四九為陽，二七六一為隂」.
 *
 * A flat property of the palace, repeated identically in 卷五 and 卷六 — and
 * not a verdict, though every use the text puts it to is one.
 */
const YANG_PALACES: readonly number[] = [3, 4, 8, 9];

/* ── The sixteen gods ─────────────────────────────────────────────────── */

export type TaiyiGodId =
  | 'dizhu' | 'yangde' | 'hede' | 'lushen'
  | 'gaocong' | 'taiyang' | 'taijiong' | 'taishen'
  | 'dawei' | 'tiandao' | 'dawu' | 'wude'
  | 'taicu' | 'yinzhu' | 'yinde' | 'dayi';

/**
 * 十六神 — the ring the whole board is read on.
 *
 * Twelve branches and the four corner trigrams, each under a name of its own,
 * and 卷二 推十六神所主法 gives all sixteen with the reason for each name:
 * 「子神曰地主…丑神曰陽徳…艮神曰和徳…」 down to 「亥神曰大義」. Eight of
 * them sit at a palace (正宮) and eight sit between palaces (間神), and that
 * difference is not decoration — it decides what a count opens on.
 *
 * The element is the seat's own. 卷六 states it for thirteen of the sixteen
 * in one passage — 「假今髙叢木，以吕申、大炅同類為旺；以大義、地主為相；
 * 武徳、太蔟為死；和徳、大武、太陽、天道為囚；大神、大威為休」 — and every
 * one of them is the element of the branch or trigram it stands on, so the
 * remaining three follow rather than being guessed at.
 */
export interface TaiyiGod {
  id: TaiyiGodId;
  hanzi: string;
  /** The name said aloud, e.g. `dìzhǔ`. */
  pinyin: string;
  /** Where it sits: a branch, or a corner trigram. */
  seat: { kind: 'branch'; branch: Branch } | { kind: 'trigram'; palace: TaiyiPalace };
  /** The palace it stands at, or `undefined` for the eight 間神. */
  palace?: number;
  element: Element;
}

/**
 * The sixteen seats, clockwise from 子.
 *
 * The array index *is* the seat, and everything on this board is counted by
 * stepping it: the gods, the palaces, the counts, and every adjacency the
 * named conditions test.
 */
const SEATS: readonly {
  id: TaiyiGodId;
  hanzi: string;
  pinyin: string;
  branch?: number;
  palace?: number;
  element: Element;
}[] = [
  { id: 'dizhu', hanzi: '地主', pinyin: 'dìzhǔ', branch: 0, palace: 8, element: 'shui' },
  { id: 'yangde', hanzi: '陽德', pinyin: 'yángdé', branch: 1, element: 'tu' },
  { id: 'hede', hanzi: '和德', pinyin: 'hédé', palace: 3, element: 'tu' },
  { id: 'lushen', hanzi: '呂申', pinyin: 'lǚshēn', branch: 2, element: 'mu' },
  { id: 'gaocong', hanzi: '高叢', pinyin: 'gāocóng', branch: 3, palace: 4, element: 'mu' },
  { id: 'taiyang', hanzi: '太陽', pinyin: 'tàiyáng', branch: 4, element: 'tu' },
  { id: 'taijiong', hanzi: '太炅', pinyin: 'tàijiǒng', palace: 9, element: 'mu' },
  { id: 'taishen', hanzi: '太神', pinyin: 'tàishén', branch: 5, element: 'huo' },
  { id: 'dawei', hanzi: '大威', pinyin: 'dàwēi', branch: 6, palace: 2, element: 'huo' },
  { id: 'tiandao', hanzi: '天道', pinyin: 'tiāndào', branch: 7, element: 'tu' },
  { id: 'dawu', hanzi: '大武', pinyin: 'dàwǔ', palace: 7, element: 'tu' },
  { id: 'wude', hanzi: '武德', pinyin: 'wǔdé', branch: 8, element: 'jin' },
  { id: 'taicu', hanzi: '太蔟', pinyin: 'tàicù', branch: 9, palace: 6, element: 'jin' },
  { id: 'yinzhu', hanzi: '陰主', pinyin: 'yīnzhǔ', branch: 10, element: 'tu' },
  { id: 'yinde', hanzi: '陰德', pinyin: 'yīndé', palace: 1, element: 'jin' },
  { id: 'dayi', hanzi: '大義', pinyin: 'dàyì', branch: 11, element: 'shui' },
];

/** Which seat a branch takes on the ring of sixteen. */
const BRANCH_SEAT: readonly number[] = [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15];

export const TAIYI_GODS: readonly TaiyiGod[] = SEATS.map((_, index) => buildGod(index));

/**
 * The god on a seat, which is the ring counted in either direction.
 *
 * Every walk on this board overshoots sixteen or steps back past nought, so
 * the modulo is here rather than at each of them. The sixteen themselves are
 * built once: a god is a name and a seat, identical at every year, and one
 * that arrived freshly allocated could not be compared by identity with the
 * one the board is carrying.
 */
function godAt(index: number): TaiyiGod {
  return TAIYI_GODS[((index % 16) + 16) % 16] as TaiyiGod;
}

function buildGod(index: number): TaiyiGod {
  const seat = SEATS[index] as (typeof SEATS)[number];
  const { id, hanzi, pinyin, element, palace } = seat;
  const where =
    seat.branch === undefined
      ? ({ kind: 'trigram', palace: taiyiPalace(palace as number) } as const)
      : ({ kind: 'branch', branch: BRANCHES[seat.branch] as Branch } as const);
  return palace === undefined
    ? { id, hanzi, pinyin, seat: where, element }
    : { id, hanzi, pinyin, seat: where, palace, element };
}

/** Where each of the sixteen sits, and which of the nine sits where. */
const GOD_SEAT = Object.fromEntries(SEATS.map((seat, index) => [seat.id, index])) as Record<
  TaiyiGodId,
  number
>;
const PALACE_SEAT = new Map(
  SEATS.flatMap((seat, index) => (seat.palace === undefined ? [] : [[seat.palace, index] as const])),
);

/** The seat a god occupies, which is its index in the ring of sixteen. */
function seatOf(god: TaiyiGod): number {
  return GOD_SEAT[god.id];
}

/** The seat a palace occupies on the same ring. Eight of the sixteen are these. */
function seatOfPalace(palace: number): number {
  const seat = PALACE_SEAT.get(palace);
  if (seat === undefined) throw new Error(`palace ${palace} has no seat on the ring of sixteen`);
  return seat;
}

/* ── The board ────────────────────────────────────────────────────────── */

/** A body that walks the palaces, with how far into its palace it stands. */
export interface TaiyiStation {
  palace: TaiyiPalace;
  /** Years elapsed in this palace, counted inclusively — 入宮以來年數. */
  year: number;
}

/** One of the two parties: a count, and the two generals it seats. */
export interface TaiyiSide {
  /** 主算 or 客算 — the number the whole board exists to produce. */
  count: number;
  /** Which god the count was taken from: 文昌 for the host, 始擊 for the guest. */
  from: TaiyiGod;
  /** 大將, the palace the count reduces to. */
  general: TaiyiPalace;
  /**
   * 參將, a quarter turn clockwise from the 大將.
   *
   * Absent when the count reduces to the centre. The text never states this
   * step in words — it is read off its own worked boards, which agree on it
   * eleven times over and never place a 參將 from a centred 大將. See
   * `docs/sources.md`, where the eleven are listed.
   */
  assistant?: TaiyiPalace;
}

/** A body seated on the twelve 邦, which are the branches from 戌. */
export interface TaiyiFief {
  branch: Branch;
  /** Years elapsed in this fief, counted inclusively. */
  year: number;
  /**
   * How many years a fief lasts for this base — thirty, three, or one.
   *
   * Carried beside the count rather than left to the reader, because the count
   * alone is unreadable and reads as though it were readable. 卷五 gives the
   * three bases three different periods over the same ring of twelve, so 民基
   * standing at 1 is not a base that has just begun: it is a base that moves
   * every year and can never say anything else. Printed as `1/1`, the figure
   * says so; printed as `1` beside a sovereign at `23`, it was read as two
   * structures newly started under an old one, which is a fact nobody
   * computed.
   */
  period: number;
}

export type TaiyiPatternId = 'yan' | 'ji' | 'po' | 'qiu' | 'guan' | 'ge' | 'dui';

/**
 * A condition the board has fallen into.
 *
 * Each is checkable off the placements — that the 始擊 stands in 太乙's palace
 * is something anyone can verify — and each is named and weighed in one line
 * of 卷三, which is why the fortune travels with it exactly as `Pattern`'s
 * does. The seven here are the seven 卷三 states as relations between the
 * bodies this engine places. 四郭固, 四郭杜, 執提 and 提挾 are stated there
 * too and are not computed: each needs the three gates and the five generals
 * read together, and the text's account of them turns on which party is which
 * — which is the question this board does not ask.
 */
export interface TaiyiPattern {
  id: TaiyiPatternId;
  hanzi: string;
  /** The name said aloud, e.g. `yǎn`. */
  pinyin: string;
  /** 吉 or 凶, as 卷三 hands it down. All seven of these are 凶. */
  valence: Valence;
  /**
   * What 卷三 says the condition **is**, in its own words — where it says it.
   *
   * Quoted, never paraphrased and never this engine's. It travels for the
   * reason `valence` travels and is the sentence that earns it: 掩 *is*
   * 掩襲刼殺之義. The omens the chapter puts around it stay out, and 對 has no
   * such sentence at all and so has no `meaning`. See `PATTERNS`.
   */
  meaning?: string;
  /** Which body fell into it. */
  subject: TaiyiPatternSubject;
  /** The other body, where the condition is a meeting of two — only 關 is. */
  partner?: TaiyiPatternSubject;
  /** Where, when the condition names a palace. */
  palace?: number;
  /**
   * Which of the named kinds, where 卷三 distinguishes them.
   *
   * 前 and 後 are ahead of and behind 太乙 on the ring, and 辰 and 宮 are the
   * two distances the text separates: 「宫迫災㣲緩，辰迫災急疾」.
   */
  kind?: 'qianchen' | 'houchen' | 'qiangong' | 'hougong';
}

export type TaiyiPatternSubject =
  | 'wenchang' | 'shiji'
  | 'hostGeneral' | 'hostAssistant'
  | 'guestGeneral' | 'guestAssistant';

export interface TaiyiBoard {
  /** The year the board is laid on, in astronomical numbering. */
  year: number;
  /** 太歲 — the pillar of the year, read out of the count itself. */
  sui: Ganzhi;
  /** 上元積年 — how far into each of the text's counts this year stands. */
  accumulated: Record<keyof typeof ACCUMULATED_AT_ANCHOR, number>;
  /**
   * 入六紀 — which of the six 紀 the year stands in, and how far into it.
   *
   * Named for the 紀 and not for `options.ji`, which is a different word: this
   * is one of the six sixties a 周紀 is cut into, and that is which register
   * the board is laid in. 卷二 推帝王年紀法 lists twenty-six datable 甲子
   * years against this number, which is the longest check the text offers.
   */
  liuji: { number: number; year: number };
  /** 局 — the row of the 立成 of seventy-two this year falls on. */
  ju: number;
  /** 太乙 itself, which is also the 小遊: 卷五 says so and the counts agree. */
  taiyi: TaiyiStation;
  /** Whether that palace is one of 八三四九 or one of 二七六一. */
  yang: boolean;
  /** 文昌, the 下目, which is 主's. */
  wenchang: TaiyiGod;
  /** 始擊, the 上目, which is 客's. */
  shiji: TaiyiGod;
  /**
   * The sixteen, in ring order from 子.
   *
   * A constant of the board rather than a result of the year, and carried in
   * the output all the same: it is the ring everything else here is seated on,
   * so a board that travelled without it would be a set of names with no
   * figure — and `packages/plate`, which may not reach into the engine, would
   * have to keep a second copy of the seats to draw one.
   */
  gods: readonly TaiyiGod[];
  /** 計神. */
  jishen: Branch;
  /** 合神, the 六合 of the 太歲. */
  heshen: Branch;
  /** 主: the count taken from 文昌, and its two generals. */
  host: TaiyiSide;
  /** 客: the count taken from 始擊, and its two generals. */
  guest: TaiyiSide;
  /** 八門直使 — one gate every thirty years, and how far into it. */
  gate: { gate: Gate; year: number };
  /** 三基 — 君基, 臣基, 民基, on the twelve fiefs from 戌. */
  sanji: { jun: TaiyiFief; chen: TaiyiFief; min: TaiyiFief };
  /** 五福太乙 — one of five named palaces, forty-five years each. */
  wufu: { palace: TaiyiWufuPalace; year: number };
  /** 大遊太乙, with the 天目 of its own count. */
  dayou: { station: TaiyiStation; wenchang: TaiyiGod };
  /** Every condition the board has fallen into. Nothing here is ranked. */
  patterns: TaiyiPattern[];
  options: TaiyiOptions;
}

/**
 * 五福太乙's five stations, which are named palaces rather than numbers.
 *
 * 卷五: 「其一曰黄秘宫，在西河之乾地，西北方也；其二曰黄始宫，在遼東之艮
 * 地…其三曰黄室宫，在東吴之巽地…其四曰黄庭宫，在西蜀之坤地…其五曰𤣥師宫，
 * 在京都洛陽之地，中原也」. Four corners and the centre, forty-five years
 * each, two hundred and twenty-five to the circuit.
 */
export interface TaiyiWufuPalace {
  id: 'huangmi' | 'huangshi3' | 'huangshi4' | 'huangting' | 'xuanshi';
  hanzi: string;
  pinyin: string;
  palace: TaiyiPalace;
}

export const TAIYI_WUFU_PALACES: readonly TaiyiWufuPalace[] = [
  { id: 'huangmi', hanzi: '黃祕宮', pinyin: 'huángmìgōng', palace: taiyiPalace(1) },
  { id: 'huangshi3', hanzi: '黃始宮', pinyin: 'huángshǐgōng', palace: taiyiPalace(3) },
  { id: 'huangshi4', hanzi: '黃室宮', pinyin: 'huángshìgōng', palace: taiyiPalace(9) },
  { id: 'huangting', hanzi: '黃庭宮', pinyin: 'huángtínggōng', palace: taiyiPalace(7) },
  { id: 'xuanshi', hanzi: '玄師宮', pinyin: 'xuánshīgōng', palace: taiyiPalace(5) },
];

/**
 * The gates in the order the 直使 walks them.
 *
 * 卷一: 「命起開門，次休生，左行八門，周而復始」, which is the compass ring
 * from 乾 — 乾開, 坎休, 艮生, 震傷, 巽杜, 離景, 坤死, 兌驚, the same eight
 * seats 卷二 推八門所主法 gives. Thirty years each.
 */
const GATE_ORDER: readonly Gate[] = (
  ['kaimen', 'xiumen', 'shengmen', 'shangmen', 'dumen', 'jing3men', 'simen', 'jing1men'] as const
).map((id) => GATES.find((gate) => gate.id === id) as Gate);

/* ── Casting ──────────────────────────────────────────────────────────── */

/**
 * Lays the 年計 board for a year.
 *
 * The year is the whole of the input. There is no place, no hour and nobody's
 * date of birth in it, which is what lets the section that shows it be cached
 * in public — the board of 2026 is the same board for everybody standing in
 * 2026.
 */
export function taiyiBoard(request: { year: number }, options: TaiyiOptions): TaiyiBoard {
  // The boundary is refused here as well as in `taiyiYearOf`, though the year
  // arrives already decided and this function never cuts one: a board carries
  // the options that produced it, and one that recorded a boundary nothing
  // here can compute would be a board saying it was cut somewhere it was not.
  requireImplemented(TAIYI_PARAMETERS, options, 'epoch', 'ji', 'yearBoundary');

  const { year } = request;
  const elapsed = year - ANCHOR_YEAR;
  const accumulated = {
    taiyi: ACCUMULATED_AT_ANCHOR.taiyi + elapsed,
    xiaoyou: ACCUMULATED_AT_ANCHOR.xiaoyou + elapsed,
    wufu: ACCUMULATED_AT_ANCHOR.wufu + elapsed,
    sanji: ACCUMULATED_AT_ANCHOR.sanji + elapsed,
  };

  // 「置上元甲子積年，以三百六十去之，不盡以六十去之，又不盡，命甲子筭外，
  // 即太嵗所在辰也」. The count is inclusive, so a remainder of one is 甲子
  // itself — which is what makes 開元十二年 come out 甲子, as the text says.
  const sui = ganzhiOf(inclusive(accumulated.taiyi, 60) - 1);

  const intoCycle = inclusive(accumulated.taiyi, 360);
  const liuji = { number: Math.floor((intoCycle - 1) / 60) + 1, year: inclusive(intoCycle, 60) };
  const ju = inclusive(intoCycle, 72);

  const board = taiyiJu(ju, 'yang');

  // 合神 — 「假令太嵗在子，合神在丑」, which is the 六合 of the year: 子丑,
  // 寅亥, 卯戌, 辰酉, 巳申, 午未, each pair summing to thirteen on the wheel.
  const heshen = BRANCHES[(13 - sui.branch.index) % 12] as Branch;

  return {
    year,
    sui,
    accumulated,
    liuji,
    ju,
    ...board,
    heshen,
    gate: gateOf(accumulated.xiaoyou),
    sanji: sanjiOf(accumulated.sanji),
    wufu: wufuOf(accumulated.wufu),
    dayou: dayouOf(accumulated.wufu),
    options,
  };
}

/**
 * Everything the 立成 of seventy-two holds, for one of its rows.
 *
 * Split out because 卷三 prints the table twice — 陽局 and 陰局 — and the two
 * are the same procedure counted from opposite seats. The 年計 uses the yang
 * table alone; the yin one is here because it is what the text's own worked
 * boards in 卷六 and 卷九 are checked against, and because the registers
 * below the year will need it.
 */
export function taiyiJu(
  ju: number,
  dun: 'yang' | 'yin',
): Pick<
  TaiyiBoard,
  'taiyi' | 'gods' | 'yang' | 'wenchang' | 'shiji' | 'jishen' | 'host' | 'guest' | 'patterns'
> {
  // 「以太乙小周法二十四除之，又不盡，以三約之為宫數，不滿為入宫以来年數，
  // 其宫數命起一宫，順行八宫，不遊中五」. Three years to a palace, twenty-four
  // to the circuit. The yin table runs the same walk backwards from 九宮.
  const intoCircuit = inclusive(ju, 24);
  const steps = Math.floor((intoCircuit - 1) / 3);
  const order = dun === 'yang' ? WALK : [...WALK].reverse();
  const palace = order[steps] as number;
  const taiyi = { palace: taiyiPalace(palace), year: inclusive(intoCircuit, 3) };

  const wenchang = tianmuOf(ju, dun);
  const jishen = jishenOf(ju, dun);
  const shiji = shijiOf(wenchang, jishen);

  const host = sideOf(wenchang, palace);
  const guest = sideOf(shiji, palace);

  return {
    taiyi,
    gods: TAIYI_GODS,
    yang: YANG_PALACES.includes(palace),
    wenchang,
    shiji,
    jishen,
    host,
    guest,
    patterns: findTaiyiPatterns({ palace, wenchang, shiji, host, guest }),
  };
}

/**
 * 天目 — 文昌, the 下目, which is the host's eye.
 *
 * 「置上元積年，以周紀法去之，不盡以元法七十二去之，又不盡以天目周法十八去
 * 之，不滿者命起武徳，順行十六神，遇隂徳、大武重留一，筭外即天目所在」.
 *
 * Sixteen gods and a period of eighteen, because two seats are held twice.
 * 卷一 says which two and why: 「乾坤二宫二時一移宫，乾為天門，坤為人門，
 * 吉凶之主，天目鬼星之使，至於此門施法奉令，故二時一移」 — the eye pauses at
 * the gate of heaven and the gate of man. The yin table counts from 呂申, the
 * seat facing 武德, and pauses at the other pair of corners, 太炅 and 和德,
 * which are the gate of wind and the gate of ghosts.
 */
function tianmuOf(ju: number, dun: 'yang' | 'yin'): TaiyiGod {
  return godAt(
    eyeSeat(inclusive(ju, 18), dun === 'yang' ? 11 : 3, dun === 'yang' ? YANG_HELD : YIN_HELD),
  );
}

/** The two corners each eye pauses at, which is why the period is eighteen. */
const YANG_HELD: readonly number[] = [14, 10];
const YIN_HELD: readonly number[] = [6, 2];

/**
 * Where a count of years leaves an eye on the ring of sixteen.
 *
 * 「遇隂徳、大武重留一」 — two seats take two years each, so sixteen seats
 * spend eighteen. Two eyes walk this: 天目 from 武德 or 呂申 by the year's own
 * count, and the eye of the 大遊 from 天道 by its own. They differ in where
 * they open and in nothing else, which is why the walk is written once — the
 * pause is the subtle part of this board, and two hand-kept copies of it are
 * two places for it to be corrected in one.
 */
function eyeSeat(count: number, start: number, held: readonly number[]): number {
  let remaining = count;
  for (let step = 0; step < 16; step += 1) {
    const seat = (start + step) % 16;
    remaining -= held.includes(seat) ? 2 : 1;
    if (remaining <= 0) return seat;
  }
  throw new Error(`the eye left the ring after ${count}`);
}

/**
 * 計神 — counted backwards from 寅, one branch a year.
 *
 * 「置積年，以紀法六十去之，不盡，命起寅宫，逆行十二辰，筭外即計神所在也」.
 * The yin table starts from 申, the branch facing it. Sixty and seventy-two
 * are both multiples of twelve, so the row of the 立成 gives the same answer
 * the accumulated count does.
 */
function jishenOf(ju: number, dun: 'yang' | 'yin'): Branch {
  const start = dun === 'yang' ? 2 : 8;
  return BRANCHES[(((start - (ju - 1)) % 12) + 12) % 12] as Branch;
}

/**
 * 始擊 — the 上目, which is the guest's eye.
 *
 * 卷二 states it as a turn of the ring rather than a count: 「詳何神為始擊，
 * 以計神加和徳宫，求文昌所臨宫，以艮為鬼門方求幽冥吉凶，故加和徳而計之」.
 * The 計神 is set on the seat of 和德 — the north-east corner, the gate of
 * ghosts — and the whole ring turns with it; 始擊 is the seat 文昌 has been
 * carried to.
 */
function shijiOf(wenchang: TaiyiGod, jishen: Branch): TaiyiGod {
  const shift = seatOfPalace(3) - (BRANCH_SEAT[jishen.index] as number);
  return godAt(seatOf(wenchang) + shift);
}

/**
 * 主算 and 客算, and the two generals each seats.
 *
 * 卷二 states the count in one sentence and then works it: 「各視天目所在宫而
 * 行筭，若天目在正宫則按本數，若天目間神則加一數而行筭，至太乙宫止矣」, and
 * 「假令太乙在九宫，大義為天目，後大義一筭，地主八筭，和徳三，髙叢四，計得
 * 十六」.
 *
 * So: open on the eye's own palace number if it stands at one, and on one if
 * it stands between two; then walk the ring clockwise adding the number of
 * every palace passed, and stop on reaching 太乙's. An eye already standing in
 * 太乙's palace has walked nowhere and its count is the opening term alone —
 * which is what 局 43 of the yang table prints, 地主 for 天目 with 太乙 in
 * 八宮 and 主算 八.
 *
 * The 大將 is the count with its tens dropped: 「若得十置一，若得二十四棄二十
 * 置四，餘皆以例而推之」 — and a count that is a whole number of tens gives
 * the tens, which is what 「若得十置一」 says and what 卷九's 客筭四十大將四宫
 * confirms.
 */
function sideOf(from: TaiyiGod, taiyi: number): TaiyiSide {
  const seat = seatOf(from);
  const own = SEATS[seat]?.palace;
  let count = own ?? 1;

  if (own !== taiyi) {
    for (let step = 1; step < 16; step += 1) {
      const passed = SEATS[(seat + step) % 16]?.palace;
      if (passed === undefined) continue;
      if (passed === taiyi) break;
      count += passed;
    }
  }

  const units = count % 10;
  const general = units === 0 ? count / 10 : units;
  const onRing = RING.indexOf(general);
  const assistant = onRing < 0 ? undefined : (RING[(onRing + 2) % 8] as number);

  return assistant === undefined
    ? { count, from, general: taiyiPalace(general) }
    : { count, from, general: taiyiPalace(general), assistant: taiyiPalace(assistant) };
}

/**
 * 八門直使 — one gate every thirty years.
 *
 * 卷四: 「置演紀上元甲子所求積年，與小遊同，以二百四十去之，不盡以三十約之
 * 為直門數，不盡筭外即直門所入年，命起開門，次休生，左行八門，周而復始」,
 * and 卷一 checks it against a date — 「假令今開元十二年甲子，即開門為直使,
 * 至三十一年甲午嵗即休門為直使」.
 */
function gateOf(xiaoyou: number): { gate: Gate; year: number } {
  const into = inclusive(xiaoyou, 240);
  return {
    gate: GATE_ORDER[Math.floor((into - 1) / 30)] as Gate,
    year: inclusive(into, 30),
  };
}

/**
 * 三基 — 君基, 臣基, 民基, on the twelve fiefs counted from 戌.
 *
 * Three periods over one ring: 卷五 gives the sovereign thirty years to a
 * fief, the minister three, and the people one. All three run on the 甲寅
 * count of 卷五's opening, which is the one count in this board the text
 * never checks against a date; the section says so.
 */
function sanjiOf(accumulated: number): TaiyiBoard['sanji'] {
  const into = inclusive(accumulated, 360);
  const intoMinister = inclusive(into, 36);
  return {
    // 「以三十除之為邦數，不滿為入邦以來年數，其邦數命起戍邦，順行十二邦」.
    jun: fief(Math.floor((into - 1) / 30), inclusive(into, 30), 30),
    // 「以小周法三十六除之…又以三約之為邦數」 — twelve fiefs, three years each.
    chen: fief(Math.floor((intoMinister - 1) / 3), inclusive(intoMinister, 3), 3),
    // 「又以小周十二去之…命起戌邦，順行十二邦，筭外」 — a fief a year, so the
    // remainder is the seat itself and the people are never more than one year
    // into anywhere. Which is why the period travels: this one is always 1/1.
    min: fief(inclusive(into, 12) - 1, 1, 1),
  };
}

/** A seat on the twelve fiefs, which start at 戌 and run forward. */
function fief(steps: number, year: number, period: number): TaiyiFief {
  return { branch: BRANCHES[(10 + steps) % 12] as Branch, year, period };
}

/**
 * 五福太乙 — forty-five years to a palace, two hundred and twenty-five to the
 * circuit, over the four corners and the centre.
 *
 * The text checks this one itself: 「今開元十二年甲子在遼東十一年也」, the
 * eleventh year in 黃始宮, which is what the count gives.
 */
function wufuOf(accumulated: number): TaiyiBoard['wufu'] {
  const into = inclusive(accumulated, 225);
  return {
    palace: TAIYI_WUFU_PALACES[Math.floor((into - 1) / 45)] as TaiyiWufuPalace,
    year: inclusive(into, 45),
  };
}

/**
 * 大遊太乙 — thirty-six years to a palace, from 七宮 rather than from 一宮.
 *
 * 「一考三十六年，十二年治天，十二年治地，十二年治人…二百八十八年一周」, and
 * the eye of this count starts from 天道 where the year's starts from 武德,
 * pausing at the same two corners.
 */
function dayouOf(accumulated: number): TaiyiBoard['dayou'] {
  const intoEra = inclusive(accumulated, 4320);
  const intoCircuit = inclusive(intoEra, 288);
  const steps = Math.floor((intoCircuit - 1) / 36);
  const from = WALK.indexOf(7);

  return {
    station: {
      palace: taiyiPalace(WALK[(from + steps) % 8] as number),
      year: inclusive(intoCircuit, 36),
    },
    // The same walk 天目 makes, opening on 天道 rather than on 武德 and
    // pausing at the same two corners. See `eyeSeat`.
    wenchang: godAt(eyeSeat(inclusive(inclusive(intoEra, 72), 18), 9, YANG_HELD)),
  };
}

/* ── The named conditions ─────────────────────────────────────────────── */

/**
 * The seven, each with what 卷三 says it **is** — where the chapter says it.
 *
 * `meaning` is the source's own characterisation, quoted, and it travels for
 * the reason `valence` travels: 掩 *is* 掩襲刼殺之義, named and weighed in one
 * line of one chapter, and it belongs to the configuration rather than to
 * anybody's situation. It is not this engine interpreting. Half of it was
 * already written down in the comment below this table, as the justification
 * for carrying the fortune; carrying the fortune and dropping the sentence that
 * earns it left a reader with 凶 and a glyph, which is an invitation to read the
 * character instead — and a model handed 囚 alone glosses it «a person in an
 * enclosure» with complete fluency.
 *
 * **What is quoted and what is not**, because the chapter gives both and they
 * are not the same kind of sentence. It states each condition three times over:
 * an 經曰 that gives the trigger, a 之義 or 者…也 that says what the shape is,
 * and then 若… and 嵗計遇之… clauses that say what will befall the realm. Only
 * the middle one is here. 「嵗計遇之，王綱失序，臣張君弱，宜修徳以禳之」 is a
 * dated omen with a remedy attached and is exactly the class this engine
 * declines; so is 「嵗計遇迫，人君慎之」. See the 太乙 section of
 * `docs/sources.md`, where both kinds are quoted side by side.
 *
 * Three judgements were made and are recorded rather than buried:
 *
 * - **迫 has no 之義.** What it has is a paired characterisation of the two
 *   distances — 「宫迫災㣲緩，辰迫災急疾」 — which says what each *is* rather
 *   than what will happen, and which the engine already distinguishes in
 *   `kind`. Carried on that ground.
 * - **關's line is 王希明's own**, not the 經's: 「王希明曰，闗之為義…」. The
 *   register says so; the transcript does not, because a name in every row
 *   would be provenance printed as content.
 * - **格 has a second clause**, 「若格太乙者，盜侮其君」, describing the
 *   sub-case where 太乙 itself is the body blocked. It is left out:
 *   `TaiyiPatternSubject` admits no 太乙, so the engine cannot tell that
 *   sub-case apart, and a sentence about it would attach to configurations
 *   that are not it.
 *
 * **對 has none, and the absence is the entry.** The chapter gives it a trigger
 * and then 「若下目相對之時，皆為大臣懐二心，君逐良將，兇奸生，下臣欺上」 — a
 * 若…皆為… list of events and nothing else. There is no sentence saying what 對
 * *is*, so it carries its fortune and stops. Where the sources say nothing, the
 * silence travels; inventing a line for the seventh so the table looked even is
 * the one thing this table must not do.
 */
const PATTERNS: Record<
  TaiyiPatternId,
  { hanzi: string; pinyin: string; valence: Valence; meaning?: string }
> = {
  yan: { hanzi: '掩', pinyin: 'yǎn', valence: VALENCE.xiong, meaning: '掩襲刼殺之義' },
  ji: {
    hanzi: '擊',
    pinyin: 'jī',
    valence: VALENCE.xiong,
    meaning: '所為撃者，臣凌君，卑凌尊，下凌上，僭也',
  },
  po: { hanzi: '迫', pinyin: 'pò', valence: VALENCE.xiong, meaning: '宫迫災㣲緩，辰迫災急疾' },
  qiu: { hanzi: '囚', pinyin: 'qiú', valence: VALENCE.xiong, meaning: '囚者，簒戮之義也' },
  guan: {
    hanzi: '關',
    pinyin: 'guān',
    valence: VALENCE.xiong,
    meaning: '闗之為義，但將相怕忌之事，不及於君也',
  },
  ge: { hanzi: '格', pinyin: 'gé', valence: VALENCE.xiong, meaning: '言政事上下格也' },
  // No 之義 in 卷三 — only an omen list. See above.
  dui: { hanzi: '對', pinyin: 'duì', valence: VALENCE.xiong },
};

export const TAIYI_PATTERN_IDS = Object.keys(PATTERNS) as readonly TaiyiPatternId[];

/** The name and the fortune of a condition, without waiting for one to occur. */
export function taiyiPatternName(id: TaiyiPatternId): {
  hanzi: string;
  pinyin: string;
  valence: Valence;
  meaning?: string;
} {
  return PATTERNS[id];
}

/**
 * Every condition 卷三 states as a relation between the bodies placed above.
 *
 * Nothing here is ranked and nothing is a reading. 掩 *is* 掩襲刼殺之義 and 囚
 * *is* 簒戮之義 — named and weighed in one line of one chapter — and a table
 * that carried the names without the weights would report half of what it
 * read. What happens next is the reader's, and it is where the received
 * doctrine goes somewhere this engine does not follow.
 */
function findTaiyiPatterns(input: {
  palace: number;
  wenchang: TaiyiGod;
  shiji: TaiyiGod;
  host: TaiyiSide;
  guest: TaiyiSide;
}): TaiyiPattern[] {
  const { palace, wenchang, shiji, host, guest } = input;
  const found: TaiyiPattern[] = [];
  const seat = seatOfPalace(palace);
  const facing = RING[(RING.indexOf(palace) + 4) % 8] as number;

  // A general that reduced to the centre stands off the ring of eight and
  // enters none of these conditions: every one of them is a distance measured
  // on that ring, and the centre is at no distance from anything.
  //
  // Kept as two sides rather than four bodies because 卷三 keeps them so: it
  // writes 主客 wherever both parties are meant — 主客大小四將 at 囚,
  // 主客大小將 at 關 — and names one party where one is meant, which is what
  // decides who enters 格.
  const hostGenerals: { subject: TaiyiPatternSubject; palace: number | undefined }[] = [
    { subject: 'hostGeneral', palace: onRing(host.general.number) },
    { subject: 'hostAssistant', palace: host.assistant?.number },
  ];
  const guestGenerals: { subject: TaiyiPatternSubject; palace: number | undefined }[] = [
    { subject: 'guestGeneral', palace: onRing(guest.general.number) },
    { subject: 'guestAssistant', palace: guest.assistant?.number },
  ];
  const generals = [...hostGenerals, ...guestGenerals];

  // The two eyes, seated once: every condition below is a distance from one of
  // them, and the ring does not turn between them.
  const lower = seatOf(wenchang);
  const upper = seatOf(shiji);

  // 掩 — 「始擊將臨太乙宫謂之掩」. The guest's eye standing where 太乙 stands.
  if (upper === seat) {
    found.push(mark('yan', 'shiji', { palace }));
  }

  // 擊 — 「客目在太乙前一辰為前擊，在太乙後一辰為後撃，在太乙前一宫為外宫
  // 擊，在太乙後一宫為内宫撃」. 前 is ahead of 太乙 on the ring.
  const struck = adjacency(upper, seat);
  if (struck) found.push(mark('ji', 'shiji', { kind: struck }));

  // 迫 — the same four distances, but 「上目無迫」: only the lower eye and the
  // four generals can press. 「宫迫災㣲緩，辰迫災急疾」.
  const pressed = adjacency(lower, seat);
  if (pressed) found.push(mark('po', 'wenchang', { kind: pressed }));
  for (const { subject, palace: at } of generals) {
    if (at === undefined) continue;
    const kind = adjacency(seatOfPalace(at), seat);
    if (kind) found.push(mark('po', subject, { kind }));
  }

  // 囚 — 「若文昌將并主客大小四將，俱與太乙同宫，總名曰囚」. Reported for each
  // body that stands there rather than only when all five do: 總名曰囚 reads as
  // the collective name for these standings, and the stricter reading of 俱
  // would suppress the condition at almost every year there has ever been. The
  // judgement is recorded in `docs/sources.md`, since it is one.
  if (lower === seat) found.push(mark('qiu', 'wenchang', { palace }));
  for (const { subject, palace: at } of generals) {
    if (at === palace) found.push(mark('qiu', subject, { palace }));
  }

  // 關 — 「主客大小將同宫數齊皆為闗」. A general of one party standing where a
  // general of the other does. It is the one condition here that is a meeting
  // rather than a distance, so both sides of it travel.
  for (const mine of hostGenerals) {
    for (const theirs of guestGenerals) {
      if (mine.palace === undefined || mine.palace !== theirs.palace) continue;
      found.push(mark('guan', mine.subject, { partner: theirs.subject, palace: mine.palace }));
    }
  }

  // 格 — 「客目大小將與太乙對宫為格」. The palace facing 太乙 across the board,
  // and **the guest's bodies alone**: the 客 qualifies the eye and the two
  // generals after it, which is how the chapter writes a one-party condition.
  // It says 主客 in the two places it means all four, three lines above and
  // three below, so a 格 marked on the host's generals would be this engine
  // stating a condition where its source names none.
  const facingSeat = seatOfPalace(facing);
  if (upper === facingSeat) {
    found.push(mark('ge', 'shiji', { palace: facing }));
  }
  for (const { subject, palace: at } of guestGenerals) {
    if (at === facing) found.push(mark('ge', subject, { palace: facing }));
  }

  // 對 — 「下目文昌將與太乙衝而相當者為對」. The lower eye alone, facing.
  if (lower === facingSeat) {
    found.push(mark('dui', 'wenchang', { palace: facing }));
  }

  return found;
}

/** A palace number, unless it is the centre, which is on no ring. */
function onRing(palace: number): number | undefined {
  return palace === 5 ? undefined : palace;
}

function mark(
  id: TaiyiPatternId,
  subject: TaiyiPatternSubject,
  rest: { partner?: TaiyiPatternSubject; palace?: number; kind?: TaiyiPattern['kind'] } = {},
): TaiyiPattern {
  return { id, ...PATTERNS[id], subject, ...rest };
}

/**
 * How close a seat stands to 太乙's, in the four distances 卷三 separates.
 *
 * One seat ahead or behind is 辰; two seats, which is the next palace, is 宮.
 * Anything further is nothing, and standing on 太乙 itself is 掩 or 囚 rather
 * than this.
 */
function adjacency(seat: number, taiyi: number): TaiyiPattern['kind'] | undefined {
  const gap = (((seat - taiyi) % 16) + 16) % 16;
  if (gap === 1) return 'qianchen';
  if (gap === 15) return 'houchen';
  if (gap === 2) return 'qiangong';
  if (gap === 14) return 'hougong';
  return undefined;
}

/**
 * A remainder counted the way this text counts: 筭外, one-based and inclusive.
 *
 * Every count here is of the form 「以X去之，不盡」, and the remainder names a
 * position rather than an offset — which is why a remainder of one is the
 * starting seat and a remainder of zero is the last. Getting this wrong moves
 * the whole board by one and nothing in the output complains.
 */
function inclusive(count: number, modulus: number): number {
  return ((((count - 1) % modulus) + modulus) % modulus) + 1;
}

/**
 * Which year a moment falls in, for a board that is a function of one.
 *
 * This is the whole of what `yearBoundary` decides, and it is why the option
 * exists: the board takes a year, and an instant in January is in a different
 * one depending on where the year was cut. It is answered from the year pillar
 * rather than from an ephemeris, because the pillar was already resolved
 * against exactly that boundary — under `lichun` the counted year is the civil
 * year when the two pillars agree and the one before it when they do not.
 *
 * `dongzhi` would move the boundary into December and `chunjie` onto a lunar
 * date that falls either side of 立春, and the arithmetic here with them —
 * which is why anything but `lichun` throws rather than quietly answering by
 * the wrong rule. The guard is stated as one refusal and not as a list of the
 * two: a boundary added to the option later would otherwise be a boundary
 * silently answered by this one until somebody remembered a third throw.
 */
export function taiyiYearOf(
  moment: { civilYear: number; sui: Ganzhi },
  options: TaiyiOptions,
): number {
  requireImplemented(TAIYI_PARAMETERS, options, 'yearBoundary');
  const { civilYear, sui } = moment;
  return sui.index === yearGanzhi(civilYear).index ? civilYear : civilYear - 1;
}

/**
 * The year being lived, for a caller holding an instant rather than a year.
 *
 * This is the ordinary case — nobody named a year — and it is a question about
 * the sky rather than about a calendar: the counted year is the one whose 立春
 * the instant is standing after, so the answer is the year of the last time the
 * Sun reached 315°. Which is what `taiyiYearOf` says through the pillar that
 * was resolved against that same crossing; this asks the crossing directly,
 * because the pillar arrives with a place, an hour and three other pillars
 * attached and none of them are on this board.
 *
 * **Every surface has to answer «now» with this and not with its own clock.**
 * A 年計 board is a function of the year and of nothing else, so a page reading
 * the browser's calendar year and a command reading the pillars would lay two
 * different boards for one instant every January — and the one served in
 * public would be cached that way for a week.
 *
 * The crossing is dated in UTC, and the zone is not a choice being made here:
 * 立春 falls on the third, fourth or fifth of February in every zone there is,
 * so no zone disagrees about which civil year contains it.
 */
export function taiyiYearAt(
  julianDayUT: number,
  options: TaiyiOptions,
  context: EphemerisContext,
): number {
  requireImplemented(TAIYI_PARAMETERS, options, 'yearBoundary');
  return fromJulianDay(lastCrossingBefore(315, julianDayUT, context), 'UTC').year;
}
