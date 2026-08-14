import { sunCrossing, type EphemerisContext } from './ephemeris.js';
import { nayin } from './bazi/nayin.js';
import {
  dayGanzhi,
  monthGanzhi,
  yearGanzhi,
  BRANCHES,
  STEMS,
  type Branch,
  type Ganzhi,
  type Stem,
} from './ganzhi.js';
import { PALACES, type Palace } from './dunjia/palaces.js';
import { VALENCE, type Valence } from './dunjia/patterns.js';
import { calendarDayNumber, CALENDAR_ZONE } from './lunar.js';
import { fromJulianDay } from './time.js';
import { jieAt, SOLAR_TERMS, type SolarTermDefinition } from './solar-terms.js';

/**
 * 曆注 — what a printed almanac puts under a date.
 *
 * The layer dunjia was always read beside. A chart chooses an hour and a
 * direction; the almanac is the page that choice was weighed against, and a
 * reader of one who cannot see the other is missing the half the tradition
 * printed first.
 *
 * **It is not a board.** Nothing is laid, nothing is asked, and the same page
 * belongs to everybody who opens it on the same day — which is why it takes no
 * options, sits in no consultation, and enters no prompt. See `PLAN.md` § 4
 * phase 15.
 *
 * **And it stops where the rest of this engine stops.** The 協紀 hands every
 * one of these down inside its 宜忌 — this day suits, this day forbids — and a
 * 宜忌 is advice: ordering days, dating an act, telling somebody what to do.
 * What travels here is the name of the day's officer and the arithmetic that
 * put it there. What each officer is *for* stays in the book.
 */

export type OfficerId =
  | 'jian' | 'chu' | 'man' | 'ping'
  | 'ding' | 'zhi' | 'po' | 'wei'
  | 'cheng' | 'shou' | 'kai' | 'bi';

export interface Officer {
  id: OfficerId;
  hanzi: string;
  pinyin: string;
}

/**
 * 建除十二神, in the order they run.
 *
 * The order is the rule: 建 opens on the day whose branch is the month's, and
 * the other eleven follow it round the twelve branches. 《協紀辨方書》卷四,
 * quoting the 厯書: 「厯家以建除滿平定執破危成收開閉凡十二日周而復始……其法從
 * 月建上起建，與斗杓所指相應。如正月建寅則寅日起建，順行十二辰是也」.
 */
export const OFFICERS: readonly Officer[] = [
  { id: 'jian', hanzi: '建', pinyin: 'jiàn' },
  { id: 'chu', hanzi: '除', pinyin: 'chú' },
  { id: 'man', hanzi: '滿', pinyin: 'mǎn' },
  { id: 'ping', hanzi: '平', pinyin: 'píng' },
  { id: 'ding', hanzi: '定', pinyin: 'dìng' },
  { id: 'zhi', hanzi: '執', pinyin: 'zhí' },
  { id: 'po', hanzi: '破', pinyin: 'pò' },
  { id: 'wei', hanzi: '危', pinyin: 'wēi' },
  { id: 'cheng', hanzi: '成', pinyin: 'chéng' },
  { id: 'shou', hanzi: '收', pinyin: 'shōu' },
  { id: 'kai', hanzi: '開', pinyin: 'kāi' },
  { id: 'bi', hanzi: '閉', pinyin: 'bì' },
];


export type LodgeId =
  | 'jiao' | 'kang' | 'di' | 'fang' | 'xin' | 'wei3' | 'ji'
  | 'dou' | 'niu' | 'nv' | 'xu' | 'wei1' | 'shi' | 'bi13'
  | 'kui' | 'lou' | 'wei4' | 'mao' | 'bi18' | 'zi' | 'shen'
  | 'jing' | 'gui' | 'liu' | 'xing' | 'zhang' | 'yi' | 'zhen';

export interface Lodge {
  id: LodgeId;
  hanzi: string;
  pinyin: string;
  /** The one of the 七政 the lodge carries, which is what locks it to a weekday. */
  planet: { hanzi: string; pinyin: string };
}

/**
 * The 七政, in the order the lodges take them.
 *
 * Seven, against twenty-eight lodges, which is four weeks — so the planet a
 * lodge carries is fixed and the tradition wrote the check into the names.
 * See `LODGES` for what that buys.
 */
const PLANETS: readonly { hanzi: string; pinyin: string }[] = [
  { hanzi: '木', pinyin: 'mù' },
  { hanzi: '金', pinyin: 'jīn' },
  { hanzi: '土', pinyin: 'tǔ' },
  { hanzi: '日', pinyin: 'rì' },
  { hanzi: '月', pinyin: 'yuè' },
  { hanzi: '火', pinyin: 'huǒ' },
  { hanzi: '水', pinyin: 'shuǐ' },
];

