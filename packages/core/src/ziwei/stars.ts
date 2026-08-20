/**
 * The stars of a 紫微斗數 board, and the names the seats are counted under.
 *
 * **Nothing here is in the sky.** 紫微 is not a star a telescope finds and
 * 天府 is not the 天輔 of a dunjia chart, which happens to be tiānfǔ too; a
 * board of this art is arithmetic on a birth, and every name below is a seat
 * in a count. The engine places only what 《紫微斗數全書》 卷二 states a rule
 * for. The modern furniture that has no rule there — 恩光, 天貴, 咸池,
 * 孤辰, 寡宿, 華蓋, 破碎, and a 地空 distinct from this text's 天空 — is
 * absent, and its absence is written down in `docs/sources.md` rather than
 * filled in from a school nobody here has read.
 */

import type { Element } from '../types.js';

export type ZiweiStarId =
  // 十四主星
  | 'ziwei' | 'tianji' | 'taiyang' | 'wuqu' | 'tiantong' | 'lianzhen'
  | 'tianfu' | 'taiyin' | 'tanlang' | 'jumen' | 'tianxiang' | 'tianliang'
  | 'qisha' | 'pojun'
  // 輔佐
  | 'wenchang' | 'wenqu' | 'zuofu' | 'youbi' | 'tiankui' | 'tianyue'
  | 'lucun' | 'tianma'
  // 煞
  | 'qingyang' | 'tuoluo' | 'huoxing' | 'lingxing' | 'dijie' | 'tiankong'
  // the rest 卷二 places
  | 'tianshang' | 'tianshi' | 'tianxing' | 'tianyao' | 'santai' | 'bazuo'
  | 'tianku' | 'tianxu' | 'longchi' | 'fengge' | 'hongluan' | 'tianxi'
  | 'taifu' | 'fenggao' | 'jieshen' | 'jielukongwang' | 'xunzhongkongwang';

/**
 * What kind of thing a star is taken for.
 *
 * The classes are the text's own groupings — 十四主星 under 安南北斗諸星訣,
 * the 輔佐 and 煞 of the verses that follow — and they order a drawing and a
 * transcript. They are **not** a verdict: that 擎羊 is a 煞 is how the
 * tradition files it, not this engine saying a life goes badly.
 */
export type StarClass = 'main' | 'aid' | 'malefic' | 'minor';

export interface ZiweiStar {
  id: ZiweiStarId;
  hanzi: string;
  /** The name said aloud, e.g. `zǐwēi`. */
  pinyin: string;
  starClass: StarClass;
  /**
   * The phase or phases 卷二 assigns the star, where it assigns any.
   *
   * 「論諸星分屬南北斗化吉凶並分屬五行」 gives one for every star it places
   * bar thirteen, and the list is identical in both editions — bar 左輔 and
   * 右弼, where the first drops 屬土 and the second prints it.
   *
   * **Three stars have two**, and the array is why: 天同屬水金, 貪狼屬水木,
   * 七殺屬火金. The book means both, so both travel; nothing here reduces
   * them to one, and a surface that can show only one phase shows none for
   * these three rather than picking.
   *
   * Empty for the thirteen the list passes over — 三台, 八座, 天哭, 天虛,
   * 龍池, 鳳閣, 台輔, 封誥, 解神, 天刑, 天姚 and the two 空亡 — which is the
   * book being silent and not the star being phaseless.
   */
  elements: readonly Element[];
  /**
   * Whether the book counts this one among the 正曜, the proper luminaries.
   *
   * 「以上自紫微至輔弼一十八星俱南北斗正曜，魁鉞天馬亦是吉星俱不入正曜」 —
   * the eighteen from 紫微 to 右弼, and the line is drawn by the text rather
   * than by anything here: 天魁, 天鉞 and 天馬 are named good stars in the
   * same breath and still put outside the eighteen.
   *
   * It is carried because a surface with less room than it has names needs a
   * principled subset to spend that room on, and this is the book's own. It
   * is **not** a ranking: a star outside the eighteen is not a lesser star,
   * it is a star the text files differently.
   */
  zhengyao: boolean;
}

