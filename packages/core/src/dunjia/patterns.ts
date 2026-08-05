import { CONTROLS } from '../bazi/relations.js';
import { BRANCHES, decade, type Branch, type Ganzhi, type Stem } from '../ganzhi.js';
import { palace, type ByPalace } from './palaces.js';
import type { Gate, Star } from './plates.js';

export type PatternId =
  | 'kongwang'
  | 'rumu'
  | 'menpo'
  | 'jixing'
  | 'fuyin'
  | 'fanyin'
  | 'wubuyu'
  | 'qinglongfanshou'
  | 'feiniaodiexue';

/**
 * The same list at runtime, for the surfaces that have to offer it.
 *
 * A form cannot enumerate a union type, and neither can a command line
 * checking what it was handed. Declared beside the type so that the two
 * cannot drift apart without the compiler noticing.
 */
export const PATTERN_IDS: readonly PatternId[] = [
  'kongwang',
  'rumu',
  'menpo',
  'jixing',
  'fuyin',
  'fanyin',
  'wubuyu',
  'qinglongfanshou',
  'feiniaodiexue',
];

/**
 * A configuration the chart has fallen into.
 *
 * These are **structural facts**. That a gate stands in a palace whose
 * element it controls is something anyone can check off the plates; that this
 * is a bad place to be is a reading, and the engine does not offer one. The
 * identifiers are names of arrangements, not verdicts, which is why they are
 * transliterated rather than translated into a judgement.
 */
export interface Pattern {
  id: PatternId;
  hanzi: string;
  /** The palace it occurs in. Absent when it is a property of the whole chart. */
  palace?: number;
  /** Which layer it was found on, where more than one can carry it. */
  layer?: 'gate' | 'star' | 'both';
}

/** The palace facing another across the board. The centre faces nothing. */
export function opposite(number: number): number | undefined {
  return number === 5 ? undefined : 10 - number;
}

/**
 * The palace a branch belongs to.
 *
 * Twelve branches over eight outer palaces: the four that hold two are the
 * corners, which is why 艮 takes both 丑 and 寅.
 */
const BRANCH_PALACE: Record<number, number> = {
  0: 1, //  子 — 坎
  1: 8, //  丑 — 艮
  2: 8, //  寅 — 艮
  3: 3, //  卯 — 震
  4: 4, //  辰 — 巽
  5: 4, //  巳 — 巽
  6: 9, //  午 — 離
  7: 2, //  未 — 坤
  8: 2, //  申 — 坤
  9: 7, //  酉 — 兌
  10: 6, // 戌 — 乾
  11: 6, // 亥 — 乾
};

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
 * palace it happened in wherever that makes sense. Nothing is ranked and
 * nothing is judged.
 *
 * Not implemented: 三奇得使. The sources consulted do not agree on which
 * pairings count, and a rule guessed at would be worse than a rule absent.
 */
export function findPatterns(input: PatternInput): Pattern[] {
  const found: Pattern[] = [];

  found.push(...voidPalaces(input.hourGanzhi));
  found.push(...tombs(input.heaven));
  found.push(...oppressedGates(input.gates));
  found.push(...struckInstruments(input.earth));
  found.push(...auspiciousPairs(input.earth, input.heaven));
  found.push(...chanting(input.stars, input.gates));

  if (unmetHour(input.dayStem, input.hourGanzhi)) {
    found.push({ id: 'wubuyu', hanzi: '五不遇時' });
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
  const numbers = new Set(empty.map((branch: Branch) => BRANCH_PALACE[branch.index] as number));
  return [...numbers].map((number) => ({ id: 'kongwang' as const, hanzi: '空亡', palace: number }));
}

/** Stems standing in the palace they are buried in (入墓). */
function tombs(heaven: ByPalace<Stem>): Pattern[] {
  const found: Pattern[] = [];
  for (const [number, stem] of Object.entries(heaven)) {
    if (TOMB[stem.id] === Number(number)) {
      found.push({ id: 'rumu', hanzi: '入墓', palace: Number(number) });
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
 */
function oppressedGates(gates: ByPalace<Gate>): Pattern[] {
  const found: Pattern[] = [];
  for (const [number, gate] of Object.entries(gates)) {
    const here = palace(Number(number));
    const gateElement = palace(gate.home).element;
    if (CONTROLS[gateElement] === here.element) {
      found.push({ id: 'menpo', hanzi: '門迫', palace: Number(number), layer: 'gate' });
    }
  }
  return found;
}

/** Instruments standing where their decade's branch is punished (擊刑). */
function struckInstruments(earth: ByPalace<Stem>): Pattern[] {
  const found: Pattern[] = [];
  for (const [number, stem] of Object.entries(earth)) {
    if (STRIKE[stem.id] === Number(number)) {
      found.push({ id: 'jixing', hanzi: '擊刑', palace: Number(number) });
    }
  }
  return found;
}

/** 青龍返首 — heaven's 戊 over earth's 丙; 飛鳥跌穴 — heaven's 丙 over earth's 戊. */
function auspiciousPairs(earth: ByPalace<Stem>, heaven: ByPalace<Stem>): Pattern[] {
  const found: Pattern[] = [];
  for (const [key, above] of Object.entries(heaven)) {
    const number = Number(key);
    const below = earth[number] as Stem;
    if (above.id === 'wu' && below.id === 'bing') {
      found.push({ id: 'qinglongfanshou', hanzi: '青龍返首', palace: number });
    }
    if (above.id === 'bing' && below.id === 'wu') {
      found.push({ id: 'feiniaodiexue', hanzi: '飛鳥跌穴', palace: number });
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
    found.push({ id: 'fuyin', hanzi: '伏吟', layer: layerOf(gatesHome, starsHome) });
  }
  if (gatesFacing || starsFacing) {
    found.push({ id: 'fanyin', hanzi: '反吟', layer: layerOf(gatesFacing, starsFacing) });
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

/** The branch a palace holds, for the palaces that hold only one. */
export function branchesOf(number: number): Branch[] {
  return BRANCHES.filter((branch) => BRANCH_PALACE[branch.index] === number);
}
