import { CONTROLS } from '../bazi/relations.js';
import { decade, type Branch, type Ganzhi, type Stem } from '../ganzhi.js';
import { palace, palaceOfBranch, type ByPalace } from './palaces.js';
import { relationOf } from './relation.js';
import type { Gate, Star } from './plates.js';

export type PatternId =
  | 'kongwang'
  | 'rumu'
  | 'menpo'
  | 'jixing'
  | 'fuyin'
  | 'fanyin'
  | 'wubuyu'
  // 十干克應 — the stem of the heaven plate standing over the stem of the
  // earth plate. See `STEM_PAIRS`, and `docs/sources.md` for what each of
  // these was checked against.
  | 'qinglongfanshou'
  | 'feiniaodiexue'
  | 'taibairuying'
  | 'yingrutaibai'
  | 'dage'
  | 'xingge'
  | 'zhange'
  | 'tengsheyaojiao'
  | 'zhuquetoujiang'
  | 'qinglongtaozou'
  | 'baihuchangkuang';

/**
 * The fortune a configuration is transmitted with (吉凶).
 *
 * This is **not** the engine changing its mind about interpreting. The line
 * it holds is between an attribute of the configuration and a reading of
 * somebody's situation, and the fortune is on the near side of it, for a
 * reason that is about the tradition rather than about the software: the
 * classical sources do not name an arrangement and then rate it in a second
 * step. 門迫 *is* 迫, oppression; 擊刑 *is* 刑, punishment. The name and the
 * fortune arrive in the same line of the same text, and a table that carried
 * one without the other would be reporting half of what it read.
 *
 * Which is why leaving it out never worked: it came in through the glosses
 * anyway — «gate oppressed» is not a neutral phrase — where it could not be
 * tested, sourced or contradicted. Here it can.
 *
 * What stays out is unchanged and is the whole of the doctrine that depends
 * on a question being asked: which palace is the 用神 for what somebody wants
 * to know, when the thing will happen, and what to do about it. Nothing in
 * this package ranks two charts, orders two hours, or advises.
 *
 * **How sure this is**: the third tier, the same as the configurations
 * themselves — Chinese-language sources with no runnable reference. Only
 * fortunes the manuals hand down alike are here; anything a school disputes
 * would be a parameter or an absence, as 三奇得使 is.
 */
export type ValenceId = 'ji' | 'xiong' | 'jixiong';

export interface Valence {
  id: ValenceId;
  hanzi: string;
  /** The fortune said aloud, e.g. `jí`. */
  pinyin: string;
}

const VALENCE: Record<ValenceId, Valence> = {
  ji: { id: 'ji', hanzi: '吉', pinyin: 'jí' },
  xiong: { id: 'xiong', hanzi: '凶', pinyin: 'xiōng' },
  jixiong: { id: 'jixiong', hanzi: '吉凶', pinyin: 'jíxiōng' },
};

/**
 * Every configuration this engine recognises, with its name and its fortune.
 *
 * 空亡 is the one that takes 吉凶 rather than 凶, and it is not a hedge: the
 * void withholds whatever falls into it, which the sources state in both
 * directions in the same breath — what was wanted does not arrive, and
 * 凶格落空則凶不成, a baleful configuration fallen into the void does not
 * come off either. Two transmitted halves of one rule, not two schools.
 */
const CONFIGURATIONS: Record<PatternId, { hanzi: string; pinyin: string; valence: ValenceId }> = {
  kongwang: { hanzi: '空亡', pinyin: 'kōngwáng', valence: 'jixiong' },
  rumu: { hanzi: '入墓', pinyin: 'rùmù', valence: 'xiong' },
  menpo: { hanzi: '門迫', pinyin: 'ménpò', valence: 'xiong' },
  jixing: { hanzi: '擊刑', pinyin: 'jīxíng', valence: 'xiong' },
  fuyin: { hanzi: '伏吟', pinyin: 'fúyín', valence: 'xiong' },
  fanyin: { hanzi: '反吟', pinyin: 'fǎnyín', valence: 'xiong' },
  wubuyu: { hanzi: '五不遇時', pinyin: 'wǔbùyùshí', valence: 'xiong' },
  qinglongfanshou: { hanzi: '青龍返首', pinyin: 'qīnglóngfǎnshǒu', valence: 'ji' },
  feiniaodiexue: { hanzi: '飛鳥跌穴', pinyin: 'fēiniǎodiēxué', valence: 'ji' },
  taibairuying: { hanzi: '太白入熒', pinyin: 'tàibáirùyíng', valence: 'xiong' },
  yingrutaibai: { hanzi: '熒入太白', pinyin: 'yíngrùtàibái', valence: 'xiong' },
  dage: { hanzi: '大格', pinyin: 'dàgé', valence: 'xiong' },
  xingge: { hanzi: '刑格', pinyin: 'xínggé', valence: 'xiong' },
  zhange: { hanzi: '戰格', pinyin: 'zhàngé', valence: 'xiong' },
  tengsheyaojiao: { hanzi: '螣蛇夭矯', pinyin: 'téngshéyāojiǎo', valence: 'xiong' },
  zhuquetoujiang: { hanzi: '朱雀投江', pinyin: 'zhūquètóujiāng', valence: 'xiong' },
  qinglongtaozou: { hanzi: '青龍逃走', pinyin: 'qīnglóngtáozǒu', valence: 'xiong' },
  baihuchangkuang: { hanzi: '白虎猖狂', pinyin: 'báihǔchāngkuáng', valence: 'xiong' },
};

