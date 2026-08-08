import type { Ganzhi } from '../ganzhi.js';
import type { Element } from '../types.js';

export interface Nayin {
  /** Toneless pinyin of the whole image, e.g. `haizhongjin`. */
  id: string;
  /** e.g. `海中金`. */
  hanzi: string;
  /** The image said aloud, e.g. `hǎizhōngjīn`. */
  pinyin: string;
  /** The phase the image belongs to — the last character of the name. */
  element: Element;
}

/**
 * The thirty images of the sexagenary cycle (納音).
 *
 * Each image covers two consecutive pairs, which is why there are thirty and
 * not sixty: 甲子 and 乙丑 are both metal in the sea. The names are figures —
 * metal in the sea, fire in the furnace, wood of the great forest — and the
 * engine reports the figure, not what anyone makes of it.
 */
const NAYIN: [string, string, string, Element][] = [
  ['haizhongjin', '海中金', 'hǎizhōngjīn', 'jin'],
  ['luzhonghuo', '爐中火', 'lúzhōnghuǒ', 'huo'],
  ['dalinmu', '大林木', 'dàlínmù', 'mu'],
  ['lupangtu', '路旁土', 'lùpángtǔ', 'tu'],
  ['jianfengjin', '劍鋒金', 'jiànfēngjīn', 'jin'],
  ['shantouhuo', '山頭火', 'shāntóuhuǒ', 'huo'],
  ['jianxiashui', '澗下水', 'jiànxiàshuǐ', 'shui'],
  ['chengtoutu', '城頭土', 'chéngtóutǔ', 'tu'],
  ['bailajin', '白蠟金', 'báilàjīn', 'jin'],
  ['yangliumu', '楊柳木', 'yángliǔmù', 'mu'],
  ['quanzhongshui', '泉中水', 'quánzhōngshuǐ', 'shui'],
  ['wushangtu', '屋上土', 'wūshàngtǔ', 'tu'],
  ['pilihuo', '霹靂火', 'pīlìhuǒ', 'huo'],
  ['songbaimu', '松柏木', 'sōngbǎimù', 'mu'],
  ['changliushui', '長流水', 'chángliúshuǐ', 'shui'],
  ['shazhongjin', '沙中金', 'shāzhōngjīn', 'jin'],
  ['shanxiahuo', '山下火', 'shānxiàhuǒ', 'huo'],
  ['pingdimu', '平地木', 'píngdìmù', 'mu'],
  ['bishangtu', '壁上土', 'bìshàngtǔ', 'tu'],
  ['jinbojin', '金箔金', 'jīnbójīn', 'jin'],
  ['fudenghuo', '覆燈火', 'fùdēnghuǒ', 'huo'],
  ['tianheshui', '天河水', 'tiānhéshuǐ', 'shui'],
  ['dayitu', '大驛土', 'dàyìtǔ', 'tu'],
  ['chaichuanjin', '釵釧金', 'chāichuànjīn', 'jin'],
  ['sangzhemu', '桑柘木', 'sāngzhèmù', 'mu'],
  ['daxishui', '大溪水', 'dàxīshuǐ', 'shui'],
  ['shazhongtu', '沙中土', 'shāzhōngtǔ', 'tu'],
  ['tianshanghuo', '天上火', 'tiānshànghuǒ', 'huo'],
  ['shiliumu', '石榴木', 'shíliúmù', 'mu'],
  ['dahaishui', '大海水', 'dàhǎishuǐ', 'shui'],
];

export function nayin(ganzhi: Ganzhi): Nayin {
  const [id, hanzi, pinyin, element] = NAYIN[Math.floor(ganzhi.index / 2)] as [
    string,
    string,
    string,
    Element,
  ];
  return { id, hanzi, pinyin, element };
}
