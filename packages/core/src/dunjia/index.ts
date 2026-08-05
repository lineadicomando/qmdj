import { STEMS, type Stem } from '../ganzhi.js';
import type { Moment } from '../pillars.js';
import type { ChartOptions, Element } from '../types.js';
import { determineJu, type Ju } from './ju.js';
import { findPatterns, type Pattern } from './patterns.js';
import { seasonElement, strengthOf, type Strength } from './strength.js';
import { PALACES, lodge, palace, type Palace } from './palaces.js';
import {
  chiefGate,
  chiefGatePalace,
  chiefStar,
  earthPlate,
  gatePlate,
  heavenPlate,
  palaceOf,
  spiritPlate,
  starPlate,
  type Gate,
  type Spirit,
  type Star,
} from './plates.js';

/** Everything standing over one palace. */
export interface PalaceContents {
  palace: Palace;
  /** The stem lying on the earth plate. Fixed by the ju alone. */
  earth: Stem;
  /** The stem the heaven plate brought here. */
  heaven: Stem;
  star: Star;
  /** Absent in the centre, which has no gate. */
  gate?: Gate;
  /** Absent in the centre, which has no spirit. */
  spirit?: Spirit;
  /** How the star stands to the season (旺相休囚死). */
  starStrength: Strength;
  /** How the gate does. Absent with the gate. */
  gateStrength?: Strength;
}

export interface QimenChart {
  /** The instant, its pillars and everything they were derived from. */
  moment: Moment;
  ju: Ju;
  /** The instrument concealing 甲 for the hour's decade (符首). */
  instrument: Stem;
  /** The hour's stem, or the instrument standing in for it when it is 甲. */
  hourStem: Stem;
  /** The chief and its palace (值符). */
  chief: { star: Star; palace: Palace };
  /** The chief gate and where it came to rest (值使). */
  chiefGate: { gate: Gate; palace: Palace };
  /** The nine palaces, in Luoshu order. */
  palaces: PalaceContents[];
  /** The element the season belongs to, which the strengths are read against. */
  season: Element;
  /** The configurations the chart has fallen into. Facts, never verdicts. */
  patterns: Pattern[];
  /** The options this chart was cast with. A saved chart must reproduce. */
  options: ChartOptions;
}

/**
 * Casts a Qi Men chart for a moment.
 *
 * The order is forced by what depends on what:
 *
 * 1. The term and the yuan fix the dun and the ju number.
 * 2. The ju alone fixes the earth plate — nine stems, one to a palace.
 * 3. The hour's decade names the instrument concealing 甲, and the palace that
 *    instrument occupies names the chief and the chief gate.
 * 4. The heaven plate turns until the instrument stands over the hour's stem,
 *    carrying the nine stars with it.
 * 5. The gates do not turn but fly, counting through the Luoshu numbers.
 * 6. The spirits follow the chief, clockwise or not according to the dun.
 *
 * Nothing here is interpreted. Which gate stands over which palace is a fact
 * about the arrangement; whether that is a good thing to know belongs to
 * whoever reads it.
 */
export function computeQimenChart(moment: Moment, options: ChartOptions): QimenChart {
  const ju = determineJu(moment, options);
  const earth = earthPlate(ju.yang, ju.number);

  const hourGanzhi = moment.pillars.hour;
  const instrument = decadeInstrumentOf(hourGanzhi.index);
  // 甲 never appears on a plate: where the hour's stem is 甲, the instrument
  // concealing it stands in. That is what 遁甲 names.
  const hourStem = hourGanzhi.stem.id === 'jia' ? instrument : hourGanzhi.stem;

  const heaven = heavenPlate(earth, instrument, hourStem);
  const stars = starPlate(earth, instrument, hourStem);

  const chief = chiefStar(earth, instrument);
  const chiefPalace = palaceOf(earth, hourStem);

  const gate = chiefGate(earth, instrument);
  const gatePalaceNumber = chiefGatePalace(earth, instrument, hourGanzhi, ju.yang);
  const gates = gatePlate(gate, gatePalaceNumber);
  const spirits = spiritPlate(chiefPalace, ju.yang);

  const season = seasonElement(moment.pillars.month.branch);

  const palaces = PALACES.map((current): PalaceContents => {
    const star = stars[current.number] as Star;
    const contents: PalaceContents = {
      palace: current,
      earth: earth[current.number] as Stem,
      heaven: heaven[current.number] as Stem,
      star,
      // A star and a gate take the element of the palace they belong to at
      // rest, so nothing extra has to be stored to weigh them.
      starStrength: strengthOf(palace(star.home).element, season),
    };
    const gateHere = gates[current.number];
    const spiritHere = spirits[current.number];
    if (gateHere) {
      contents.gate = gateHere;
      contents.gateStrength = strengthOf(palace(gateHere.home).element, season);
    }
    if (spiritHere) contents.spirit = spiritHere;
    return contents;
  });

  const patterns = findPatterns({
    earth,
    heaven,
    stars,
    gates,
    dayStem: moment.pillars.day.stem,
    hourGanzhi,
  });

  return {
    moment,
    ju,
    instrument,
    hourStem,
    chief: { star: chief, palace: palace(chiefPalace) },
    chiefGate: { gate, palace: palace(gatePalaceNumber) },
    palaces,
    season,
    patterns,
    options,
  };
}

/** 甲子戊, 甲戌己, 甲申庚, 甲午辛, 甲辰壬, 甲寅癸. */
function decadeInstrumentOf(ganzhiIndex: number): Stem {
  const order = ['wu', 'ji', 'geng', 'xin', 'ren', 'gui'];
  return STEMS.find((stem) => stem.id === order[Math.floor(ganzhiIndex / 10)]) as Stem;
}

export { determineJu, YUAN_HANZI, type Ju, type Yuan } from './ju.js';
export {
  PATTERN_IDS,
  branchesOf,
  findPatterns,
  opposite,
  unmetHour,
  type Pattern,
  type PatternId,
} from './patterns.js';
export {
  seasonElement,
  strengthOf,
  type Strength,
  type StrengthId,
} from './strength.js';
export {
  CENTRE_HOST,
  FLIGHT_ASCENDING,
  FLIGHT_DESCENDING,
  PALACES,
  RING_CLOCKWISE,
  RING_COUNTERCLOCKWISE,
  lodge,
  orbitFrom,
  palace,
  step,
  type ByPalace,
  type Direction,
  type Palace,
  type PalaceId,
} from './palaces.js';
export {
  GATES,
  SPIRITS_YANG,
  SPIRITS_YIN,
  SPIRIT_IDS,
  STARS,
  earthPlate,
  palaceOf,
  type Gate,
  type GateId,
  type Spirit,
  type SpiritId,
  type Star,
  type StarId,
} from './plates.js';