/**
 * 二十八宿, in the order they hold the days.
 *
 * **Three identifiers are not bare pinyin, and both reasons are the rule.**
 * 尾 wěi, 危 wēi and 胃 wèi drop to one syllable, so they keep their tone
 * numbers, as 驚門 and 景門 do. 壁 and 畢 are both bì — the same syllable in
 * the same tone — where a tone number has nothing left to say, so they take
 * the one thing the cycle already orders them by: their place in it, `bi13`
 * and `bi18`.
 *
 * **No 禽象.** The animal each lodge is given — 鬼金羊, 角木蛟 — is not here.
 * 《協紀辨方書》卷一 calls the images 「近代方有之」 and then explains how they
 * were built, by taking the four cardinal lodges as rat, hare, horse and cock
 * and fitting the rest around them by resemblance: 附會, the source's word.
 * A construction a source dates late and shows the workings of is not a
 * transmission, and it is left out as 三奇得使 was.
 */
export const LODGES: readonly Lodge[] = (
  [
    ['jiao', '角', 'jiǎo'], ['kang', '亢', 'kàng'], ['di', '氐', 'dī'],
    ['fang', '房', 'fáng'], ['xin', '心', 'xīn'], ['wei3', '尾', 'wěi'],
    ['ji', '箕', 'jī'], ['dou', '斗', 'dǒu'], ['niu', '牛', 'niú'],
    ['nv', '女', 'nǚ'], ['xu', '虛', 'xū'], ['wei1', '危', 'wēi'],
    ['shi', '室', 'shì'], ['bi13', '壁', 'bì'], ['kui', '奎', 'kuí'],
    ['lou', '婁', 'lóu'], ['wei4', '胃', 'wèi'], ['mao', '昴', 'mǎo'],
    ['bi18', '畢', 'bì'], ['zi', '觜', 'zī'], ['shen', '參', 'shēn'],
    ['jing', '井', 'jǐng'], ['gui', '鬼', 'guǐ'], ['liu', '柳', 'liǔ'],
    ['xing', '星', 'xīng'], ['zhang', '張', 'zhāng'], ['yi', '翼', 'yì'],
    ['zhen', '軫', 'zhěn'],
  ] as const
).map(([id, hanzi, pinyin], index) => ({
  id: id as LodgeId,
  hanzi,
  pinyin,
  planet: PLANETS[index % 7] as { hanzi: string; pinyin: string },
}));

/**
 * Where the count is anchored, as an offset on the day number itself.
 *
 * The whole content of this block is this one number: the cycle is a count of
 * days and nothing about a date enters it. `(dayNumber + 11) % 28` puts 井 on
 * 2026-01-01, which is what the reference gives.
 *
 * **And the epoch is over-determined, which is why one reference is enough
 * for it.** Twenty-eight is four sevens, so each lodge keeps a fixed weekday
 * for ever, and the tradition wrote that into the names: the planet in the
 * full name 鬼金羊 is 金, and every 鬼 day is a Friday. An epoch wrong by any
 * amount that is not a multiple of seven breaks every one of the
 * twenty-eight names at once. A test walks four hundred days and checks it.
 *
 * The count crosses a 節 unbroken, where 建除 doubles. The two blocks
 * disagree about what a boundary is and both are right: one counts days, the
 * other reads a month.
 */
const LODGE_EPOCH_OFFSET = 11;

/** The lodge holding a day, by the day number alone. */
export function lodgeOn(dayNumber: number): Lodge {
  return LODGES[(dayNumber + LODGE_EPOCH_OFFSET) % 28] as Lodge;
}


export type DayGodId =
  | 'siming' | 'gouchen' | 'qinglong' | 'mingtang'
  | 'tianxing' | 'zhuque' | 'jingui' | 'tiande'
  | 'baihu' | 'yutang' | 'tianlao' | 'xuanwu';

export interface DayGod {
  id: DayGodId;
  hanzi: string;
  pinyin: string;
  /**
   * 黃道 or 黑道, which the source says is only another name for this.
   *
   * 《協紀辨方書》卷七 refuses to let the pair mean more than it does:
   * 「黄道為日行躔度，無只以子午卯酉寅未為黄道之理；若黑道之説葢不見經傳……
   * 然則此所為黄黑道云者，亦即吉凶之别名而非有深義決矣」 — the yellow path
   * and the black path are a second name for 吉 and 凶 and nothing further.
   * So the valence is carried and the two words are not: naming a day 黃道
   * would be this engine repeating a term its own source empties.
   *
   * It travels for the reason `Pattern`'s does — named and weighed in one
   * line of one text, six and six, an attribute of the god and never of
   * anybody's situation. What the 神樞經 hangs on it in the same passage —
   * 「所值之日皆宜興衆務」, 「皆不可興土功營屋舍移徙逺行嫁娶出軍」 — is 宜忌
   * and does not travel.
   */
  valence: Valence;
}