export const ZIWEI_STARS: readonly ZiweiStar[] = [
  { id: 'ziwei', hanzi: '紫微', pinyin: 'zǐwēi', starClass: 'main', elements: ['tu'] , zhengyao: true },
  { id: 'tianji', hanzi: '天機', pinyin: 'tiānjī', starClass: 'main', elements: ['mu'] , zhengyao: true },
  { id: 'taiyang', hanzi: '太陽', pinyin: 'tàiyáng', starClass: 'main', elements: ['huo'] , zhengyao: true },
  { id: 'wuqu', hanzi: '武曲', pinyin: 'wǔqǔ', starClass: 'main', elements: ['jin'] , zhengyao: true },
  { id: 'tiantong', hanzi: '天同', pinyin: 'tiāntóng', starClass: 'main', elements: ['shui', 'jin'] , zhengyao: true },
  { id: 'lianzhen', hanzi: '廉貞', pinyin: 'liánzhēn', starClass: 'main', elements: ['huo'] , zhengyao: true },
  { id: 'tianfu', hanzi: '天府', pinyin: 'tiānfǔ', starClass: 'main', elements: ['tu'] , zhengyao: true },
  { id: 'taiyin', hanzi: '太陰', pinyin: 'tàiyīn', starClass: 'main', elements: ['shui'] , zhengyao: true },
  { id: 'tanlang', hanzi: '貪狼', pinyin: 'tānláng', starClass: 'main', elements: ['shui', 'mu'] , zhengyao: true },
  { id: 'jumen', hanzi: '巨門', pinyin: 'jùmén', starClass: 'main', elements: ['shui'] , zhengyao: true },
  { id: 'tianxiang', hanzi: '天相', pinyin: 'tiānxiàng', starClass: 'main', elements: ['shui'] , zhengyao: true },
  { id: 'tianliang', hanzi: '天梁', pinyin: 'tiānliáng', starClass: 'main', elements: ['tu'] , zhengyao: true },
  { id: 'qisha', hanzi: '七殺', pinyin: 'qīshā', starClass: 'main', elements: ['huo', 'jin'] , zhengyao: true },
  { id: 'pojun', hanzi: '破軍', pinyin: 'pòjūn', starClass: 'main', elements: ['shui'] , zhengyao: true },

  { id: 'wenchang', hanzi: '文昌', pinyin: 'wénchāng', starClass: 'aid', elements: ['jin'] , zhengyao: true },
  { id: 'wenqu', hanzi: '文曲', pinyin: 'wénqǔ', starClass: 'aid', elements: ['shui'] , zhengyao: true },
  { id: 'zuofu', hanzi: '左輔', pinyin: 'zuǒfǔ', starClass: 'aid', elements: ['tu'] , zhengyao: true },
  { id: 'youbi', hanzi: '右弼', pinyin: 'yòubì', starClass: 'aid', elements: ['tu'] , zhengyao: true },
  { id: 'tiankui', hanzi: '天魁', pinyin: 'tiānkuí', starClass: 'aid', elements: ['huo'] , zhengyao: false },
  { id: 'tianyue', hanzi: '天鉞', pinyin: 'tiānyuè', starClass: 'aid', elements: ['huo'] , zhengyao: false },
  { id: 'lucun', hanzi: '祿存', pinyin: 'lùcún', starClass: 'aid', elements: ['tu'] , zhengyao: false },
  { id: 'tianma', hanzi: '天馬', pinyin: 'tiānmǎ', starClass: 'aid', elements: ['huo'] , zhengyao: false },

  { id: 'qingyang', hanzi: '擎羊', pinyin: 'qíngyáng', starClass: 'malefic', elements: ['jin'] , zhengyao: false },
  { id: 'tuoluo', hanzi: '陀羅', pinyin: 'tuóluó', starClass: 'malefic', elements: ['jin'] , zhengyao: false },
  { id: 'huoxing', hanzi: '火星', pinyin: 'huǒxīng', starClass: 'malefic', elements: ['huo'] , zhengyao: false },
  { id: 'lingxing', hanzi: '鈴星', pinyin: 'língxīng', starClass: 'malefic', elements: ['huo'] , zhengyao: false },
  { id: 'dijie', hanzi: '地劫', pinyin: 'dìjié', starClass: 'malefic', elements: ['huo'] , zhengyao: false },
  // The text's own name. What many later schools call 地空 is this 天空,
  // placed by the same verse; and the 天空 those schools place from the
  // 太歲 is a different star with no rule in 卷二, so it is not here.
  { id: 'tiankong', hanzi: '天空', pinyin: 'tiānkōng', starClass: 'malefic', elements: ['huo'] , zhengyao: false },

  { id: 'tianshang', hanzi: '天傷', pinyin: 'tiānshāng', starClass: 'minor', elements: ['shui'] , zhengyao: false },
  { id: 'tianshi', hanzi: '天使', pinyin: 'tiānshǐ', starClass: 'minor', elements: ['shui'] , zhengyao: false },
  { id: 'tianxing', hanzi: '天刑', pinyin: 'tiānxíng', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'tianyao', hanzi: '天姚', pinyin: 'tiānyáo', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'santai', hanzi: '三台', pinyin: 'sāntái', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'bazuo', hanzi: '八座', pinyin: 'bāzuò', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'tianku', hanzi: '天哭', pinyin: 'tiānkū', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'tianxu', hanzi: '天虛', pinyin: 'tiānxū', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'longchi', hanzi: '龍池', pinyin: 'lóngchí', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'fengge', hanzi: '鳳閣', pinyin: 'fènggé', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'hongluan', hanzi: '紅鸞', pinyin: 'hóngluán', starClass: 'minor', elements: ['shui'] , zhengyao: false },
  { id: 'tianxi', hanzi: '天喜', pinyin: 'tiānxǐ', starClass: 'minor', elements: ['shui'] , zhengyao: false },
  { id: 'taifu', hanzi: '台輔', pinyin: 'táifǔ', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'fenggao', hanzi: '封誥', pinyin: 'fēnggào', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'jieshen', hanzi: '解神', pinyin: 'jiěshén', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'jielukongwang', hanzi: '截路空亡', pinyin: 'jiélùkōngwáng', starClass: 'minor', elements: [] , zhengyao: false },
  { id: 'xunzhongkongwang', hanzi: '旬中空亡', pinyin: 'xúnzhōngkōngwáng', starClass: 'minor', elements: [] , zhengyao: false },
];

