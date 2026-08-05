import type { Ganzhi } from '../ganzhi.js';
import type { Element } from '../types.js';

export interface Nayin {
  /** Toneless pinyin of the whole image, e.g. `haizhongjin`. */
  id: string;
  /** e.g. `海中金`. */
  hanzi: string;
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
const NAYIN: [string, string, Element][] = [
  ['haizhongjin', '海中金', 'jin'],
  ['luzhonghuo', '爐中火', 'huo'],
  ['dalinmu', '大林木', 'mu'],
  ['lupangtu', '路旁土', 'tu'],
  ['jianfengjin', '劍鋒金', 'jin'],
  ['shantouhuo', '山頭火', 'huo'],
  ['jianxiashui', '澗下水', 'shui'],
  ['chengtoutu', '城頭土', 'tu'],
  ['bailajin', '白蠟金', 'jin'],
  ['yangliumu', '楊柳木', 'mu'],
  ['quanzhongshui', '泉中水', 'shui'],
  ['wushangtu', '屋上土', 'tu'],
  ['pilihuo', '霹靂火', 'huo'],
  ['songbaimu', '松柏木', 'mu'],
  ['changliushui', '長流水', 'shui'],
  ['shazhongjin', '沙中金', 'jin'],
  ['shanxiahuo', '山下火', 'huo'],
  ['pingdimu', '平地木', 'mu'],
  ['bishangtu', '壁上土', 'tu'],
  ['jinbojin', '金箔金', 'jin'],
  ['fudenghuo', '覆燈火', 'huo'],
  ['tianheshui', '天河水', 'shui'],
  ['dayitu', '大驛土', 'tu'],
  ['chaichuanjin', '釵釧金', 'jin'],
  ['sangzhemu', '桑柘木', 'mu'],
  ['daxishui', '大溪水', 'shui'],
  ['shazhongtu', '沙中土', 'tu'],
  ['tianshanghuo', '天上火', 'huo'],
  ['shiliumu', '石榴木', 'mu'],
  ['dahaishui', '大海水', 'shui'],
];

export function nayin(ganzhi: Ganzhi): Nayin {
  const [id, hanzi, element] = NAYIN[Math.floor(ganzhi.index / 2)] as [string, string, Element];
  return { id, hanzi, element };
}