/**
 * 十二神, seated on the branches they *are*.
 *
 * 《協紀辨方書》卷七 gives this list after rejecting the two accounts it
 * inherited — 曹震圭's derivation from 納甲, which it calls 荒唐不經, and
 * 邵泰衢's attempt to pair the twelve with 建除, which it says cannot work
 * because six are yang and six are yin. What it puts in their place is
 * 「今按司命即是子，勾陳即是丑，青龍即是寅，明堂即是卯，天刑即是辰，朱雀即是
 * 巳，金匱即是午，天德即是未，白虎即是申，玉堂即是酉，天牢即是戌，元武即是
 * 亥」 — each god simply *is* a branch — 「其法以天罡加於建上」.
 *
 * The 四庫 text writes 元武, avoiding the 玄 of the reigning emperor's name.
 * The god is 玄武, as the 六壬 board already has it.
 */
const DAY_GODS: readonly DayGod[] = (
  [
    ['siming', '司命', 'sīmìng', 'ji'], ['gouchen', '勾陳', 'gōuchén', 'xiong'],
    ['qinglong', '青龍', 'qīnglóng', 'ji'], ['mingtang', '明堂', 'míngtáng', 'ji'],
    ['tianxing', '天刑', 'tiānxíng', 'xiong'], ['zhuque', '朱雀', 'zhūquè', 'xiong'],
    ['jingui', '金匱', 'jīnguì', 'ji'], ['tiande', '天德', 'tiāndé', 'ji'],
    ['baihu', '白虎', 'báihǔ', 'xiong'], ['yutang', '玉堂', 'yùtáng', 'ji'],
    ['tianlao', '天牢', 'tiānláo', 'xiong'], ['xuanwu', '玄武', 'xuánwǔ', 'xiong'],
  ] as const
).map(([id, hanzi, pinyin, valence]) => ({
  id: id as DayGodId,
  hanzi,
  pinyin,
  valence: VALENCE[valence] as Valence,
}));

/**
 * The god a day stands under, from the month's branch and the day's.
 *
 * 「其法以天罡加於建上」. The 天罡 is the 厭對, the branch facing the 月厭, so
 * it is `(6 − month)`; laying it on the 建 turns the seated twelve by
 * `month − 天罡`, and a day branch then reads whichever god that turn has
 * brought to it. Two multiplications of the month branch is the whole of it,
 * and the source's own worked months fall out — 卯 and 酉 stand still, which
 * it calls 伏吟, and 子 and 午 turn half way, which it calls 反吟.
 */
export function dayGodOf(monthBranch: Branch, dayBranch: Branch): DayGod {
  const seat = (((dayBranch.index - 2 * monthBranch.index + 6) % 12) + 12) % 12;
  return DAY_GODS[seat] as DayGod;
}

export const DAY_GOD_LIST: readonly DayGod[] = DAY_GODS;


export type YearGodId =
  | 'taisui' | 'suipo' | 'dajiangjun' | 'taiyin' | 'huangfan' | 'baowei'
  | 'sangmen' | 'diaoke' | 'baihu' | 'bingfu' | 'sifu' | 'dasha'
  | 'jiesha' | 'zaisha' | 'suisha'
  | 'dahao' | 'xiaohao' | 'suizhide'
  | 'suide' | 'suidehe'
  | 'zoushu' | 'boshi' | 'lishi' | 'canshi' | 'pobaiwugui'
  | 'jinshen';

/**
 * Where a 年神 stands — and it is not always a branch.
 *
 * Most of 卷三 seats its gods on the twelve branches, but 歲德 and its 合 are
 * given as **stems**: 「甲年在己，乙年在乙，丙年在辛……」. The two are reported
 * as what the source says they are and are not converted into one another. A
 * 二十四山 compass does seat eight of the ten stems, but it seats neither 戊
 * nor 己 — and 己 is in that very table — so any mapping to a direction would
 * be this file inventing the part the source left out.
 *
 * The third kind is a **trigram**: 破敗五鬼 is given by 厯例 as 「甲壬年在巽，
 * 乙癸年在艮，丙年在坤，丁年在震，戊年在離，己年在坎，庚年在兑，辛年在乾」,
 * and the four corner gods stand on 乾坤艮巽. A trigram is reported as the
 * palace it is, which is the one place this layer touches dunjia's own
 * vocabulary — and it touches it because the source's word *is* 艮, not
 * «northeast».
 */
