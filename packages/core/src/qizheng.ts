import { LODGES, type Lodge, type LodgeId } from './almanac.js';
import {
  bodyPosition,
  starLongitude,
  type EphemerisBody,
  type EphemerisContext,
} from './ephemeris.js';
import { BRANCHES, type Branch } from './ganzhi.js';
import { QIZHENG_PARAMETERS, requireImplemented } from './parameters.js';
import type { Element } from './types.js';

/**
 * 七政四餘 — the seven governors and the four remainders, on the sky itself.
 *
 * The third board here and the second of the 命 arts, and the first whose
 * quantities are read off an ephemeris rather than off a cycle. Where dunjia
 * turns nine palaces by rule and 六壬 twelve by rule, this one asks where the
 * bodies actually are and says which 宿 and which 宮 that falls in. Nothing
 * about it is a count: move the instant a minute and the numbers move.
 *
 * **The frame is the whole of the difficulty, and it is settled here rather
 * than assumed.** A longitude is arithmetic; the 宿 it falls in is a
 * commitment to where the twenty-eight begin, and the tables that state that
 * disagree because they were measured in different centuries. So the
 * boundaries are not tabulated at all: a 宿 begins at its 距星, and
 * `data/sefstars.txt` holds the twenty-eight stars for sweph to place at the
 * instant asked for. The 曆 remain as declared values of `xiudu`, for
 * whenever one of their tables arrives with an epoch that can be cited.
 *
 * **What it carries, and what it declines.** The twelve 人事宮 — 命宮, 財帛,
 * 兄弟 and the rest — are laid, and they nearly were not: they follow from the
 * 命宮 by counting, and no source consulted states which way the counting runs
 * in terms another could be held against. They are here on over-determination
 * rather than on two agreeing sources, which is the weakest ground anything on
 * this board stands on, and the check is written out at `HOUSES` for a reader
 * to run. What is declined is the step after. A palace is labelled here and
 * never read: the geometry is the 命宮, the twelve 次 the bodies sit in and the
 * name each palace takes, and the doctrine that reads a life off them is the
 * reader's, as it is everywhere else here. See `docs/history/` phase 16 and the
 * 七政四餘 section of `docs/sources.md`.
 */

/** The divergences of this board. See `docs/parameters.md`. */
export interface QizhengOptions {
  /**
   * Where the twenty-eight 宿 begin.
   *
   * `juxing` is the only value implemented and takes the boundaries from the
   * 距星 themselves, placed at the instant of the chart with precession and
   * proper motion in them. It commits to no epoch, which is what a table
   * cannot avoid doing: the 黃道宿度 of 《時憲曆》 and of 《授時曆》 differ
   * mostly because they were measured centuries apart, and either shipped as
   * a constant would be right for one century and quietly wrong for the rest.
   *
   * `shixian` and `shoushi` are the two tables, declared so that one can
   * arrive without breaking a shared link, and refused until one does.
   */
  xiudu: 'juxing' | 'shixian' | 'shoushi';

  /**
   * Whether 紫氣 enters, and by which transmission.
   *
   * `off` is the default and the output then says it carries 三餘, which is
   * the honest count. The refusal is not for want of a rule: the rate is
   * settled at one circuit in twenty-eight years, and 《張果星宗》 卷八 and
   * 《三辰通載》 both give a procedure with its epoch constant. It is that
   * 紫氣 has no referent, so nothing weighs the constant. Calibrate that same
   * table at 1300 and run it forward: its 羅睺 is still good to 0.25° in 2026
   * and its 月孛 is 69° out, because one 大數 is 0.01 % off and the other
   * 0.20 %. 紫氣's could be either and the only test is a position in the sky
   * to check against. The error is unbounded in principle rather than merely
   * unknown, which no better source can mend. See `docs/sources.md` § 四餘.
   */
  ziqi: 'off' | 'yinianyisu';

  /**
   * Which node bears the name 羅睺, the other taking 計都.
   *
   * `descending` is the default because it is what the art does, not what the
   * calendar office concluded. 羅睺 began as the ascending node, moved to the
   * descending one in the late Tang, and was moved back by 湯若望's reform for
   * the 時憲曆 — and the 星命家 did not follow, keeping 羅睺 at the descending
   * node as 火餘 and 計都 at the ascending one as 土餘. A chart cast the other
   * way is not wrong; it is a calendar's chart rather than an astrologer's,
   * and the two names swap places on it.
   */
  luohou: 'descending' | 'ascending';

