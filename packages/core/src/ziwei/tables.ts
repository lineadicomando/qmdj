import type { BranchId, StemId } from '../ganzhi.js';
import type { BrightnessId, BureauId, ZiweiStarId } from './stars.js';

/**
 * Where 紫微 sits, by bureau and by the day of the lunar month.
 *
 * The five grids of 卷二, read off the printed diagrams cell by cell. Each
 * row is thirty entries, day 1 first.
 *
 * **Two cells came off the page defective and are repaired here.** In
 * 木三局 the 寅 cell prints 初三 and 初九, where 初九 already stands in 辰
 * and 初五 stands nowhere; in 金四局 the 亥 cell prints 初一 alone and 三十
 * stands nowhere. Neither repair is chosen. The received arithmetic — take
 * q = ceil(day / bureau) and r = q × bureau − day, then count q + r palaces
 * from 寅 when r is even and q − r when it is odd — reproduces all 150 cells
 * of the printed grids and disagrees with the page at precisely the two
 * places the page is short; and **a second edition of the same work, set from
 * a different 古本, prints both cells whole**: 木三局's 寅 reads 初三 初五,
 * and 金四局's 亥 reads 初一 三十. A rule and a witness, agreeing where one
 * page failed. A test holds the table against the arithmetic. See
 * `docs/sources.md`.
 */
export const ZIWEI_BY_DAY: Record<BureauId, readonly BranchId[]> = {
  shuierju: [
    'chou', 'yin', 'yin', 'mao', 'mao', 'chen',
    'chen', 'si', 'si', 'wu', 'wu', 'wei',
    'wei', 'shen', 'shen', 'you', 'you', 'xu',
    'xu', 'hai', 'hai', 'zi', 'zi', 'chou',
    'chou', 'yin', 'yin', 'mao', 'mao', 'chen',
  ],
  musanju: [
    'chen', 'chou', 'yin', 'si', 'yin', 'mao',
    'wu', 'mao', 'chen', 'wei', 'chen', 'si',
    'shen', 'si', 'wu', 'you', 'wu', 'wei',
    'xu', 'wei', 'shen', 'hai', 'shen', 'you',
    'zi', 'you', 'xu', 'chou', 'xu', 'hai',
  ],
  jinsiju: [
    'hai', 'chen', 'chou', 'yin', 'zi', 'si',
    'yin', 'mao', 'chou', 'wu', 'mao', 'chen',
    'yin', 'wei', 'chen', 'si', 'mao', 'shen',
    'si', 'wu', 'chen', 'you', 'wu', 'wei',
    'si', 'xu', 'wei', 'shen', 'wu', 'hai',
  ],
  tuwuju: [
    'wu', 'hai', 'chen', 'chou', 'yin', 'wei',
    'zi', 'si', 'yin', 'mao', 'shen', 'chou',
    'wu', 'mao', 'chen', 'you', 'yin', 'wei',
    'chen', 'si', 'xu', 'mao', 'shen', 'si',
    'wu', 'hai', 'chen', 'you', 'wu', 'wei',
  ],
  huoliuju: [
    'you', 'wu', 'hai', 'chen', 'chou', 'yin',
    'xu', 'wei', 'zi', 'si', 'yin', 'mao',
    'hai', 'shen', 'chou', 'wu', 'mao', 'chen',
    'zi', 'you', 'yin', 'wei', 'chen', 'si',
    'chou', 'xu', 'mao', 'shen', 'si', 'wu',
  ],
};

/**
 * The seven grades, star by star and branch by branch: the table that closes
 * 卷二's placement layer.
 *
 * Twenty-one stars have a grade. Eighteen of them carry one in each of the
 * twelve branches; 祿存, 擎羊 and 陀羅 carry eight, which is not a gap but
 * the table knowing where those three can go — 祿存 follows the year stem
 * and so never reaches 辰戌丑未, and the other two flank it. That the counts
 * come out 12 and 8 without being told to is what says the grid was read
 * correctly, and the coarse per-star summaries of 卷三 agree with all three
 * eight-branch rows outright: 「擎羊 廟辰戌丑未 陷子午卯酉」,
 * 「陀羅 廟辰戌丑未 陷巳亥寅申」.
 */
