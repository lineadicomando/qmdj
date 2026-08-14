import { sunCrossing, type EphemerisContext } from './ephemeris.js';
import { dayGanzhi, BRANCHES, type Branch, type Ganzhi } from './ganzhi.js';
import { VALENCE, type Valence } from './dunjia/patterns.js';
import { calendarDayNumber } from './lunar.js';
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

  return {
    officer: officerOf(monthBranch, day.branch),
    lodge: lodgeOn(dayNumber),
    god: dayGodOf(monthBranch, day.branch),
    day,
    monthBranch,
    jie: jie.term,
    doubled: calendarDayNumber(jie.julianDayUT) === dayNumber,
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
