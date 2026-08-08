import { STEMS, type Ganzhi, type Stem } from '../ganzhi.js';
import {
  FLIGHT_ASCENDING,
  FLIGHT_DESCENDING,
  RING_CLOCKWISE,
  RING_COUNTERCLOCKWISE,
  lodge,
  orbitFrom,
  step,
  type ByPalace,
} from './palaces.js';

/**
 * The nine stars, each named by the palace it belongs to when nothing has
 * moved. The centre's star travels with the centre and is read at its host.
 */
export interface Star {
  id: StarId;
  hanzi: string;
  /** The name said aloud, e.g. `tiānpéng`. */
  pinyin: string;
  /** Luoshu number of the palace the star sits in at rest. */
  home: number;
}

export type StarId =
  | 'tianpeng' | 'tianrui' | 'tianchong' | 'tianfu' | 'tianqin'
  | 'tianxin' | 'tianzhu' | 'tianren' | 'tianying';

export const STARS: readonly Star[] = [
  { id: 'tianpeng', hanzi: '天蓬', pinyin: 'tiānpéng', home: 1 },
  { id: 'tianrui', hanzi: '天芮', pinyin: 'tiānruì', home: 2 },
  { id: 'tianchong', hanzi: '天沖', pinyin: 'tiānchōng', home: 3 },
  { id: 'tianfu', hanzi: '天輔', pinyin: 'tiānfǔ', home: 4 },
  { id: 'tianqin', hanzi: '天禽', pinyin: 'tiānqín', home: 5 },
  { id: 'tianxin', hanzi: '天心', pinyin: 'tiānxīn', home: 6 },
  { id: 'tianzhu', hanzi: '天柱', pinyin: 'tiānzhù', home: 7 },
  { id: 'tianren', hanzi: '天任', pinyin: 'tiānrèn', home: 8 },
  { id: 'tianying', hanzi: '天英', pinyin: 'tiānyīng', home: 9 },
];

/**
 * The eight gates.
 *
 * Two of them collide once the tones are dropped — 驚門 is jīng and 景門 is
 * jǐng — so those two, and only those two, carry the tone number in their
 * identifier. Every other identifier in the project stays toneless; `pinyin`
 * is where the tone is kept for all of them, and is what a reader is shown.
 */
export interface Gate {
  id: GateId;
  hanzi: string;
  /** The name said aloud. Where the identifiers collide, this is what parts them. */
  pinyin: string;
  /** Luoshu number of the palace the gate belongs to at rest. */
  home: number;
}

export type GateId =
  | 'xiumen' | 'shengmen' | 'shangmen' | 'dumen'
  | 'jing3men' | 'simen' | 'jing1men' | 'kaimen';

/** At rest, in the order the gates are always recited and always laid out. */
export const GATES: readonly Gate[] = [
  { id: 'xiumen', hanzi: '休門', pinyin: 'xiūmén', home: 1 },
  { id: 'shengmen', hanzi: '生門', pinyin: 'shēngmén', home: 8 },
  { id: 'shangmen', hanzi: '傷門', pinyin: 'shāngmén', home: 3 },
  { id: 'dumen', hanzi: '杜門', pinyin: 'dùmén', home: 4 },
  { id: 'jing3men', hanzi: '景門', pinyin: 'jǐngmén', home: 9 },
  { id: 'simen', hanzi: '死門', pinyin: 'sǐmén', home: 2 },
  { id: 'jing1men', hanzi: '驚門', pinyin: 'jīngmén', home: 7 },
  { id: 'kaimen', hanzi: '開門', pinyin: 'kāimén', home: 6 },
];

export interface Spirit {
  id: SpiritId;
  hanzi: string;
  /** The name said aloud, e.g. `zhífú`. */
  pinyin: string;
}

export type SpiritId =
  | 'zhifu' | 'tengshe' | 'taiyin' | 'liuhe'
  | 'gouchen' | 'baihu' | 'zhuque' | 'xuanwu'
  | 'jiudi' | 'jiutian';

/**
 * The eight spirits, in the order they are laid out from the chief.
 *
 * The fifth and sixth differ between a yang chart and a yin one in the
 * convention followed here: 勾陳 and 朱雀 preside while the yang half of the
 * year runs, 白虎 and 玄武 while the yin half does. Other traditions use one
 * pair throughout, which is a divergence this engine does not yet expose.
 */