export const BRIGHTNESS: Partial<Record<ZiweiStarId, Partial<Record<BranchId, BrightnessId>>>> = {
  ziwei: { zi: 'pinghe', chou: 'miao', yin: 'wang', mao: 'wang', chen: 'dedi', si: 'wang', wu: 'miao', wei: 'miao', shen: 'wang', you: 'wang', xu: 'dedi', hai: 'wang' },
  tianji: { zi: 'miao', chou: 'luoxian', yin: 'dedi', mao: 'wang', chen: 'liyi', si: 'pinghe', wu: 'miao', wei: 'luoxian', shen: 'dedi', you: 'wang', xu: 'liyi', hai: 'pinghe' },
  taiyang: { zi: 'luoxian', chou: 'budedi', yin: 'wang', mao: 'miao', chen: 'wang', si: 'wang', wu: 'wang', wei: 'dedi', shen: 'dedi', you: 'pinghe', xu: 'budedi', hai: 'luoxian' },
  wuqu: { zi: 'wang', chou: 'miao', yin: 'dedi', mao: 'liyi', chen: 'miao', si: 'pinghe', wu: 'wang', wei: 'miao', shen: 'dedi', you: 'liyi', xu: 'miao', hai: 'pinghe' },
  tiantong: { zi: 'wang', chou: 'budedi', yin: 'liyi', mao: 'pinghe', chen: 'pinghe', si: 'miao', wu: 'luoxian', wei: 'budedi', shen: 'wang', you: 'pinghe', xu: 'pinghe', hai: 'miao' },
  lianzhen: { zi: 'pinghe', chou: 'liyi', yin: 'miao', mao: 'pinghe', chen: 'liyi', si: 'luoxian', wu: 'pinghe', wei: 'liyi', shen: 'miao', you: 'pinghe', xu: 'liyi', hai: 'luoxian' },
  tianfu: { zi: 'miao', chou: 'miao', yin: 'miao', mao: 'dedi', chen: 'miao', si: 'dedi', wu: 'wang', wei: 'miao', shen: 'dedi', you: 'wang', xu: 'miao', hai: 'dedi' },
  taiyin: { zi: 'miao', chou: 'miao', yin: 'wang', mao: 'luoxian', chen: 'luoxian', si: 'luoxian', wu: 'budedi', wei: 'budedi', shen: 'liyi', you: 'wang', xu: 'wang', hai: 'miao' },
  tanlang: { zi: 'wang', chou: 'miao', yin: 'pinghe', mao: 'liyi', chen: 'miao', si: 'luoxian', wu: 'wang', wei: 'miao', shen: 'pinghe', you: 'liyi', xu: 'miao', hai: 'luoxian' },
  jumen: { zi: 'wang', chou: 'budedi', yin: 'miao', mao: 'miao', chen: 'luoxian', si: 'wang', wu: 'wang', wei: 'budedi', shen: 'miao', you: 'miao', xu: 'luoxian', hai: 'wang' },
  tianxiang: { zi: 'miao', chou: 'miao', yin: 'miao', mao: 'luoxian', chen: 'dedi', si: 'dedi', wu: 'miao', wei: 'dedi', shen: 'miao', you: 'luoxian', xu: 'dedi', hai: 'dedi' },
  tianliang: { zi: 'miao', chou: 'wang', yin: 'miao', mao: 'miao', chen: 'miao', si: 'luoxian', wu: 'miao', wei: 'wang', shen: 'luoxian', you: 'dedi', xu: 'miao', hai: 'luoxian' },
  qisha: { zi: 'wang', chou: 'miao', yin: 'miao', mao: 'wang', chen: 'miao', si: 'pinghe', wu: 'wang', wei: 'miao', shen: 'miao', you: 'wang', xu: 'miao', hai: 'pinghe' },
  pojun: { zi: 'miao', chou: 'wang', yin: 'dedi', mao: 'luoxian', chen: 'wang', si: 'pinghe', wu: 'miao', wei: 'wang', shen: 'dedi', you: 'luoxian', xu: 'wang', hai: 'pinghe' },
  wenchang: { zi: 'dedi', chou: 'miao', yin: 'luoxian', mao: 'liyi', chen: 'dedi', si: 'miao', wu: 'luoxian', wei: 'liyi', shen: 'dedi', you: 'miao', xu: 'luoxian', hai: 'liyi' },
  wenqu: { zi: 'dedi', chou: 'miao', yin: 'pinghe', mao: 'wang', chen: 'dedi', si: 'miao', wu: 'luoxian', wei: 'wang', shen: 'dedi', you: 'miao', xu: 'luoxian', hai: 'wang' },
  lucun: { zi: 'miao', yin: 'miao', mao: 'miao', si: 'miao', wu: 'miao', shen: 'miao', you: 'miao', hai: 'miao' },
  qingyang: { zi: 'luoxian', chou: 'miao', mao: 'luoxian', chen: 'miao', wu: 'luoxian', wei: 'miao', you: 'luoxian', xu: 'miao' },
  tuoluo: { chou: 'miao', yin: 'luoxian', chen: 'miao', si: 'luoxian', wei: 'miao', shen: 'luoxian', xu: 'miao', hai: 'luoxian' },
  huoxing: { zi: 'luoxian', chou: 'dedi', yin: 'miao', mao: 'liyi', chen: 'luoxian', si: 'dedi', wu: 'miao', wei: 'liyi', shen: 'luoxian', you: 'dedi', xu: 'miao', hai: 'liyi' },
  lingxing: { zi: 'luoxian', chou: 'dedi', yin: 'miao', mao: 'liyi', chen: 'luoxian', si: 'dedi', wu: 'miao', wei: 'liyi', shen: 'luoxian', you: 'dedi', xu: 'miao', hai: 'liyi' },
};