  /**
   * How the 命宮 is found.
   *
   * `yuejiang` is 立命 by 加時, which the texts state: the hour of the birth
   * is laid on the palace the Sun stands in and the palaces are counted
   * forward to 卯. It yields a palace and no degree, which is what the method
   * has to give. `ascendant` is the degree actually rising, which modern
   * practice uses and which needs the latitude; it is declared and refused.
   */
  minggong: 'yuejiang' | 'ascendant';

  /**
   * Where the twelve 宮 begin.
   *
   * `zhongqi` cuts them at the 中氣, which is to say every thirtieth degree of
   * the Sun's own longitude — 春分 opens 降婁 at 戌 and the rest follow. It is
   * the 時憲曆's 太陽過宮 and what every modern 排盤 lays.
   *
   * `ci` would take the older definition, where a 次 is a stretch of 宿度 —
   * 星紀 from 斗十二度 to 女七度 — and so rides the stars rather than the
   * seasons. The two were the same thing once and precession has parted them
   * by weeks. It is declared and refused: the stretches have to come from a
   * table, and that is the same table `xiudu` is still waiting for.
   */
  gong: 'zhongqi' | 'ci';
}

export const DEFAULT_QIZHENG_OPTIONS: QizhengOptions = Object.freeze({
  xiudu: 'juxing',
  ziqi: 'off',
  luohou: 'descending',
  minggong: 'yuejiang',
  gong: 'zhongqi',
});

export type GovernorId =
  | 'taiyang' | 'taiyin' | 'shuixing' | 'jinxing' | 'huoxing' | 'muxing' | 'tuxing';

export type RemainderId = 'luohou' | 'jidu' | 'yuebei' | 'ziqi';

export type QizhengBodyId = GovernorId | RemainderId;

/**
 * One of the eleven, named and weighed.
 *
 * `element` is absent for the Sun and the Moon and present for everything
 * else, which is the tradition's own arrangement rather than a gap: the five
 * planets *are* the five phases and the four remainders were each given one
 * — 羅睺 火餘, 計都 土餘, 月孛 水餘, 紫氣 木餘 — while 太陽 and 太陰 stand
 * outside that count as 陰陽.
 */
export interface QizhengBody {
  id: QizhengBodyId;
  hanzi: string;
  pinyin: string;
  element?: Element;
}

const GOVERNORS: readonly (QizhengBody & { body: EphemerisBody })[] = [
  { id: 'taiyang', hanzi: '太陽', pinyin: 'tàiyáng', body: 'sun' },
  { id: 'taiyin', hanzi: '太陰', pinyin: 'tàiyīn', body: 'moon' },
  { id: 'shuixing', hanzi: '水星', pinyin: 'shuǐxīng', element: 'shui', body: 'mercury' },
  { id: 'jinxing', hanzi: '金星', pinyin: 'jīnxīng', element: 'jin', body: 'venus' },
  { id: 'huoxing', hanzi: '火星', pinyin: 'huǒxīng', element: 'huo', body: 'mars' },
  { id: 'muxing', hanzi: '木星', pinyin: 'mùxīng', element: 'mu', body: 'jupiter' },
  { id: 'tuxing', hanzi: '土星', pinyin: 'tǔxīng', element: 'tu', body: 'saturn' },
];

const REMAINDERS: Record<RemainderId, QizhengBody> = {
  luohou: { id: 'luohou', hanzi: '羅睺', pinyin: 'luóhóu', element: 'huo' },
  jidu: { id: 'jidu', hanzi: '計都', pinyin: 'jìdū', element: 'tu' },
  yuebei: { id: 'yuebei', hanzi: '月孛', pinyin: 'yuèbèi', element: 'shui' },
  ziqi: { id: 'ziqi', hanzi: '紫氣', pinyin: 'zǐqì', element: 'mu' },
};

/**
 * The eleven, in the order a board lists them: the seven, then the four.
 *
 * 紫氣 is in this list and absent from every board, which is not a
 * contradiction: the name is part of the vocabulary the surfaces have to
 * carry — a catalog has to be able to say it, a reader has to be able to find
 * out why it is missing — while `ziqi: 'off'` decides whether anything is
 * ever placed under it.
 */
export const QIZHENG_BODIES: readonly QizhengBody[] = [
  ...GOVERNORS.map(({ body, ...named }) => named),
  REMAINDERS.luohou,
  REMAINDERS.jidu,
  REMAINDERS.yuebei,
  REMAINDERS.ziqi,
];

/** Which way a body runs, from the sign of its daily motion. */
export type MotionId = 'shun' | 'ni';

export const MOTIONS: Record<MotionId, { hanzi: string; pinyin: string }> = {
  shun: { hanzi: '順', pinyin: 'shùn' },
  ni: { hanzi: '逆', pinyin: 'nì' },
};