export type YearGodSeat =
  | { kind: 'branch'; branch: Branch }
  | { kind: 'stem'; stem: Stem }
  | { kind: 'trigram'; trigram: Palace }
  /** Several at once. Only 金神, which is not one bearing but a set of them. */
  | { kind: 'branches'; branches: readonly Branch[] };

export interface YearGod {
  id: YearGodId;
  hanzi: string;
  pinyin: string;
  /** Where it stands. A bearing or a stem, never a date. */
  seat: YearGodSeat;
}

/**
 * The 年神 that stand on a direction, from the branch of the year.
 *
 * **Six, and the number is a boundary rather than a set.** 《協紀辨方書》卷三
 * carries some two dozen; these are the ones whose position it states outright
 * and completely, in the entry itself, without leaning on a god defined
 * elsewhere — each was read one at a time and each of the source's own
 * enumerations is asserted in the tests. The rest of 卷三 has not been read
 * yet and is not guessed at. See `docs/sources.md`.
 *
 * **災煞 is the one here without an entry of its own**, and it is carried
 * anyway: 卷三 names it only inside the 考原 discussion of the 三煞, but that
 * discussion states the rule for all three at once and 李鼎祚's enumeration
 * pins it. Splitting a group the source states as a group would be worse than
 * the asymmetry, which is written down instead.
 *
 * **Seats are shared, on purpose, and the source states the principle twice.**
 * 太陰 and 弔客 both stand on 歲後二辰, and the 總論 raises exactly that
 * objection — 「然太隂之方又為弔客者何歟」 — before answering it: 「隂陽之義，
 * 美惡不嫌同位，各從其所用耳」. The 歲枝德 entry says it again in general terms,
 * 「美惡不嫌同位，吉凶不嫌同名」, of a branch that is 死符 and 小耗 and 歲枝德
 * at once; and 大耗 stands where 歲破 does. Good and ill are not embarrassed to
 * share a bearing, each being read for what it is read for. A table that
 * quietly deduplicated them would be reporting a tidiness nobody transmitted,
 * and which of the names applies is a question about somebody's undertaking —
 * which is the part this engine does not answer.
 *
 * **What is left behind is most of what the source says about them.** Nearly
 * every entry is 宜忌 — 「其地不可興造移徙嫁娶逺行」, 「所理之地不可興修」 —
 * and none of that travels. What remains is a name and a bearing, which is
 * what the engine says of a gate or a star and for the same reason.
 */