/**
 * 安祿權科忌四星變化訣 — the four transformations, by the stem of the birth
 * year, in the order 祿 權 科 忌.
 *
 * 「甲廉破武陽為伴，乙機梁紫月交侵，丙同機昌廉貞位，丁月同機巨門尋，
 * 戊貪月弼機為主，己武貪梁曲最平，庚日武陰同為首，辛巨陽曲昌至臨，
 * 壬梁紫府武宿是，癸破巨陰貪狼停。」
 *
 * Three of the ten lines are where the schools part, and this is the table
 * 《全書》 prints rather than the one a later lineage teaches: 戊 gives 科
 * to 右弼 where others give it to 太陽; 庚 gives 科 to 太陰 and 忌 to 天同
 * where others swap them or hand 科 to 天府; 壬 gives 科 to 天府 where
 * others give it to 左輔. 壬's reading is the one two editions of this work
 * agree on and an independent implementation contradicts, which is what a
 * book-against-the-moderns divergence looks like from inside.
 *
 * **庚 is the one line the two editions themselves disagree about.** This
 * text reads 庚日武**陰同**為首 — 科 to 太陰, 忌 to 天同 — where the second
 * edition reads 庚日武**同陰**為首, swapping the two. That transposition is
 * the famous split at 庚, and it is carried here as a variant rather than
 * settled: the reading kept is the one an independent implementation also
 * computes, and the other is written down in `docs/sources.md` so nobody has
 * to rediscover that the line has two forms.
 */
export const SIHUA: Record<StemId, readonly [ZiweiStarId, ZiweiStarId, ZiweiStarId, ZiweiStarId]> = {
  jia: ['lianzhen', 'pojun', 'wuqu', 'taiyang'],
  yi: ['tianji', 'tianliang', 'ziwei', 'taiyin'],
  bing: ['tiantong', 'tianji', 'wenchang', 'lianzhen'],
  ding: ['taiyin', 'tiantong', 'tianji', 'jumen'],
  wu: ['tanlang', 'taiyin', 'youbi', 'tianji'],
  ji: ['wuqu', 'tanlang', 'tianliang', 'wenqu'],
  geng: ['taiyang', 'wuqu', 'taiyin', 'tiantong'],
  xin: ['jumen', 'taiyang', 'wenqu', 'wenchang'],
  ren: ['tianliang', 'ziwei', 'tianfu', 'wuqu'],
  gui: ['pojun', 'jumen', 'taiyin', 'tanlang'],
};

