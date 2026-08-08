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
  // 十干克應, in the order the engine holds them.
  'qinglongfanshou',
  'feiniaodiexue',
  'taibairuying',
  'yingrutaibai',
  'dage',
  'xingge',
  'zhange',
  'tengsheyaojiao',
  'zhuquetoujiang',
  'qinglongtaozou',
  'baihuchangkuang',
] as const;

/**
 * The methods a form offers, which are the ones the engine implements.
 *
 * `maoshan` exists in the engine's type and is deliberately not here: an
 * option that can only ever come back as an error is not a choice, and the
 * address still accepts it for whoever asks the API directly.
 */
export const METHODS = ['chaibu', 'zhirun'] as const;

/** The eight outward directions. The centre faces none and is not offered. */
export const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

/**
 * The nine palaces, in the order of the magic square.
 *
 * Redeclared for two things the client does without an answer in hand. The
 * form asks for a direction and the address carries one, but the catalog has
 * no word for a bare direction — the palace names itself by one, so the gloss
 * is looked up through here. And an hour set aside is an hour *and a palace*,
 * kept in the address long after the scan that found it has been re-run: the
 * strip that lists them names and draws each one from this, with nothing
 * fetched.
 *
 * The centre faces nowhere, which is why `direction` is nullable and why
 * `DIRECTIONS` is eight and this is nine.
 */
export const PALACES = [
  { number: 1, id: 'kan', hanzi: '坎', direction: 'n' },
  { number: 2, id: 'kun', hanzi: '坤', direction: 'sw' },
  { number: 3, id: 'zhen', hanzi: '震', direction: 'e' },
  { number: 4, id: 'xun', hanzi: '巽', direction: 'se' },
  { number: 5, id: 'zhong', hanzi: '中', direction: null },
  { number: 6, id: 'qian', hanzi: '乾', direction: 'nw' },
  { number: 7, id: 'dui', hanzi: '兌', direction: 'w' },
  { number: 8, id: 'gen', hanzi: '艮', direction: 'ne' },
  { number: 9, id: 'li', hanzi: '離', direction: 's' },
] as const;

/** The palace facing a given way, which is what the address carries. */
export const PALACE_OF: Record<string, string> = Object.fromEntries(
  PALACES.filter((palace) => palace.direction).map((palace) => [palace.direction, palace.id]),
);

/** Strongest first, which is the order a floor is chosen from. */
export const STRENGTHS = ['wang', 'xiang', 'xiu', 'qiu', 'si'] as const;

/**
 * What somebody is choosing a time for, and the gate the tradition gives it.
 *
 * Redeclared like the rest, and paired: the form needs the gate a purpose
 * stands for in order to fill the field with it, and that pairing is engine
 * data. `test/vocabulary.test.ts` asserts it against `PURPOSES`.
 */
export const PURPOSES = [
  { id: 'opening', gate: 'kaimen' },
  { id: 'meeting', gate: 'xiumen' },
  { id: 'wealth', gate: 'shengmen' },
  { id: 'documents', gate: 'jing3men' },
  { id: 'concealment', gate: 'dumen' },
  { id: 'pursuit', gate: 'shangmen' },
  { id: 'ending', gate: 'simen' },
  { id: 'dispute', gate: 'jing1men' },
] as const;