const YEAR_GODS: readonly {
  id: YearGodId;
  hanzi: string;
  pinyin: string;
  /** By the year's branch, unless `byStem`. */
  seat: (year: number) => number;
  /** Read from the year's stem rather than its branch. */
  byStem?: true;
  /** The seat is a trigram, given as a palace number. */
  byTrigram?: true;
}[] = [
  // 太歲 stands on the year's own branch.
  { id: 'taisui', hanzi: '太歲', pinyin: 'tàisuì', seat: (y) => y },
  // 「歲破者，太歲所衝之辰也……子年在午，順行十二辰是也」.
  { id: 'suipo', hanzi: '歲破', pinyin: 'suìpò', seat: (y) => (y + 6) % 12 },
  // 「常居四正之位而從歲君之後：寅夘辰歲在東方則居正北，巳午未歲在南方則居正
  // 東，申酉戌歲在西方則居正南，亥子丑歲在北方則居正西也」.
  { id: 'dajiangjun', hanzi: '大將軍', pinyin: 'dàjiāngjūn', seat: (y) => [9, 9, 0, 0, 0, 3, 3, 3, 6, 6, 6, 9][y] as number },
  // 「常居太歲後二辰……子年則在戌，丑年則在亥，寅年則在子是也」.
  { id: 'taiyin', hanzi: '太陰', pinyin: 'tàiyīn', seat: (y) => (y + 10) % 12 },
  // 「常居三合墓辰……寅午戌歲在戌，申子辰歲在辰，亥夘未歲在未，巳酉丑歲在丑」.
  { id: 'huangfan', hanzi: '黃幡', pinyin: 'huángfān', seat: (y) => [4, 1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7][y] as number },
  // 「常居黄幡對衝」.
  { id: 'baowei', hanzi: '豹尾', pinyin: 'bàowěi', seat: (y) => ([4, 1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7][y] as number + 6) % 12 },
  // 「喪門者……常居歲前二辰」. The 總論 adds that this seat is also 朱雀's:
  // 「喪門之位又為朱雀，則以前朱雀後𤣥武，而以太歲前二位為朱雀耳」.
  { id: 'sangmen', hanzi: '喪門', pinyin: 'sāngmén', seat: (y) => (y + 2) % 12 },
  // 「弔客者……常居歲後二辰」 — the same seat as 太陰, which the source raises
  // as a question and answers rather than tidies away. See `yearGodsOf`.
  { id: 'diaoke', hanzi: '弔客', pinyin: 'diàokè', seat: (y) => (y + 10) % 12 },
  // 「白虎者歲中凶神也，常居歲後四辰」.
  { id: 'baihu', hanzi: '白虎', pinyin: 'báihǔ', seat: (y) => (y + 8) % 12 },
  // 「病符主災病，常居歲後一辰」.
  { id: 'bingfu', hanzi: '病符', pinyin: 'bìngfú', seat: (y) => (y + 11) % 12 },
  // 「死符者……常居歲前五辰」.
  { id: 'sifu', hanzi: '死符', pinyin: 'sǐfú', seat: (y) => (y + 5) % 12 },
  // 「大煞子年在子，丑年在酉，寅年在午，夘年在夘，辰年又在子，如是逆行四正」,
  // and the reason given with it: 「申子辰三合為水，水旺於子」 and so round —
  // the cardinal the year's own triad prospers in.
  { id: 'dasha', hanzi: '大煞', pinyin: 'dàshà', seat: (y) => [0, 9, 6, 3][y % 4] as number },
  // The 三煞, and they are one rule rather than three. 考原:「劫煞災煞歲煞是為
  // 三煞……三合五行絕胎養之位也」 — the 絕, the 胎 and the 養 of the phase the
  // year's own triad belongs to. 李鼎祚 enumerates the last of them and so
  // checks the other two: 「寅午戌煞在丑，巳酉丑煞在辰，申子辰煞在未，亥夘未
  // 煞在戌」, which is also why 歲煞「常居四季」 — 丑辰未戌 are the four 季.
  { id: 'jiesha', hanzi: '劫煞', pinyin: 'jiéshà', seat: (y) => [5, 2, 11, 8][y % 4] as number },
  { id: 'zaisha', hanzi: '災煞', pinyin: 'zāishà', seat: (y) => [6, 3, 0, 9][y % 4] as number },
  { id: 'suisha', hanzi: '歲煞', pinyin: 'suìshà', seat: (y) => [7, 4, 1, 10][y % 4] as number },
  // 「太歲所衝為大耗」 — the seat 歲破 already holds, and the 小耗 entry leans
  // on it: 「小耗常居大耗後一辰」.
  { id: 'dahao', hanzi: '大耗', pinyin: 'dàhào', seat: (y) => (y + 6) % 12 },
  // 「小耗常居大耗後一辰」, and again from the other side, 「舊歲破為小耗」 —
  // last year's 歲破, which is this year's 歲前五辰. The two statements meet.
  { id: 'xiaohao', hanzi: '小耗', pinyin: 'xiǎohào', seat: (y) => (y + 5) % 12 },
  // 「歲枝德者，謂甲既在子則巳上必己，己甲之合也，其所合之神所居之枝則亦必吉
  // 矣」 — the branch where 歲德's 五合 partner stands. The entry then says
  // where that lands: 「其辰又為死符，又為小耗」, which is 歲前五辰.
  { id: 'suizhide', hanzi: '歲枝德', pinyin: 'suìzhīdé', seat: (y) => (y + 5) % 12 },
  // The two that stand on a stem, and on the year's stem rather than its
  // branch. Each is enumerated whole, in a different quotation of the same
  // entry: 廣聖厯 「甲德在甲，乙德在庚，丙德在丙，丁德在壬，戊德在戊，己德在
  // 甲，庚德在庚，辛德在丙，壬德在壬，癸德在戊」, and 考原 「歲德合者，歲德五
  // 合之干是也：甲年在己，乙年在乙，丙年在辛……」. The second is the 五合 of
  // the first, which is a third statement of the same fact.
  { id: 'suide', hanzi: '歲德', pinyin: 'suìdé', byStem: true, seat: (g) => [0, 6, 2, 8, 4, 0, 6, 2, 8, 4][g] as number },
  { id: 'suidehe', hanzi: '歲德合', pinyin: 'suìdéhé', byStem: true, seat: (g) => [5, 1, 7, 3, 9, 5, 1, 7, 3, 9][g] as number },
  // 破敗五鬼, from 厯例 and enumerated whole: 「甲壬年在巽，乙癸年在艮，丙年在
  // 坤，丁年在震，戊年在離，己年在坎，庚年在兑，辛年在乾」. Ten stems, ten
  // answers, nothing derived. Palace numbers: 巽4 艮8 坤2 震3 離9 坎1 兌7 乾6.
  { id: 'pobaiwugui', hanzi: '破敗五鬼', pinyin: 'pòbàiwǔguǐ', byStem: true, byTrigram: true, seat: (g) => [4, 8, 2, 3, 9, 1, 7, 6, 4, 8][g] as number },
  // The four that stand on the corners, by the year's quarter. 奏書
  // 「常居近歲後維方……初起於乾」; 博士 「常與奏書對衝，如奏書在艮，博士在坤
  // 也」; 力士 「在太歲之前隅」; 蠶室 「與力士對衝」. See `yearGodsOf` for the
  // enumeration that checks the four against each other.
  { id: 'zoushu', hanzi: '奏書', pinyin: 'zòushū', byTrigram: true, seat: (y) => cornerOf(y, 0) },
  { id: 'boshi', hanzi: '博士', pinyin: 'bóshì', byTrigram: true, seat: (y) => cornerOf(y, 2) },
  { id: 'lishi', hanzi: '力士', pinyin: 'lìshì', byTrigram: true, seat: (y) => cornerOf(y, 1) },
  { id: 'canshi', hanzi: '蠶室', pinyin: 'cánshì', byTrigram: true, seat: (y) => cornerOf(y, 3) },
  // The one that holds several bearings at once. See `jinshenSeats`.
  { id: 'jinshen', hanzi: '金神', pinyin: 'jīnshén', byStem: true, seat: (g) => g },
];