export type CiId =
  | 'xuanxiao' | 'xingji' | 'ximu' | 'dahuo' | 'shouxing' | 'chunwei'
  | 'chunhuo' | 'chunshou' | 'shichen' | 'daliang' | 'jianglou' | 'juzi';

/** One of the twelve 次, which is a palace of the ring under its own name. */
export interface Ci {
  id: CiId;
  hanzi: string;
  pinyin: string;
  branch: Branch;
}

/**
 * The twelve 次, indexed by the branch of the palace they name.
 *
 * They run backwards against the branches, because they are named for where
 * the Sun *is* and the Sun crosses them in the order the seasons do: 春分
 * opens 降婁 at 戌, 穀雨 大梁 at 酉, and so down to 娵訾 at 亥. The same
 * backwards ring is what seats the 月將 of a 六壬 board, and for the same
 * reason — see `yuejiangOf` in `liuren.ts`, which reads it off the 中氣 where
 * this reads it off the Sun. Where the two agree it is one fact twice.
 */
export const CI: readonly Ci[] = (
  [
    ['xuanxiao', '玄枵', 'xuánxiāo'], ['xingji', '星紀', 'xīngjì'],
    ['ximu', '析木', 'xīmù'], ['dahuo', '大火', 'dàhuǒ'],
    ['shouxing', '壽星', 'shòuxīng'], ['chunwei', '鶉尾', 'chúnwěi'],
    ['chunhuo', '鶉火', 'chúnhuǒ'], ['chunshou', '鶉首', 'chúnshǒu'],
    ['shichen', '實沈', 'shíchén'], ['daliang', '大梁', 'dàliáng'],
    ['jianglou', '降婁', 'jiànglóu'], ['juzi', '娵訾', 'jūzī'],
  ] as const
).map(([id, hanzi, pinyin], index) => ({
  id: id as CiId,
  hanzi,
  pinyin,
  branch: BRANCHES[index] as Branch,
}));

/**
 * The 距星 of each 宿, by the nomenclature name Swiss Ephemeris knows it as.
 *
 * The list is 《儀象考成》's, which matters at exactly one place and matters
 * there completely: 觜 and 參 are λ Ori and ζ Ori, not the φ¹ Ori and δ Ori
 * of the older tables. Precession had driven the width of 觜 through zero, so
 * the two came out in the wrong order and the needle of the twenty-eight took
 * its neighbour's width; the Qing office restored the transmitted order in
 * 1752 by moving the two distances. See `data/sefstars.txt`, which carries
 * the stars and the same note, and the test that walks the ring.
 */
const DETERMINATIVE_STARS: Record<LodgeId, string> = {
  jiao: 'alVir', kang: 'kaVir', di: 'al-2Lib', fang: 'piSco',
  xin: 'siSco', wei3: 'mu-1Sco', ji: 'gaSgr', dou: 'phSgr',
  niu: 'beCap', nv: 'epAqr', xu: 'beAqr', wei1: 'alAqr',
  shi: 'alPeg', bi13: 'gaPeg', kui: 'zeAnd', lou: 'beAri',
  wei4: '35Ari', mao: '17Tau', bi18: 'epTau', zi: 'laOri',
  shen: 'zeOri', jing: 'muGem', gui: 'thCnc', liu: 'deHya',
  xing: 'alHya', zhang: 'up-1Hya', yi: 'alCrt', zhen: 'gaCrv',
};

export type HouseId =
  | 'ming' | 'caibo' | 'xiongdi' | 'tianzhai' | 'nannv' | 'nupu'
  | 'fuqi' | 'jie' | 'qianyi' | 'guanlu' | 'fude' | 'xiangmao';

/** One of the twelve 人事宮, which is a palace under what it is asked about. */
export interface House {
  id: HouseId;
  hanzi: string;
  pinyin: string;
}