export const SPIRITS_YANG: readonly Spirit[] = [
  { id: 'zhifu', hanzi: '值符', pinyin: 'zhífú' },
  { id: 'tengshe', hanzi: '滕蛇', pinyin: 'téngshé' },
  { id: 'taiyin', hanzi: '太陰', pinyin: 'tàiyīn' },
  { id: 'liuhe', hanzi: '六合', pinyin: 'liùhé' },
  { id: 'gouchen', hanzi: '勾陳', pinyin: 'gōuchén' },
  { id: 'zhuque', hanzi: '朱雀', pinyin: 'zhūquè' },
  { id: 'jiudi', hanzi: '九地', pinyin: 'jiǔdì' },
  { id: 'jiutian', hanzi: '九天', pinyin: 'jiǔtiān' },
];

export const SPIRITS_YIN: readonly Spirit[] = [
  { id: 'zhifu', hanzi: '值符', pinyin: 'zhífú' },
  { id: 'tengshe', hanzi: '滕蛇', pinyin: 'téngshé' },
  { id: 'taiyin', hanzi: '太陰', pinyin: 'tàiyīn' },
  { id: 'liuhe', hanzi: '六合', pinyin: 'liùhé' },
  { id: 'baihu', hanzi: '白虎', pinyin: 'báihǔ' },
  { id: 'xuanwu', hanzi: '玄武', pinyin: 'xuánwǔ' },
  { id: 'jiudi', hanzi: '九地', pinyin: 'jiǔdì' },
  { id: 'jiutian', hanzi: '九天', pinyin: 'jiǔtiān' },
];

/**
 * Every spirit a chart can show, which is ten and not eight.
 *
 * A chart shows eight, but *which* eight depends on the dun: 勾陳 and 朱雀
 * stand in a yang chart and never in a yin one, 白虎 and 玄武 the other way
 * about. A surface offering only the yang list makes 白虎 unaskable for half
 * the charts of the year, which is why this list exists rather than either
 * plate serving as one.
 */
export const SPIRIT_IDS: readonly SpiritId[] = [
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
];

/**
 * The order the stems are laid down on the earth plate: the six instruments,
 * then the three marvels in reverse.
 *
 * 甲 is not among them. It is the hidden one — the 遁甲 the whole art is named
 * for — and travels concealed under whichever instrument leads its decade.
 */
const LAYOUT_ORDER = ['wu', 'ji', 'geng', 'xin', 'ren', 'gui', 'ding', 'bing', 'yi'];

/**
 * The earth plate (地盤) of a ju.
 *
 * Derived rather than tabulated. Starting from the palace the ju is numbered
 * for, the nine stems are laid one to a palace, counting up through the
 * Luoshu numbers in a yang chart and down in a yin one. Every published table
 * of the eighteen arrangements falls out of those two sentences.
 */
export function earthPlate(yang: boolean, ju: number): ByPalace<Stem> {
  const plate: ByPalace<Stem> = {};
  for (let i = 0; i < LAYOUT_ORDER.length; i += 1) {
    const offset = yang ? i : -i;
    const number = (((ju - 1 + offset) % 9) + 9) % 9 + 1;
    plate[number] = STEMS.find((candidate) => candidate.id === LAYOUT_ORDER[i]) as Stem;
  }
  return plate;
}

/** The palace a stem occupies on the earth plate. */
export function palaceOf(plate: ByPalace<Stem>, stem: Stem): number {
  for (const [number, occupant] of Object.entries(plate)) {
    if (occupant.index === stem.index) return Number(number);
  }
  throw new Error(`stem ${stem.hanzi} is not on the earth plate`);
}

/**
 * The instrument that conceals 甲 for a given decade (旬首 → 符首).
 *
 * The sixty pairs fall into six decades, each headed by a 甲. That 甲 does not
 * appear on the plate; the instrument standing in for it does, and it is the
 * thing the chief and the chief gate are found from.
 */
export function decadeInstrument(hourGanzhi: Ganzhi): Stem {
  const head = Math.floor(hourGanzhi.index / 10);
  // 甲子戊, 甲戌己, 甲申庚, 甲午辛, 甲辰壬, 甲寅癸.
  const order = ['wu', 'ji', 'geng', 'xin', 'ren', 'gui'];
  return STEMS.find((stem) => stem.id === order[head]) as Stem;
}

/**
 * Turns a plate so that what stood over one palace comes to stand over
 * another, carrying everything else round with it.
 *
 * The turn runs along the ring of eight, so the centre neither moves nor
 * receives. A palace named as the centre is read at its host instead — the
 * ring has no place for it.
 */