/**
 * 金神, which is not one bearing but several, and is found by running the
 * calendar rather than by looking anything up.
 *
 * 「以年幹五虎元厯之逢庚辛及納音金之位者是也。假如甲己之年起丙寅順行，得庚午
 * 辛未，又壬申癸酉納音為劍鋒金，故甲己年午未申酉為金神也」 — lay the twelve
 * month pillars of the year by 五虎遁, and take the branch of every month whose
 * **stem is 庚 or 辛**, and of every month whose **納音 is metal**. Both are
 * machinery this engine already has and has already checked; nothing here is a
 * table. The source's one worked year comes back 午未申酉, and a test says so.
 */
function jinshenSeats(yearStem: number): readonly Branch[] {
  const seats: Branch[] = [];
  for (let step = 0; step < 12; step += 1) {
    // The year's months open at 寅, which is where 五虎遁 starts.
    const monthBranch = (2 + step) % 12;
    const pillar = monthGanzhi(yearStem, monthBranch);
    const metalStem = pillar.stem.hanzi === '庚' || pillar.stem.hanzi === '辛';
    if (metalStem || nayin(pillar).element === 'jin') {
      seats.push(BRANCHES[monthBranch] as Branch);
    }
  }
  return seats;
}

/**
 * The four corners a year's quarter puts its gods on, as palace numbers.
 *
 * The quarters run 亥子丑 · 寅夘辰 · 巳午未 · 申酉戌, and the corner immediately
 * behind each is 乾 · 艮 · 巽 · 坤 — which is what 「常居近歲後維方」 and
 * 「初起於乾」 say between them. `step` walks a quarter turn at a time: 0 is
 * that corner, 1 the one ahead (力士 「在太歲之前隅」), 2 the one opposite
 * (博士 「常與奏書對衝」), 3 the remaining one (蠶室 「與力士對衝」).
 */
function cornerOf(yearBranch: number, step: number): number {
  const CORNERS = [6, 8, 4, 2]; // 乾 · 艮 · 巽 · 坤
  const quarter = Math.floor(((yearBranch + 1) % 12) / 3);
  return CORNERS[(quarter + step) % 4] as number;
}

export const YEAR_GOD_IDS: readonly YearGodId[] = YEAR_GODS.map((g) => g.id);

/** Where each of them stands, for a year. */
export function yearGodsOf(year: Ganzhi): readonly YearGod[] {
  return YEAR_GODS.map(({ id, hanzi, pinyin, seat, byStem, byTrigram }) => ({
    id,
    hanzi,
    pinyin,
    seat: id === 'jinshen'
      ? ({ kind: 'branches', branches: jinshenSeats(year.stem.index) } as const)
      : byTrigram
      ? ({
          kind: 'trigram',
          trigram: PALACES.find(
            (p) => p.number === seat(byStem ? year.stem.index : year.branch.index),
          ) as Palace,
        } as const)
      : byStem
        ? ({ kind: 'stem', stem: STEMS[seat(year.stem.index)] as Stem } as const)
        : ({ kind: 'branch', branch: BRANCHES[seat(year.branch.index)] as Branch } as const),
  }));
}


export type MonthGodId = 'tiande' | 'tiandehe' | 'yuede' | 'yuedehe';