/**
 * The same list at runtime, for the surfaces that have to offer it.
 *
 * A form cannot enumerate a union type, and neither can a command line
 * checking what it was handed. Read off the table rather than written twice,
 * so a configuration added without a fortune fails to compile.
 */
export const PATTERN_IDS: readonly PatternId[] = Object.keys(CONFIGURATIONS) as PatternId[];

/** The fortunes, for a surface that has to offer them all. */
export const VALENCE_IDS: readonly ValenceId[] = Object.keys(VALENCE) as ValenceId[];

/**
 * The fortune of a configuration, without waiting for one to occur.
 *
 * A legend has to name what it is about to show, and a form offering the
 * configurations as criteria has the same problem: 青龍返首 is rare enough
 * that reading the fortune off an occurrence means reading it off a chart
 * that may not have one.
 */
export function valenceOf(id: PatternId): Valence {
  return VALENCE[CONFIGURATIONS[id].valence];
}

/**
 * The name of a configuration, without waiting for one to occur.
 *
 * The companion of `valenceOf`, and there for the same reason it is: a legend
 * has to write 空亡 before any chart has fallen into it. 青龍返首 occurs too
 * rarely to read its own name off an occurrence.
 */
export function patternName(id: PatternId): { hanzi: string; pinyin: string } {
  const { hanzi, pinyin } = CONFIGURATIONS[id];
  return { hanzi, pinyin };
}

/**
 * A configuration the chart has fallen into.
 *
 * Each is **checkable off the plates**: that a gate stands in a palace whose
 * element it controls is something anyone can verify, and so is the name the
 * tradition gives that. The identifiers stay transliterated for the reason
 * they always were — a name is not a sentence — and the fortune travels as
 * `valence`, an identifier and a glyph, never as prose. The gloss beside it
 * is the surface's business, as every other gloss is.
 */
export interface Pattern {
  id: PatternId;
  hanzi: string;
  /** The name said aloud, e.g. `qīnglóngfǎnshǒu`. */
  pinyin: string;
  /** 吉, 凶, or both, as the sources hand it down. */
  valence: Valence;
  /** The palace it occurs in. Absent when it is a property of the whole chart. */
  palace?: number;
  /** Which layer it was found on, where more than one can carry it. */
  layer?: 'gate' | 'star' | 'both';
}

/** A configuration, named and weighed from the one table that holds both. */
function mark(
  id: PatternId,
  rest: Omit<Pattern, 'id' | 'hanzi' | 'pinyin' | 'valence'> = {},
): Pattern {
  const { hanzi, pinyin, valence } = CONFIGURATIONS[id];
  return { id, hanzi, pinyin, valence: VALENCE[valence], ...rest };
}

/** The palace facing another across the board. The centre faces nothing. */
export function opposite(number: number): number | undefined {
  return number === 5 ? undefined : 10 - number;
}

/**
 * Where each instrument is struck (六儀擊刑).
 *
 * Not arbitrary: each decade is headed by a branch, and the palace is the one
 * belonging to the branch that head punishes — 子 punishes 卯, so the
 * instrument of the decade of 甲子 is struck in the palace of 卯. Two of the
 * six punish themselves, and 寅 punishes 巳, which is why 巽 appears twice.
 */
const STRIKE: Record<string, number> = {
  wu: 3, //   戊, decade of 甲子 — 子刑卯 → 震
  ji: 2, //   己, decade of 甲戌 — 戌刑未 → 坤
  geng: 8, // 庚, decade of 甲申 — 申刑寅 → 艮
  xin: 9, //  辛, decade of 甲午 — 午自刑   → 離
  ren: 4, //  壬, decade of 甲辰 — 辰自刑   → 巽
  gui: 4, //  癸, decade of 甲寅 — 寅刑巳 → 巽
};

