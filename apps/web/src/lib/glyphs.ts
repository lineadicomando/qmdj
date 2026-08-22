/**
 * The glyphs the engine names things with, redeclared for the browser.
 *
 * The rain behind the page falls in the project's own vocabulary rather than
 * in decorative characters: what goes past is 休門, 天蓬, 玄枵, 驚蟄 — every
 * name the engine puts on a board, and nothing that is not one.
 *
 * **Not read off `texts/`.** That shelf is gitignored, most of it was bought
 * and cannot be redistributed, and `texts/README.md` states that nothing in
 * the repository refers to it by path. A clone lacks it and must lack
 * nothing. The names below are the part of those sources this project owns
 * outright, because it computes with them.
 *
 * Redeclared here for the reason `vocabulary.ts` redeclares the form's
 * identifiers: `STEMS`, `GATES`, `ZIWEI_STARS` and the rest are **values**,
 * and a value import would drag the ephemerides and a native module into the
 * browser bundle. `test/glyphs.test.ts` asserts that these and the engine's
 * still agree, art by art — so a board landing with names of its own fails
 * the test rather than quietly leaving them out of the rain.
 */

export const ENGINE_NAMES_BY_ART = {
  ganzhi: [
    '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛',
    '壬', '癸', '子', '丑', '寅', '卯', '辰', '巳',
    '午', '未', '申', '酉', '戌', '亥', '木', '火',
    '土', '金', '水',
  ],
  jieqi: [
    '立春', '雨水', '驚蟄', '春分', '清明', '穀雨', '立夏', '小滿',
    '芒種', '夏至', '小暑', '大暑', '立秋', '處暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
    '上元', '中元', '下元',
  ],
  qimen: [
    '坎', '坤', '震', '巽', '中', '乾', '兌', '艮',
    '離', '休門', '生門', '傷門', '杜門', '景門', '死門', '驚門',
    '開門', '天蓬', '天芮', '天沖', '天輔', '天禽', '天心', '天柱',
    '天任', '天英', '值符', '螣蛇', '太陰', '六合', '勾陳', '朱雀',
    '九地', '九天', '白虎', '玄武',
  ],
  liuren: [
    '貴人', '螣蛇', '朱雀', '六合', '勾陳', '青龍', '天空', '白虎',
    '太常', '玄武', '太陰', '天后', '元首', '重審', '知一', '涉害',
    '蒿矢', '彈射', '虎視', '冬蛇掩目', '別責', '八專', '自任', '自信',
    '杜傳', '無依', '井欄',
  ],
  ziwei: [
    '紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府', '太陰',
    '貪狼', '巨門', '天相', '天梁', '七殺', '破軍', '文昌', '文曲',
    '左輔', '右弼', '天魁', '天鉞', '祿存', '天馬', '擎羊', '陀羅',
    '火星', '鈴星', '地劫', '天空', '天傷', '天使', '天刑', '天姚',
    '三台', '八座', '天哭', '天虛', '龍池', '鳳閣', '紅鸞', '天喜',
    '台輔', '封誥', '解神', '截路空亡', '旬中空亡', '命宮', '兄弟', '妻妾',
    '子女', '財帛', '疾厄', '遷移', '奴僕', '官祿', '田宅', '福德',
    '父母', '博士', '力士', '青龍', '小耗', '將軍', '奏書', '蜚廉',
    '喜神', '病符', '大耗', '伏兵', '官府', '廟', '旺', '得地',
    '利益', '平和', '不得地', '落陷',
  ],
  taiyi: [
    '地主', '陽德', '和德', '呂申', '高叢', '太陽', '太炅', '太神',
    '大威', '天道', '大武', '武德', '太蔟', '陰主', '陰德', '大義',
    '乾', '離', '艮', '震', '中', '兌', '坤', '坎',
    '巽',
  ],
  almanac: [
    '角', '亢', '氐', '房', '心', '尾', '箕', '斗',
    '牛', '女', '虛', '危', '室', '壁', '奎', '婁',
    '胃', '昴', '畢', '觜', '參', '井', '鬼', '柳',
    '星', '張', '翼', '軫', '建', '除', '滿', '平',
    '定', '執', '破', '成', '收', '開', '閉',
  ],
  qizheng: [
    '太陽', '太陰', '水星', '金星', '火星', '木星', '土星', '羅睺',
    '計都', '月孛', '紫氣', '命宮', '財帛宮', '兄弟宮', '田宅宮', '男女宮',
    '奴僕宮', '夫妻宮', '疾厄宮', '遷移宮', '官祿宮', '福德宮', '相貌宮', '玄枵',
    '星紀', '析木', '大火', '壽星', '鶉尾', '鶉火', '鶉首', '實沈',
    '大梁', '降婁', '娵訾',
  ],
  nianming: [
    '本命', '行年',
  ],
} as const;

/**
 * Every name, once.
 *
 * The arts share glyphs — 太陰 is a spirit, a star and a body, 命宮 is a
 * palace on two different boards — and a pool that counted them twice would
 * rain them twice as often for no reason but the overlap.
 */
export const ENGINE_NAMES: readonly string[] = [
  ...new Set(Object.values(ENGINE_NAMES_BY_ART).flat()),
];