const BY_ID = new Map(ZIWEI_STARS.map((star) => [star.id, star]));

export function star(id: ZiweiStarId): ZiweiStar {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`unknown star: ${id}`);
  return found;
}

/**
 * The twelve seats, in the order 卷二 numbers them.
 *
 * 「一命宮、二兄弟、三妻妾、四子女、五財帛、六疾厄、七遷移、八奴僕、
 * 九官祿、十田宅、十一福德、十二父母」, and they are laid 逆 — against the
 * branches — because the same passage says so: 「男女俱從逆轉切忌莫順去」.
 *
 * These are the text's names and not the modern ones: 妻妾 where a later
 * hand writes 夫妻, 奴僕 where it writes 交友, 官祿 where it writes 事業.
 * They are also **not** the twelve 人事宮 of 七政四餘, which are the
 * Hellenistic houses in the Hellenistic order and are laid the other way
 * round; the two rings share the branches and nothing else. See
 * `docs/sources.md`.
 */
export type ZiweiHouseId =
  | 'ming' | 'xiongdi' | 'qiqie' | 'zinu' | 'caibo' | 'jie'
  | 'qianyi' | 'nupu' | 'guanlu' | 'tianzhai' | 'fude' | 'fumu';

export interface ZiweiHouse {
  id: ZiweiHouseId;
  hanzi: string;
  pinyin: string;
}

export const ZIWEI_HOUSES: readonly ZiweiHouse[] = [
  { id: 'ming', hanzi: '命宮', pinyin: 'mìnggōng' },
  { id: 'xiongdi', hanzi: '兄弟', pinyin: 'xiōngdì' },
  { id: 'qiqie', hanzi: '妻妾', pinyin: 'qīqiè' },
  { id: 'zinu', hanzi: '子女', pinyin: 'zǐnǚ' },
  { id: 'caibo', hanzi: '財帛', pinyin: 'cáibó' },
  // 疾厄 keeps the spelling `qizheng.ts` settled: one tone mark to a
  // syllable, so `jíè` is two syllables where `jié` would be one.
  { id: 'jie', hanzi: '疾厄', pinyin: 'jíè' },
  { id: 'qianyi', hanzi: '遷移', pinyin: 'qiānyí' },
  { id: 'nupu', hanzi: '奴僕', pinyin: 'núpú' },
  { id: 'guanlu', hanzi: '官祿', pinyin: 'guānlù' },
  { id: 'tianzhai', hanzi: '田宅', pinyin: 'tiánzhái' },
  { id: 'fude', hanzi: '福德', pinyin: 'fúdé' },
  { id: 'fumu', hanzi: '父母', pinyin: 'fùmǔ' },
];

/** The five bureaus, 五行局, and the number each counts by. */
export type BureauId = 'shuierju' | 'musanju' | 'jinsiju' | 'tuwuju' | 'huoliuju';