/**
 * The palace each stem is buried in (入墓).
 *
 * Only these four appear on a plate and have a tomb named for them. The table
 * is transmitted rather than derived, and it does not agree with the twelve
 * stages: those put the tomb of 乙 at 戌, in the palace of Qian, while the
 * Qi Men tradition puts it in Kun with 甲. Some schools give 乙 both.
 */
const TOMB: Record<string, number> = {
  yi: 2, //    乙 — 坤
  bing: 6, //  丙 — 乾
  ding: 8, //  丁 — 艮
  wu: 6, //    戊 — 乾
};

export interface PatternInput {
  earth: ByPalace<Stem>;
  heaven: ByPalace<Stem>;
  stars: ByPalace<Star>;
  gates: ByPalace<Gate>;
  dayStem: Stem;
  hourGanzhi: Ganzhi;
}

/**
 * Every configuration the chart has fallen into.
 *
 * Each is checkable from the plates alone, and each is reported with the
 * palace it happened in wherever that makes sense, and with the fortune its
 * name carries. Nothing here is ranked, ordered, or matched against a
 * question: a chart with six baleful configurations is not a worse chart,
 * because worse is a word about somebody's undertaking and no undertaking is
 * known here.
 *
 * Not implemented: 三奇得使. The sources consulted do not agree on which
 * pairings count, and a rule guessed at would be worse than a rule absent.
 * Nor is the whole of 十干克應 — eleven of its eighty-one cells are here and
 * the rest await a second source; see `STEM_PAIRS` and `docs/sources.md`.
 */
export function findPatterns(input: PatternInput): Pattern[] {
  const found: Pattern[] = [];

  found.push(...voidPalaces(input.hourGanzhi));
  found.push(...tombs(input.heaven));
  found.push(...oppressedGates(input.gates));
  found.push(...struckInstruments(input.earth));
  found.push(...stemPairs(input.earth, input.heaven));
  found.push(...chanting(input.stars, input.gates));

  if (unmetHour(input.dayStem, input.hourGanzhi)) {
    found.push(mark('wubuyu'));
  }

  return found;
}

/**
 * The palaces of the two branches the hour's decade leaves out (空亡).
 *
 * The decade already knows which two they are; this only says where they sit.
 */
function voidPalaces(hourGanzhi: Ganzhi): Pattern[] {
  const { empty } = decade(hourGanzhi);
  const numbers = new Set(empty.map((branch: Branch) => palaceOfBranch(branch)));
  return [...numbers].map((number) => mark('kongwang', { palace: number }));
}

/** Stems standing in the palace they are buried in (入墓). */
function tombs(heaven: ByPalace<Stem>): Pattern[] {
  const found: Pattern[] = [];
  for (const [number, stem] of Object.entries(heaven)) {
    if (TOMB[stem.id] === Number(number)) {
      found.push(mark('rumu', { palace: Number(number) }));
    }
  }
  return found;
}

/**
 * Gates standing in a palace whose element they control (門迫).
 *
 * Derived, not tabulated. The published list — the gates of metal in the
 * palaces of wood, the gate of water in the palace of fire, and so on — is
 * exactly the set this produces, which makes the list a test.
 *
 * Said in terms of `relationOf` rather than of `CONTROLS` directly, because
 * that is what it is: 門迫 is the name and the fortune the tradition attaches
 * to one of the five 門宮 relations, and the palace already reports which of
 * the five it is. Two spellings of one rule could disagree; one cannot.
 */
function oppressedGates(gates: ByPalace<Gate>): Pattern[] {
  const found: Pattern[] = [];
  for (const [number, gate] of Object.entries(gates)) {
    const here = palace(Number(number));
    const gateElement = palace(gate.home).element;
    if (relationOf(gateElement, here.element).id === 'woke') {
      found.push(mark('menpo', { palace: Number(number), layer: 'gate' }));
    }
  }
  return found;
}

/** Instruments standing where their decade's branch is punished (擊刑). */
function struckInstruments(earth: ByPalace<Stem>): Pattern[] {
  const found: Pattern[] = [];
  for (const [number, stem] of Object.entries(earth)) {
    if (STRIKE[stem.id] === Number(number)) {
      found.push(mark('jixing', { palace: Number(number) }));
    }
  }
  return found;
}