function turn<T>(source: ByPalace<T>, from: number, to: number): ByPalace<T> {
  const take = orbitFrom(RING_CLOCKWISE, lodge(from));
  const give = orbitFrom(RING_CLOCKWISE, lodge(to));

  const result: ByPalace<T> = {};
  for (let i = 0; i < take.length; i += 1) {
    result[give[i] as number] = source[take[i] as number] as T;
  }
  result[5] = source[5] as T;
  return result;
}

/**
 * The heaven plate (天盤): the earth plate turned until the instrument that
 * conceals 甲 stands over the palace of the hour's stem.
 *
 * This single turn is what makes the chart the chart. Everything above the
 * palaces moves with it.
 */
export function heavenPlate(
  earth: ByPalace<Stem>,
  instrument: Stem,
  hourStem: Stem,
): ByPalace<Stem> {
  return turn(earth, palaceOf(earth, instrument), palaceOf(earth, hourStem));
}

/** The nine stars, turned by the same amount as the heaven plate. */
export function starPlate(
  earth: ByPalace<Stem>,
  instrument: Stem,
  hourStem: Stem,
): ByPalace<Star> {
  const atRest: ByPalace<Star> = {};
  for (const star of STARS) atRest[star.home] = star;
  return turn(atRest, palaceOf(earth, instrument), palaceOf(earth, hourStem));
}

/**
 * The star standing over the instrument's palace: the chief (值符).
 *
 * Not lodged. When the instrument sits in the centre the chief is 天禽, and
 * saying so is more use than reporting the star of the palace it would be
 * read at — a surface that wants the lodged reading can ask for it.
 */
export function chiefStar(earth: ByPalace<Stem>, instrument: Stem): Star {
  const home = palaceOf(earth, instrument);
  return STARS.find((star) => star.home === home) as Star;
}

/** The gate belonging to the instrument's palace: the chief gate (值使). */
export function chiefGate(earth: ByPalace<Stem>, instrument: Stem): Gate {
  // Lodged, unlike the chief star: the centre has no gate at all, so there is
  // nothing there to name.
  const home = lodge(palaceOf(earth, instrument));
  return GATES.find((gate) => gate.home === home) as Gate;
}

/**
 * Where the chief gate comes to rest.
 *
 * Unlike the plates, the gates *fly*: from the instrument's palace they count
 * on through the Luoshu numbers, one step for each pair the hour stands into
 * its decade. Counting up in a yang chart and down in a yin one, and passing
 * through the centre, which the turning ring never does.
 */
export function chiefGatePalace(
  earth: ByPalace<Stem>,
  instrument: Stem,
  hourGanzhi: Ganzhi,
  yang: boolean,
): number {
  const flight = yang ? FLIGHT_ASCENDING : FLIGHT_DESCENDING;
  const from = palaceOf(earth, instrument);
  const within = hourGanzhi.index % 10;
  return lodge(step(flight, from, within));
}

/**
 * The eight gates, laid from the chief gate round the ring.
 *
 * Their order among themselves never changes — rest, life, harm, block,
 * view, death, shock, open — so naming where the chief gate landed names
 * every other.
 */
export function gatePlate(chief: Gate, chiefPalace: number): ByPalace<Gate> {
  const start = GATES.findIndex((gate) => gate.id === chief.id);
  const ring = orbitFrom(RING_CLOCKWISE, chiefPalace);

  const plate: ByPalace<Gate> = {};
  for (let i = 0; i < ring.length; i += 1) {
    plate[ring[i] as number] = GATES[(start + i) % GATES.length] as Gate;
  }
  return plate;
}

/**
 * The eight spirits, laid from the chief's palace.
 *
 * They follow the ring clockwise in a yang chart and counter-clockwise in a
 * yin one — the one place in the whole layout where the two halves of the
 * year genuinely run in opposite directions.
 */
export function spiritPlate(chiefPalace: number, yang: boolean): ByPalace<Spirit> {
  const spirits = yang ? SPIRITS_YANG : SPIRITS_YIN;
  const ring = orbitFrom(yang ? RING_CLOCKWISE : RING_COUNTERCLOCKWISE, lodge(chiefPalace));

  const plate: ByPalace<Spirit> = {};
  for (let i = 0; i < ring.length; i += 1) {
    plate[ring[i] as number] = spirits[i] as Spirit;
  }
  return plate;
}
