import { normalize360, sunCrossing, sunLongitude, type EphemerisContext } from './ephemeris.js';
import { ChartError } from './errors.js';
import { fromJulianDay } from './time.js';

/**
 * A solar term is a *kind* of instant, not an instant: it is defined by the
 * ecliptic longitude the Sun reaches, and it recurs every year.
 */
export interface SolarTermDefinition {
  /** Toneless pinyin, the stable identifier. */
  id: SolarTermId;
  /** The name. Not a translation — every reader expects to see it. */
  hanzi: string;
  /** The name said aloud, tones and all, e.g. `lìchūn`. */
  pinyin: string;
  /** Apparent solar longitude at which the term begins, in degrees. */
  longitude: number;
  /**
   * `jie` (節) or `qi` (氣), alternating.
   *
   * The distinction is not decorative: the month pillar changes at a `jie`
   * and ignores a `qi` entirely, while the lunar calendar places its
   * intercalary month by counting `qi`. Two different calendars read two
   * different halves of the same list.
   */
  kind: 'jie' | 'qi';
  /**
   * Earthly branch of the month this term opens, `undefined` for a `qi`.
   *
   * Lichun opens the month of the Tiger, which is why the branch of the first
   * month is 寅 and not 子.
   */
  monthBranch?: number;
}

export type SolarTermId =
  | 'lichun' | 'yushui' | 'jingzhe' | 'chunfen' | 'qingming' | 'guyu'
  | 'lixia' | 'xiaoman' | 'mangzhong' | 'xiazhi' | 'xiaoshu' | 'dashu'
  | 'liqiu' | 'chushu' | 'bailu' | 'qiufen' | 'hanlu' | 'shuangjiang'
  | 'lidong' | 'xiaoxue' | 'daxue' | 'dongzhi' | 'xiaohan' | 'dahan';

/**
 * The twenty-four terms, in the order the year runs through them.
 *
 * The list starts at Lichun rather than at the winter solstice because that
 * is where the year of the pillars begins. Longitudes run 315°, 330°, 345°,
 * 0°, 15° … — the wrap past 0° sits inside the list, not at its edge.
 */
export const SOLAR_TERMS: readonly SolarTermDefinition[] = [
  { id: 'lichun', hanzi: '立春', pinyin: 'lìchūn', longitude: 315, kind: 'jie', monthBranch: 2 },
  { id: 'yushui', hanzi: '雨水', pinyin: 'yǔshuǐ', longitude: 330, kind: 'qi' },
  { id: 'jingzhe', hanzi: '驚蟄', pinyin: 'jīngzhé', longitude: 345, kind: 'jie', monthBranch: 3 },
  { id: 'chunfen', hanzi: '春分', pinyin: 'chūnfēn', longitude: 0, kind: 'qi' },
  { id: 'qingming', hanzi: '清明', pinyin: 'qīngmíng', longitude: 15, kind: 'jie', monthBranch: 4 },
  { id: 'guyu', hanzi: '穀雨', pinyin: 'gǔyǔ', longitude: 30, kind: 'qi' },
  { id: 'lixia', hanzi: '立夏', pinyin: 'lìxià', longitude: 45, kind: 'jie', monthBranch: 5 },
  { id: 'xiaoman', hanzi: '小滿', pinyin: 'xiǎomǎn', longitude: 60, kind: 'qi' },
  // 種 is zhòng here, the sowing and not the seed.
  { id: 'mangzhong', hanzi: '芒種', pinyin: 'mángzhòng', longitude: 75, kind: 'jie', monthBranch: 6 },
  { id: 'xiazhi', hanzi: '夏至', pinyin: 'xiàzhì', longitude: 90, kind: 'qi' },
  { id: 'xiaoshu', hanzi: '小暑', pinyin: 'xiǎoshǔ', longitude: 105, kind: 'jie', monthBranch: 7 },
  { id: 'dashu', hanzi: '大暑', pinyin: 'dàshǔ', longitude: 120, kind: 'qi' },
  { id: 'liqiu', hanzi: '立秋', pinyin: 'lìqiū', longitude: 135, kind: 'jie', monthBranch: 8 },
  // 處 is chǔ here, the stopping and not the place.
  { id: 'chushu', hanzi: '處暑', pinyin: 'chǔshǔ', longitude: 150, kind: 'qi' },
  { id: 'bailu', hanzi: '白露', pinyin: 'báilù', longitude: 165, kind: 'jie', monthBranch: 9 },
  { id: 'qiufen', hanzi: '秋分', pinyin: 'qiūfēn', longitude: 180, kind: 'qi' },
  { id: 'hanlu', hanzi: '寒露', pinyin: 'hánlù', longitude: 195, kind: 'jie', monthBranch: 10 },
  { id: 'shuangjiang', hanzi: '霜降', pinyin: 'shuāngjiàng', longitude: 210, kind: 'qi' },
  { id: 'lidong', hanzi: '立冬', pinyin: 'lìdōng', longitude: 225, kind: 'jie', monthBranch: 11 },
  { id: 'xiaoxue', hanzi: '小雪', pinyin: 'xiǎoxuě', longitude: 240, kind: 'qi' },
  { id: 'daxue', hanzi: '大雪', pinyin: 'dàxuě', longitude: 255, kind: 'jie', monthBranch: 0 },
  { id: 'dongzhi', hanzi: '冬至', pinyin: 'dōngzhì', longitude: 270, kind: 'qi' },
  { id: 'xiaohan', hanzi: '小寒', pinyin: 'xiǎohán', longitude: 285, kind: 'jie', monthBranch: 1 },
  { id: 'dahan', hanzi: '大寒', pinyin: 'dàhán', longitude: 300, kind: 'qi' },
];