/**
 * 十干克應 — the stem above standing over the stem below.
 *
 * The whole table has eighty-one cells, nine stems over nine, and this holds
 * eleven of them. **The rest are absent on purpose**, and the reason is the
 * project's standing one: a pairing enters here only when at least two
 * independent sources name it the same way. Which sources, and what each of
 * these was checked against one by one, is in `docs/sources.md`.
 *
 * Two things the cross-check turned up, both worth knowing before adding to
 * this table:
 *
 * - **The pairing is agreed far more widely than the name.** Every source
 *   consulted marks 庚 over 癸 as a named configuration; the 煙波釣叟歌 and
 *   the Japanese tradition call it 大格, while one modern implementation calls
 *   it 太白沖刑. The same happens for 刑格 and for 戰格. Where the sources
 *   name a pairing differently, the classical verse decides — it is the text
 *   the others descend from — and the divergence is recorded in the sources
 *   document rather than silently resolved.
 * - **一 pairing was excluded for exactly this reason.** 庚 over 壬 is named
 *   小格 by one source alone; the verse fetched does not carry it and the
 *   other sources call it something else. One source is not enough for a
 *   table that cannot be derived, and 三奇得使 is the precedent.
 *
 * 甲 never appears on a plate — it is concealed by the instrument of its
 * decade — so the verse's 丙加甲 and 甲加丙 are read here as 丙 over 戊 and
 * 戊 over 丙, 戊 being the instrument of 甲子.
 */
const STEM_PAIRS: readonly { above: string; below: string; id: PatternId }[] = [
  // 丙加甲兮鳥跌穴，甲加丙兮龍返首 — 煙波釣叟歌
  { above: 'bing', below: 'wu', id: 'feiniaodiexue' },
  { above: 'wu', below: 'bing', id: 'qinglongfanshou' },
  // 六庚加丙白入熒，六丙加庚熒入白 — 煙波釣叟歌
  { above: 'geng', below: 'bing', id: 'taibairuying' },
  { above: 'bing', below: 'geng', id: 'yingrutaibai' },
  // 庚加癸兮為大格，加己為刑最不宜 — 煙波釣叟歌
  { above: 'geng', below: 'gui', id: 'dage' },
  { above: 'geng', below: 'ji', id: 'xingge' },
  // 戰格: not in the verse fetched; named alike by two independent sources.
  { above: 'geng', below: 'geng', id: 'zhange' },
  // 六癸加丁蛇夭矯，六丁加癸雀投江 — 煙波釣叟歌
  { above: 'gui', below: 'ding', id: 'tengsheyaojiao' },
  { above: 'ding', below: 'gui', id: 'zhuquetoujiang' },
  // 六乙加辛龍逃走，六辛加乙虎猖狂 — 煙波釣叟歌
  { above: 'yi', below: 'xin', id: 'qinglongtaozou' },
  { above: 'xin', below: 'yi', id: 'baihuchangkuang' },
];

function stemPairs(earth: ByPalace<Stem>, heaven: ByPalace<Stem>): Pattern[] {
  const found: Pattern[] = [];
  for (const [key, above] of Object.entries(heaven)) {
    const number = Number(key);
    const below = earth[number] as Stem;
    for (const pair of STEM_PAIRS) {
      if (above.id === pair.above && below.id === pair.below) {
        found.push(mark(pair.id, { palace: number }));
      }
    }
  }
  return found;
}

/**
 * Whether the whole board has come home, or turned to face itself.
 *
 * 伏吟 is every gate or star standing in the palace it belongs to; 反吟 is
 * every one standing in the palace facing it. The centre is left out of the
 * count: it faces nothing, and its star never moves.
 */
function chanting(stars: ByPalace<Star>, gates: ByPalace<Gate>): Pattern[] {
  const gateEntries = Object.entries(gates);
  const starEntries = Object.entries(stars).filter(([number]) => Number(number) !== 5);

  const gatesHome = gateEntries.every(([number, gate]) => gate.home === Number(number));
  const starsHome = starEntries.every(([number, star]) => star.home === Number(number));
  const gatesFacing = gateEntries.every(([number, gate]) => opposite(gate.home) === Number(number));
  const starsFacing = starEntries.every(([number, star]) => opposite(star.home) === Number(number));

  const found: Pattern[] = [];
  if (gatesHome || starsHome) {
    found.push(mark('fuyin', { layer: layerOf(gatesHome, starsHome) }));
  }
  if (gatesFacing || starsFacing) {
    found.push(mark('fanyin', { layer: layerOf(gatesFacing, starsFacing) }));
  }
  return found;
}

function layerOf(gate: boolean, star: boolean): 'gate' | 'star' | 'both' {
  return gate && star ? 'both' : gate ? 'gate' : 'star';
}

/**
 * The hour that does not meet (五不遇時): the hour's stem controls the day's,
 * and the two share a polarity.
 *
 * The rule and the transmitted list of ten pairings — 甲日庚午時, 乙日辛巳時,
 * and so on — are the same thing said twice, so the list is a test of the
 * rule rather than data beside it.
 */
export function unmetHour(dayStem: Stem, hourGanzhi: Ganzhi): boolean {
  const hourStem = hourGanzhi.stem;
  return CONTROLS[hourStem.element] === dayStem.element && hourStem.yang === dayStem.yang;
}