export interface MonthGod {
  id: MonthGodId;
  hanzi: string;
  pinyin: string;
  /**
   * Where it sits for this month, or `undefined` where it has none.
   *
   * Only 天德合 is ever absent: 「四仲之月天徳居四維，故無合也」 — in the four
   * 仲 months the 天德 stands on a corner trigram, and a trigram has no 五合.
   */
  seat?: YearGodSeat;
  /**
   * Whether **this day** carries it, which is the seat and the day agreeing.
   *
   * A god seated on a stem is carried by the day of that stem: 「所值之日」.
   * One seated on a trigram is a bearing only — 「所理之方」 — and no day can
   * carry it, which is why the four 仲 months have a 天德 and no 天德日.
   */
  onDay: boolean;
}

/**
 * The four virtues, by the branch of the month.
 *
 * Each is enumerated whole, and each pair checks the other: 月德合 and 天德合
 * are the 五合 of their own 德, which the source says outright — 「月徳合者，
 * 即各以月徳所合之干為之」 — so the four tables are really two, stated twice.
 *
 * 歴例 for 月德: 「正五九月在丙，二六十月在甲，三七十一月在壬，四八十二月在
 * 庚」, and 曹震圭 gives the reason, 「寅午戌三合為火，以丙為徳」 — the yang
 * stem of the phase the month's own triad belongs to.
 *
 * 堪輿經 for 天德: 「正月丁，二月坤，三月壬，四月辛，五月乾，六月甲，七月癸，
 * 八月艮，九月丙，十月乙，十一月巽，十二月庚」 — eight stems and, in the four
 * 仲 months, the four corner trigrams.
 */
const MONTH_GODS: readonly { id: MonthGodId; hanzi: string; pinyin: string }[] = [
  { id: 'tiande', hanzi: '天德', pinyin: 'tiāndé' },
  { id: 'tiandehe', hanzi: '天德合', pinyin: 'tiāndéhé' },
  { id: 'yuede', hanzi: '月德', pinyin: 'yuèdé' },
  { id: 'yuedehe', hanzi: '月德合', pinyin: 'yuèdéhé' },
];

/** 天德 by month branch, 子 first. A stem index, or a palace number negated. */
const TIANDE: readonly number[] = [-4, 6, 3, -2, 8, 7, -6, 0, 9, -8, 2, 1];

/** 月德 by month branch, 子 first: the yang stem of the triad's phase. */
const YUEDE: readonly number[] = [8, 6, 2, 0, 8, 6, 2, 0, 8, 6, 2, 0];

/** The 五合 partner of a stem: 甲己, 乙庚, 丙辛, 丁壬, 戊癸. */
const heOf = (stem: number): number => (stem + 5) % 10;

/** The four virtues for a month, and whether this day carries each. */
export function monthGodsOf(monthBranch: Branch, day: Ganzhi): readonly MonthGod[] {
  const tiande = TIANDE[monthBranch.index] as number;
  const yuede = YUEDE[monthBranch.index] as number;

  const stemSeat = (index: number): YearGodSeat => ({
    kind: 'stem',
    stem: STEMS[index] as Stem,
  });
  const seats: Record<MonthGodId, YearGodSeat | undefined> = {
    tiande:
      tiande >= 0
        ? stemSeat(tiande)
        : { kind: 'trigram', trigram: PALACES.find((p) => p.number === -tiande) as Palace },
    tiandehe: tiande >= 0 ? stemSeat(heOf(tiande)) : undefined,
    yuede: stemSeat(yuede),
    yuedehe: stemSeat(heOf(yuede)),
  };

  return MONTH_GODS.map(({ id, hanzi, pinyin }) => {
    const seat = seats[id];
    return {
      id,
      hanzi,
      pinyin,
      ...(seat ? { seat } : {}),
      onDay: seat?.kind === 'stem' && seat.stem.index === day.stem.index,
    };
  });
}

export interface Almanac {
  /** The officer holding the day. */
  officer: Officer;
  /** The day the page describes, reckoned on the calendar's own meridian. */
  day: Ganzhi;
  /** The branch of the solar month the count opened from. */
  monthBranch: Branch;
  /** The 節 that opened that month. */
  jie: SolarTermDefinition;
  /** 二十八宿值日 — the lodge holding the day, a count and never a date. */
  lodge: Lodge;
  /** 十二神 — the god the day stands under, by 天罡加建. */
  god: DayGod;
  /**
   * The year the page belongs to, turned at 立春 on the date.
   *
   * The chart's `yearBoundary` never reaches here, as `dayBoundary` does not:
   * an almanac turns its year at 立春 and gives the whole of that day to the
   * new year, exactly as it gives the whole of a 節's day to the new month.
   */
  year: Ganzhi;
  /** The 年神 that stand on a bearing, from the branch of that year. */
  yearGods: readonly YearGod[];
  /** The four virtues of the month, and whether this day carries each. */
  monthGods: readonly MonthGod[];
  /**
   * True on the second of the two days a 交節 gives the same officer.
   *
   * 《協紀辨方書》卷四: 「每月交節則疊兩值日」. It is not a second rule and
   * nothing here special-cases it — the month branch advances on the same day
   * the day branch does, so the difference between them, which is the officer,
   * stands still. The flag is reported because a reader who sees 執 twice
   * should be able to tell a doubling from a mistake.
   */
  doubled: boolean;
}