/** 起五行寅例 — the stem that stands on 寅 for each year stem (五虎遁). */
export const YIN_STEM: Record<StemId, StemId> = {
  jia: 'bing', ji: 'bing',
  yi: 'wu', geng: 'wu',
  bing: 'geng', xin: 'geng',
  ding: 'ren', ren: 'ren',
  wu: 'jia', gui: 'jia',
};

/** 安祿存星訣 — 「甲生祿存在寅宮，乙生在卯丙戊巳，丁己祿存停午方，庚祿居申辛祿酉，壬祿在亥癸祿子」. */
export const LUCUN: Record<StemId, BranchId> = {
  jia: 'yin', yi: 'mao', bing: 'si', wu: 'si', ding: 'wu',
  ji: 'wu', geng: 'shen', xin: 'you', ren: 'hai', gui: 'zi',
};

/**
 * 安天魁天鉞訣 — 「甲戊庚牛羊，乙己鼠猴鄉，六辛逢馬虎，壬癸兔蛇藏，
 * 丙丁豬雞位」, the pair in the order 魁 then 鉞.
 *
 * **Two lines here were read the other way round first, and the correction
 * is a witness's and not a preference.** The Wikisource text prints
 * 丙丁豬**狗**位 — 狗 is 戌 — and 六辛逢**虎馬**, which puts 魁 on 寅 and 鉞
 * on 午. Both were carried, and both were recorded as this book parting from
 * the modern tables. A second edition of the same work, edited from a
 * different 古本 and transparent about where it emends, prints 豬**雞** (酉)
 * and 逢**馬虎** (魁 午, 鉞 寅) with no emendation noted at either line — and
 * an independent implementation computes the same two. Two readings against
 * one, from sources independent of each other, and the one is of the lineage
 * 《全書》's Republican lithograph belongs to, which is documented as
 * carrying several errors to the page.
 *
 * Recorded as a judgement rather than left to the code, because it is one:
 * what was weighed is which witness is likelier corrupt at a single character
 * of a mnemonic verse, and 狗 for 雞 is exactly the kind of slip such a verse
 * attracts. See `docs/sources.md`.
 */
export const KUIYUE: Record<StemId, readonly [BranchId, BranchId]> = {
  jia: ['chou', 'wei'], wu: ['chou', 'wei'], geng: ['chou', 'wei'],
  yi: ['zi', 'shen'], ji: ['zi', 'shen'],
  xin: ['wu', 'yin'],
  ren: ['mao', 'si'], gui: ['mao', 'si'],
  bing: ['hai', 'you'], ding: ['hai', 'you'],
};

/** 安截路空亡訣 — a pair of adjacent branches, by the stem of the birth year. */
export const JIELU: Record<StemId, readonly [BranchId, BranchId]> = {
  jia: ['shen', 'you'], ji: ['shen', 'you'],
  yi: ['wu', 'wei'], geng: ['wu', 'wei'],
  bing: ['chen', 'si'], xin: ['chen', 'si'],
  ding: ['yin', 'mao'], ren: ['yin', 'mao'],
  wu: ['zi', 'chou'], gui: ['zi', 'chou'],
};

/**
 * 安長生 — where the ring of twelve begins, by bureau.
 *
 * 「火局命寅起長生。木局命亥起長生。水局命申起長生。金局命巳起長生。
 * 土局命申起長生。」 Water and earth begin together, which is the tradition's
 * own doubling and not a slip.
 */
export const CHANGSHENG_START: Record<BureauId, BranchId> = {
  huoliuju: 'yin',
  musanju: 'hai',
  shuierju: 'shen',
  jinsiju: 'si',
  tuwuju: 'shen',
};

/** 安小限訣 — where age one sits, by the branch of the birth year. */
export const XIAOXIAN_START: Record<BranchId, BranchId> = {
  yin: 'chen', wu: 'chen', xu: 'chen',
  shen: 'xu', zi: 'xu', chen: 'xu',
  si: 'wei', you: 'wei', chou: 'wei',
  hai: 'chou', mao: 'chou', wei: 'chou',
};