/**
 * The twelve 人事宮, from the 命宮 in the order they are numbered.
 *
 * **They ascend against the branches, which is forwards through the sky**, and
 * that direction was the last thing this board settled. No source consulted
 * states it in terms that could be held against another, so it is carried the
 * way the 值日宿 epoch is carried: by over-determination, with the check
 * written down so a reader can run it.
 *
 * The check is the names. These twelve are the Hellenistic houses in the
 * Hellenistic order, position for position — wealth second, siblings third,
 * home fourth, children fifth, servants sixth, spouse seventh, illness
 * eighth, travel ninth, office tenth — and they are *not* 紫微斗數's twelve,
 * which run 命 兄弟 夫妻 子女 財帛 and are the list one would fear a Chinese
 * ring of branches had been contaminated by. Lay them the other way round and
 * 田宅, the home, lands on the tenth place and 官祿, the office, on the
 * fourth: ten of the twelve come out wrong, and only 命 and 夫妻 survive,
 * because those two are the axis a reversal turns about. One direction fits
 * ten names and the other fits none.
 *
 * What is transmitted independently, and agrees, is the 運限: the limits walk
 * from 命宮 to 相貌 to 福德 to 官祿, which is the numbering descending. A
 * source that says the limits run 順行 「西洋占星逆行」 is therefore saying
 * that the *numbering* climbs the other way — zodiacally — which is this.
 *
 * See the 七政四餘 section of `docs/sources.md`, and `test/qizheng.test.ts`,
 * where the reversal is asserted to break exactly the ten it should.
 */
export const HOUSES: readonly House[] = [
  { id: 'ming', hanzi: '命宮', pinyin: 'mìnggōng' },
  { id: 'caibo', hanzi: '財帛宮', pinyin: 'cáibógōng' },
  { id: 'xiongdi', hanzi: '兄弟宮', pinyin: 'xiōngdìgōng' },
  { id: 'tianzhai', hanzi: '田宅宮', pinyin: 'tiánzháigōng' },
  { id: 'nannv', hanzi: '男女宮', pinyin: 'nánnǚgōng' },
  { id: 'nupu', hanzi: '奴僕宮', pinyin: 'núpúgōng' },
  { id: 'fuqi', hanzi: '夫妻宮', pinyin: 'fūqīgōng' },
  // 疾厄 is the one name here where what the identifier drops is not a tone
  // but the syllable break: toneless, jí-è is `jie`, which reads as one
  // syllable and is not. The reading is where it comes back — and it comes
  // back without the apostrophe standard pinyin would use, because the
  // convention this project already keeps does the same work: one tone mark
  // to a syllable, so `jíè` is two and `jié` would be one. See
  // `docs/sources.md`.
  { id: 'jie', hanzi: '疾厄宮', pinyin: 'jíègōng' },
  { id: 'qianyi', hanzi: '遷移宮', pinyin: 'qiānyígōng' },
  { id: 'guanlu', hanzi: '官祿宮', pinyin: 'guānlùgōng' },
  { id: 'fude', hanzi: '福德宮', pinyin: 'fúdégōng' },
  { id: 'xiangmao', hanzi: '相貌宮', pinyin: 'xiàngmàogōng' },
];

/** A 人事宮 and the palace of the ring it came to stand on. */
export interface HouseSeat {
  house: House;
  palace: Branch;
  ci: Ci;
}

/** Where something stands, said in both of the frames the board uses. */
export interface Standing {
  /** Apparent geocentric ecliptic longitude, degrees from the equinox. */
  longitude: number;
  /** The 宿 it falls in. */
  lodge: Lodge;
  /** 入宿度 — degrees past that 宿's 距星. */
  lodgeDegree: number;
  /** The palace of the ring, as a branch. */
  palace: Branch;
  /** That palace under its own name. */
  ci: Ci;
  /** 宮度 — degrees into the palace, 0 to 30. */
  palaceDegree: number;
}

/** One of the eleven, placed. */
export interface Placement extends Standing {
  body: QizhengBody;
  /** Degrees a day of ecliptic longitude, signed. */
  speed: number;
  /** 順 or 逆, which is the sign of `speed` and nothing more. */
  motion: MotionId;
}

export interface QizhengBoard {
  /** The instant the sky was asked about, as a Julian Day in UT. */
  julianDay: number;
  /** The seven, in the transmitted order 日月水金火木土. */
  governors: readonly Placement[];
  /**
   * The remainders this board carries, which is three unless 紫氣 was asked
   * for. `ziqi: 'off'` is the default, and then this is 三餘 and says so.
   */
  remainders: readonly Placement[];
  /** 命宮, which under 加時 is a palace and carries no degree. */
  minggong: { palace: Branch; ci: Ci };
  /**
   * The twelve 人事宮, numbered from the 命宮, each on the palace it fell on.
   *
   * A labelling of the same twelve palaces and not a thirteenth thing: what
   * each one is *asked* about is the reader's, as everywhere here.
   */
  houses: readonly HouseSeat[];
  options: QizhengOptions;
}

/**
 * The longitude at which each 宿 begins, aligned with `LODGES`.
 *
 * Twenty-eight star positions at one instant, which is what the frame costs.
 * They are not cached across instants on purpose: the whole point of taking
 * the boundaries from the stars is that they move.
 */