/**
 * The officer a day carries, from the month's branch and the day's.
 *
 * The whole rule, and it is subtraction: 建 stands where the two branches
 * meet and the count runs forward from there.
 */
export function officerOf(monthBranch: Branch, dayBranch: Branch): Officer {
  const step = (dayBranch.index - monthBranch.index + 12) % 12;
  return OFFICERS[step] as Officer;
}

/**
 * The almanac's page for an instant.
 *
 * It takes an instant and no options, which is the whole of what makes it a
 * page rather than a chart: `dayBoundary` and `trueSolarTime` move the hour
 * and the day a chart is read at, and they do not move what an almanac
 * printed.
 */
export function almanacAt(julianDayUT: number, context: EphemerisContext): Almanac {
  const dayNumber = calendarDayNumber(julianDayUT);
  const jie = monthOpeningOn(julianDayUT, dayNumber, context);
  const day = dayGanzhi(dayNumber);
  const monthBranch = BRANCHES[jie.term.monthBranch as number] as Branch;
  const year = yearGanzhi(sexagenaryYearOn(julianDayUT, dayNumber, context));

  return {
    officer: officerOf(monthBranch, day.branch),
    lodge: lodgeOn(dayNumber),
    god: dayGodOf(monthBranch, day.branch),
    day,
    monthBranch,
    jie: jie.term,
    doubled: calendarDayNumber(jie.julianDayUT) === dayNumber,
    year,
    yearGods: yearGodsOf(year),
    monthGods: monthGodsOf(monthBranch, day),
  };
}

/**
 * The 節 whose month this **day** belongs to, which is not always the one the
 * instant belongs to.
 *
 * This is the difference between the almanac and the pillars, and it is the
 * whole of it. A month pillar turns at the instant the Sun reaches the 節; a
 * page turns on the date, so the whole of the 節's day belongs to the new
 * month — a chart cast at nine in the morning of a 節 that strikes at eight in
 * the evening carries the old month pillar and the new month's officer, and
 * both are right about different questions.
 *
 * That the doubling falls out of this rather than being written into it is the
 * reason to compute it this way: 「每月交節則疊兩值日」 is a description of
 * what the day grain does, not an extra clause to remember.
 */
function monthOpeningOn(
  julianDayUT: number,
  dayNumber: number,
  context: EphemerisContext,
): { term: SolarTermDefinition; julianDayUT: number } {
  const current = jieAt(julianDayUT, context);
  if (calendarDayNumber(current.julianDayUT) === dayNumber) return current;

  // The instant may still be sitting in the hours of a 節's own day before the
  // Sun reaches it. Only the next one can be on this date; anything later is a
  // month away.
  const nextLongitude = (current.term.longitude + 30) % 360;
  const definition = SOLAR_TERMS.find(
    (term) => term.longitude === nextLongitude,
  ) as SolarTermDefinition;
  const next = sunCrossing(definition.longitude, current.julianDayUT + 1, context);

  return calendarDayNumber(next) === dayNumber
    ? { term: definition, julianDayUT: next }
    : current;
}

/**
 * Which sexagenary year the **day** falls in, turned at 立春.
 *
 * The same day grain as the month, one term up: the whole of 立春's date
 * belongs to the year it opens, so a page never disagrees with itself about
 * which year printed it. `resolveMoment` asks the same question of the
 * *instant*, and under `yearBoundary: 'chunjie'` it asks a different question
 * entirely — neither reaches here, because a page carries no options.
 */
function sexagenaryYearOn(
  julianDayUT: number,
  dayNumber: number,
  context: EphemerisContext,
): number {
  // 立春 is the Sun at 315°. The crossing solver searches forward, so this
  // starts a little over a year back and takes the last one whose own date has
  // arrived.
  let latest = sunCrossing(315, julianDayUT - 400, context);
  for (;;) {
    const next = sunCrossing(315, latest + 1, context);
    if (calendarDayNumber(next) > dayNumber) break;
    latest = next;
  }
  return fromJulianDay(latest, CALENDAR_ZONE).year;
}