/** 安天馬星訣 — the year branch's triplicity sends the horse to one of four. */
export const TIANMA: Record<BranchId, BranchId> = {
  yin: 'shen', wu: 'shen', xu: 'shen',
  shen: 'yin', zi: 'yin', chen: 'yin',
  si: 'hai', you: 'hai', chou: 'hai',
  hai: 'si', mao: 'si', wei: 'si',
};

/**
 * 安火鈴二星訣 — 「寅午戌人丑卯方，申子辰人寅戌揚，巳酉丑人卯戌位，
 * 亥卯未人酉戌房」, 火星 first and 鈴星 second.
 *
 * **The birth hour does not enter.** Every widespread modern practice counts
 * on from these seats by the hour; **neither edition of this book says so**,
 * and a rule this engine cannot cite is a rule it does not have. That is what
 * the `huoling` option names, and why its second value is refused rather than
 * quietly made the default.
 *
 * The second edition prints 寅午戌人**午**卯方 where this one prints 丑卯,
 * and the 丑 is kept: 午 already stands as a triplicity head two characters
 * earlier, the received seats are 丑 and 卯, and an independent implementation
 * counts from those. Recorded so the variant is not met twice.
 */
export const HUOLING: Record<BranchId, readonly [BranchId, BranchId]> = {
  yin: ['chou', 'mao'], wu: ['chou', 'mao'], xu: ['chou', 'mao'],
  shen: ['yin', 'xu'], zi: ['yin', 'xu'], chen: ['yin', 'xu'],
  si: ['mao', 'xu'], you: ['mao', 'xu'], chou: ['mao', 'xu'],
  hai: ['you', 'xu'], mao: ['you', 'xu'], wei: ['you', 'xu'],
};

/** 安命主 — the master of the life, by the branch the 命宮 fell on. */
export const LIFE_MASTER: Record<BranchId, ZiweiStarId> = {
  zi: 'tanlang',
  chou: 'jumen', hai: 'jumen',
  yin: 'lucun', xu: 'lucun',
  mao: 'wenqu', you: 'wenqu',
  chen: 'lianzhen', shen: 'lianzhen',
  si: 'wuqu', wei: 'wuqu',
  wu: 'pojun',
};

/**
 * 安身主 — the master of the body, by the branch of the birth year.
 *
 * 「子午人火鈴星，丑未人天相星，寅申人天梁星，卯酉人天同星，辰戌人文昌星，
 * 巳亥人天機星」, the first line printed 火玲 for 火鈴.
 *
 * **The first line is the one ambiguity in this table, and it is resolved
 * toward 火星 for both branches.** Every other line names one star for a pair
 * of opposite branches, in a six-character slot; this one fills the same slot
 * with 火鈴, which is the name of no star. Two readings are open: one star
 * misprinted, or two stars compressed — 火 to 子 and 鈴 to 午, which the
 * sibling rule above makes tempting, since 安命主 leaves 子 and 午 standing
 * alone where it pairs the other ten.
 *
 * **Both editions print the same defective line**, so the ambiguity is the
 * work's and not one copyist's — which removes the last hope that a second
 * witness would simply resolve it.
 *
 * The compressed reading was taken first and is withdrawn. It rested on the
 * shape of the line and on nothing else — no worked instance in this book
 * carries a 身主, so the induction had no instances to be induced *from*,
 * which is what parts it from 太乙's 參將 rather than likening it. Against it
 * stands a runnable reference (`iztro`) that agrees with this table in eleven
 * branches of twelve and gives 火星 at 午. One reading with an argument and
 * no witness, one with a witness and no argument: the witness carries it, and
 * the other reading is written down in `docs/sources.md` rather than lost, so
 * whoever finds an edition that prints the line whole can overturn this in a
 * line.
 */
export const BODY_MASTER: Record<BranchId, ZiweiStarId> = {
  zi: 'huoxing', wu: 'huoxing',
  chou: 'tianxiang', wei: 'tianxiang',
  yin: 'tianliang', shen: 'tianliang',
  mao: 'tiantong', you: 'tiantong',
  chen: 'wenchang', xu: 'wenchang',
  si: 'tianji', hai: 'tianji',
};