export function lodgeBoundaries(
  julianDayUT: number,
  context: EphemerisContext,
): readonly number[] {
  return LODGES.map((lodge) =>
    starLongitude(DETERMINATIVE_STARS[lodge.id], julianDayUT, context),
  );
}

/** The palace a longitude falls in: every thirtieth degree, running backwards. */
function palaceOfLongitude(longitude: number): Branch {
  const index = (10 - Math.floor(longitude / 30) + 12) % 12;
  return BRANCHES[index] as Branch;
}

/**
 * Places a longitude in both frames at once.
 *
 * The 宿 is the one whose 距星 is nearest behind the longitude, which is the
 * least of the twenty-eight distances measured forward from a boundary. Put
 * that way there is no gap to fall through and no width to compare against:
 * a longitude has exactly one nearest boundary behind it, wherever the stars
 * have drifted to.
 */
export function standingOf(longitude: number, boundaries: readonly number[]): Standing {
  let lodgeIndex = 0;
  let lodgeDegree = Number.POSITIVE_INFINITY;
  boundaries.forEach((boundary, index) => {
    const past = mod360(longitude - boundary);
    if (past < lodgeDegree) {
      lodgeIndex = index;
      lodgeDegree = past;
    }
  });

  const palace = palaceOfLongitude(longitude);
  return {
    longitude,
    lodge: LODGES[lodgeIndex] as Lodge,
    lodgeDegree,
    palace,
    ci: CI[palace.index] as Ci,
    palaceDegree: longitude % 30,
  };
}

/**
 * Lays the board for an instant already resolved.
 *
 * It takes a Julian Day and the branch of the hour, because those are what
 * the board is built from: the sky answers the first and 立命 needs the
 * second. The ephemeris arrives as an argument like everything else.
 */
export function qizhengBoard(
  request: { julianDay: number; hour: Branch },
  options: QizhengOptions,
  context: EphemerisContext,
): QizhengBoard {
  requireImplemented(QIZHENG_PARAMETERS, options, 'xiudu', 'ziqi', 'minggong', 'gong', 'luohou');

  const { julianDay, hour } = request;
  const boundaries = lodgeBoundaries(julianDay, context);
  const place = (body: QizhengBody, longitude: number, speed: number): Placement => ({
    ...standingOf(longitude, boundaries),
    body,
    speed,
    motion: speed < 0 ? 'ni' : 'shun',
  });

  const governors = GOVERNORS.map(({ body, ...named }) => {
    const { longitude, speed } = bodyPosition(body, julianDay, context);
    return place(named, longitude, speed);
  });

  // 羅睺 and 計都 are the two ends of one line, so one call settles both, and
  // `luohou` only decides which end wears which name. sweph returns the
  // ascending node; the descending one is half a turn away and runs with it.
  const node = bodyPosition('meanNode', julianDay, context);
  const descending = mod360(node.longitude + 180);
  const apogee = bodyPosition('meanApogee', julianDay, context);
  const luohouLongitude = options.luohou === 'ascending' ? node.longitude : descending;
  const jiduLongitude = options.luohou === 'ascending' ? descending : node.longitude;

  const remainders = [
    place(REMAINDERS.luohou, luohouLongitude, node.speed),
    place(REMAINDERS.jidu, jiduLongitude, node.speed),
    place(REMAINDERS.yuebei, apogee.longitude, apogee.speed),
  ];

  // 立命: the hour of the birth is laid on the palace the Sun stands in, and
  // the palaces are counted forward from there to 卯. What 卯 lands on is the
  // 命宮 — a palace, and no degree, which is the whole of what the rule gives.
  const sun = governors[0] as Placement;
  const steps = mod12(BRANCHES[3]!.index - hour.index);
  const minggongPalace = BRANCHES[mod12(sun.palace.index + steps)] as Branch;

  // The twelve climb against the branches, which is forwards through the sky:
  // 夫妻 lands opposite 命, 田宅 a quarter turn along where the sky is
  // deepest, 官祿 where it is highest. See `HOUSES` for why this direction and
  // not the other.
  const houses = HOUSES.map((house, number) => {
    const palace = BRANCHES[mod12(minggongPalace.index - number)] as Branch;
    return { house, palace, ci: CI[palace.index] as Ci };
  });

  return {
    julianDay,
    governors,
    remainders,
    minggong: { palace: minggongPalace, ci: CI[minggongPalace.index] as Ci },
    houses,
    options,
  };
}

function mod360(degrees: number): number {
  const value = degrees % 360;
  return value < 0 ? value + 360 : value;
}

function mod12(value: number): number {
  return ((value % 12) + 12) % 12;
}
