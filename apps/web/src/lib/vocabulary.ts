/**
 * The identifiers a form has to offer, redeclared.
 *
 * The engine has these lists already — `GATES`, `STARS`, `SPIRITS_YANG`,
 * `PATTERN_IDS` — but they are **values**, and the client imports only types
 * from `core`. A value import would drag the ephemerides and a native module
 * into the browser bundle to populate a `select` with eight words.
 *
 * So they are written out here, exactly as `@qimendunjia/plate` redeclares
 * the shape of a chart, and `test/vocabulary.test.ts` asserts that these and
 * the engine's still agree. A form offering a gate the engine has never heard
 * of would come back with an error; one missing a gate would silently make it
 * unaskable.
 */

export const GATE_IDS = [
  'xiumen',
  'shengmen',
  'shangmen',
  'dumen',
  'jing3men',
  'simen',
  'jing1men',
  'kaimen',
] as const;

export const STAR_IDS = [
  'tianpeng',
  'tianrui',
  'tianchong',
  'tianfu',
  'tianqin',
  'tianxin',
  'tianzhu',
  'tianren',
  'tianying',
] as const;

/**
 * Ten, not eight.
 *
 * A chart shows eight spirits, but which eight depends on the dun: 勾陳 and
 * 朱雀 stand in a yang chart and never in a yin one, 白虎 and 玄武 the other
 * way about. A form offering only one plate's worth makes 白虎 unaskable for
 * half the charts of the year.
 */
export const SPIRIT_IDS = [
  'zhifu',
  'tengshe',
  'taiyin',
  'liuhe',
  'gouchen',
  'zhuque',
  'baihu',
  'xuanwu',
  'jiudi',
  'jiutian',
] as const;

export const PATTERN_IDS = [
  'kongwang',
  'rumu',
  'menpo',
  'jixing',
  'fuyin',
  'fanyin',
  'wubuyu',
  'qinglongfanshou',
  'feiniaodiexue',
] as const;

/** The eight outward directions. The centre faces none and is not offered. */
export const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

/** Strongest first, which is the order a floor is chosen from. */
export const STRENGTHS = ['wang', 'xiang', 'xiu', 'qiu', 'si'] as const;