export interface Bureau {
  id: BureauId;
  hanzi: string;
  pinyin: string;
  /** 二, 三, 四, 五, 六 — the step the 紫微 table counts by. */
  number: number;
}

export const BUREAUS: readonly Bureau[] = [
  { id: 'shuierju', hanzi: '水二局', pinyin: 'shuǐèrjú', number: 2 },
  { id: 'musanju', hanzi: '木三局', pinyin: 'mùsānjú', number: 3 },
  { id: 'jinsiju', hanzi: '金四局', pinyin: 'jīnsìjú', number: 4 },
  { id: 'tuwuju', hanzi: '土五局', pinyin: 'tǔwǔjú', number: 5 },
  { id: 'huoliuju', hanzi: '火六局', pinyin: 'huǒliùjú', number: 6 },
];

/**
 * The seven grades of the table at the end of 卷二.
 *
 * Carried for the reason `Pattern.valence` is carried: the text names and
 * weighs the grade in one line of one table, and it is an attribute of where
 * a star sits rather than of anybody's situation. It is not a score, and
 * nothing here adds them up.
 */
export type BrightnessId =
  | 'miao' | 'wang' | 'dedi' | 'liyi' | 'pinghe' | 'budedi' | 'luoxian';

export interface Brightness {
  id: BrightnessId;
  hanzi: string;
  pinyin: string;
}

export const BRIGHTNESSES: readonly Brightness[] = [
  { id: 'miao', hanzi: '廟', pinyin: 'miào' },
  { id: 'wang', hanzi: '旺', pinyin: 'wàng' },
  { id: 'dedi', hanzi: '得地', pinyin: 'dédì' },
  { id: 'liyi', hanzi: '利益', pinyin: 'lìyì' },
  { id: 'pinghe', hanzi: '平和', pinyin: 'pínghé' },
  { id: 'budedi', hanzi: '不得地', pinyin: 'bùdédì' },
  { id: 'luoxian', hanzi: '落陷', pinyin: 'luòxiàn' },
];

/** The four transformations the birth year's stem works on four stars. */
export type TransformId = 'hualu' | 'huaquan' | 'huake' | 'huaji';

export interface Transform {
  id: TransformId;
  hanzi: string;
  pinyin: string;
}

export const TRANSFORMS: readonly Transform[] = [
  { id: 'hualu', hanzi: '化祿', pinyin: 'huàlù' },
  { id: 'huaquan', hanzi: '化權', pinyin: 'huàquán' },
  { id: 'huake', hanzi: '化科', pinyin: 'huàkē' },
  { id: 'huaji', hanzi: '化忌', pinyin: 'huàjì' },
];

/**
 * 博士十二神, the ring that walks from 祿存.
 *
 * 「博士力士青龍續，小耗將軍及奏書，蜚廉喜神病符錄，天耗伏兵至宮府」 —
 * where 天耗 is 大耗, which the following verse confirms by naming it
 * between 病符 and 伏兵: 「病符帶疾耗退祖，伏兵官府口舌纏」.
 */
export type BoshiGodId =
  | 'boshi' | 'lishi' | 'qinglong' | 'xiaohao' | 'jiangjun' | 'zoushu'
  | 'feilian' | 'xishen' | 'bingfu' | 'dahao' | 'fubing' | 'guanfu';

export interface BoshiGod {
  id: BoshiGodId;
  hanzi: string;
  pinyin: string;
}

export const BOSHI_GODS: readonly BoshiGod[] = [
  { id: 'boshi', hanzi: '博士', pinyin: 'bóshì' },
  { id: 'lishi', hanzi: '力士', pinyin: 'lìshì' },
  { id: 'qinglong', hanzi: '青龍', pinyin: 'qīnglóng' },
  { id: 'xiaohao', hanzi: '小耗', pinyin: 'xiǎohào' },
  { id: 'jiangjun', hanzi: '將軍', pinyin: 'jiāngjūn' },
  { id: 'zoushu', hanzi: '奏書', pinyin: 'zòushū' },
  { id: 'feilian', hanzi: '蜚廉', pinyin: 'fēilián' },
  { id: 'xishen', hanzi: '喜神', pinyin: 'xǐshén' },
  { id: 'bingfu', hanzi: '病符', pinyin: 'bìngfú' },
  { id: 'dahao', hanzi: '大耗', pinyin: 'dàhào' },
  { id: 'fubing', hanzi: '伏兵', pinyin: 'fúbīng' },
  { id: 'guanfu', hanzi: '官府', pinyin: 'guānfǔ' },
];