/** An occurrence: a term, and the instant at which it began. */
export interface SolarTerm {
  term: SolarTermDefinition;
  /** Julian Day in Universal Time. */
  julianDayUT: number;
}

/**
 * The longest a term can last, in days.
 *
 * The Sun covers 15° in between roughly 14.7 days near perihelion and 15.8
 * near aphelion; the bound only has to be safely above the maximum, since it
 * is used to start a backward search.
 */
const MAX_TERM_LENGTH = 17;

/** The definition whose longitude the Sun has last reached at `longitude`. */
function definitionAt(longitude: number): SolarTermDefinition {
  const stepped = Math.floor(normalize360(longitude) / 15) * 15;
  const definition = SOLAR_TERMS.find((term) => term.longitude === stepped);
  // Unreachable: the list holds every multiple of 15 below 360.
  if (!definition) throw new Error(`no solar term at longitude ${stepped}`);
  return definition;
}

/**
 * The term in force at an instant, and when it began.
 *
 * "In force" means the last term the Sun has passed, not the nearest one:
 * a chart cast three days before Lichun still belongs to the previous year.
 */
export function solarTermAt(julianDayUT: number, context: EphemerisContext): SolarTerm {
  const definition = definitionAt(sunLongitude(julianDayUT, context));
  return {
    term: definition,
    julianDayUT: sunCrossing(definition.longitude, julianDayUT - MAX_TERM_LENGTH, context),
  };
}

/**
 * The `jie` (節) in force at an instant, and when it began.
 *
 * Only the twelve `jie` open a month. When the term in force is a `qi`, the
 * month began at the `jie` 15° before it.
 */
export function jieAt(julianDayUT: number, context: EphemerisContext): SolarTerm {
  const current = definitionAt(sunLongitude(julianDayUT, context));
  const definition =
    current.kind === 'jie' ? current : definitionAt(normalize360(current.longitude - 15));

  return {
    term: definition,
    // A `qi` can have started up to a full term ago, so the search window is
    // two terms wide rather than one.
    julianDayUT: sunCrossing(definition.longitude, julianDayUT - 2 * MAX_TERM_LENGTH, context),
  };
}

/**
 * The most terms that may be asked for at once.
 *
 * Twenty-four to a year, so a little over sixteen years. The bound is here
 * rather than at a surface for the reason `MAX_SCAN_DAYS` is: an unbounded
 * loop in a pure function is a trap laid for whoever calls it next. It is
 * **refused** rather than truncated — a list cut off at four hundred reads
 * exactly like an interval that held four hundred.
 */
export const MAX_TERMS = 400;

/**
 * Every term beginning within a Julian Day interval, in chronological order.
 *
 * The bounds are half-open, `[from, to)`, so that consecutive intervals
 * neither drop a term nor report one twice.
 */
export function solarTermsBetween(
  from: number,
  to: number,
  context: EphemerisContext,
): SolarTerm[] {
  // Checked against the widest a term ever runs, so the interval that is
  // refused is one that could not have fitted under the bound however the
  // terms fell inside it.
  if (to - from > MAX_TERMS * MAX_TERM_LENGTH) {
    throw new ChartError('INTERVAL_TOO_LONG', {
      days: Math.round(to - from),
      maximum: MAX_TERMS * MAX_TERM_LENGTH,
    });
  }

  const terms: SolarTerm[] = [];
  let index = SOLAR_TERMS.indexOf(definitionAt(sunLongitude(from, context)));
  let cursor = from;

  // A crossing search never returns an instant before its starting point, so
  // stepping the cursor forward each time both advances and terminates.
  while (terms.length < MAX_TERMS) {
    index = (index + 1) % SOLAR_TERMS.length;
    const definition = SOLAR_TERMS[index] as SolarTermDefinition;
    const instant = sunCrossing(definition.longitude, cursor, context);
    if (instant >= to) break;
    terms.push({ term: definition, julianDayUT: instant });
    cursor = instant + 1;
  }

  return terms;
}

/**
 * The twenty-four terms falling in a Gregorian year, as seen from a timezone.
 *
 * The zone matters: a term that begins at 00:30 in Shanghai began the
 * previous evening in Rome, and the two calendars therefore date it to
 * different days — occasionally to different years.
 */
export function solarTermsOfYear(
  year: number,
  timezone: string,
  context: EphemerisContext,
): SolarTerm[] {
  const start = localMidnightJulianDay(year, timezone);
  const end = localMidnightJulianDay(year + 1, timezone);
  return solarTermsBetween(start, end, context);
}

function localMidnightJulianDay(year: number, timezone: string): number {
  const millis = fromJulianDay(2440587.5, timezone) // any anchor; only the zone is used
    .set({ year, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
    .toMillis();
  return millis / 86_400_000 + 2440587.5;
}
