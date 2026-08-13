import type { Gender } from './bazi/luck.js';
import { nayin, type Nayin } from './bazi/nayin.js';
import { lodge, palace, palaceOfBranch, type Palace } from './dunjia/palaces.js';
import { decadeInstrument } from './dunjia/plates.js';
import { relationOf, type Relation } from './dunjia/relation.js';
import type { QimenChart } from './dunjia/index.js';
import { ChartError } from './errors.js';
import { ganzhiOf, yearGanzhi, type Ganzhi, type Stem } from './ganzhi.js';
import type { Moment } from './pillars.js';

/**
 * 年命 — where the person stands in a chart of a moment.
 *
 * This is the classical way a birth enters Qi Men, and it is the reverse of a
 * natal chart: the chart is cast for the moment, and the birth is looked *up*
 * inside it. 《遁甲演義》(程道生, Ming, 卷一 遁甲錯誤須檢點) states it as a
 * defect of a reading that leaves it out —
 *
 * > 夫用遁之法，不推本命行年，未見精妙，必人生年命乘本局吉星奇門生旺之方，
 * > 始得神將護持，無不利也。若命入囚死刑克之宮，而又加以惡星，雖所謀事合生
 * > 開吉門，終不為美。
 *
 * — and the 四庫全書提要 of the same work singles the doctrine out as one
 * other books do not carry. Two things are placed: 本命, the year pillar of
 * the birth, which never moves, and 行年, the year being lived, which moves by
 * one pair a year. Both are placed on the chart in front of the reader.
 *
 * **What is placed, and nothing beyond it.** This module says where the two
 * pairs fall and what stands there. It does not say whether that is good: the
 * text's own verdicts — 生旺之方, 囚死刑克之宮 — need a question to have been
 * asked, and the strengths, the relations and the configurations the chart
 * already carries are what a reader weighs them with. `purposes.ts` declines
 * the same thing for the same reason.
 */

/**
 * The two names, for the surfaces that print them.
 *
 * They are names of things and not labels: 本命 is běnmìng to every reader,
 * and the catalog supplies only the gloss beside it.
 */
export const NIANMING_NAMES = {
  benming: { hanzi: '本命', pinyin: 'běnmìng' },
  xingnian: { hanzi: '行年', pinyin: 'xíngnián' },
} as const;

/** How the years lived are counted, which the sources do not agree on. */
export interface NianmingOptions {
  /**
   * Which count of years the 行年 steps by.
   *
   * `sui` is 虛歲, the traditional count the rule was written for: a birth
   * arrives at one, and every turn of the year pillar adds another, so the
   * year of a birth is already 行年 one — 丙寅 for a man, 壬申 for a woman.
   * `turns` counts only the turns themselves, which is what a reader who
   * thinks in completed years expects and is one less throughout.
   *
   * Neither is an age in the registry sense: both step at the boundary of the
   * year pillar, which is 立春 or the lunar new year according to
   * `yearBoundary`, and neither knows anybody's birthday.
   */
  count: 'sui' | 'turns';
}

export const DEFAULT_NIANMING_OPTIONS: NianmingOptions = { count: 'sui' };

/**
 * A palace, and where it is read when it is the centre.
 *
 * The centre has no direction, no gate and no spirit, so a pair that falls
 * there is read at the palace the centre lodges in (寄宮) — the same detour
 * the chief gate already makes. Reported rather than silently substituted:
 * standing in the centre is not the same fact as standing in Kun.
 */
export interface Seat {
  palace: Palace;
  /** Present only when `palace` is the centre. */
  host?: Palace;
}

/** One pair placed on a chart. */
export interface Placement {
  /** The pair being placed: the year of the birth, or the year being lived. */
  ganzhi: Ganzhi;
  /**
   * The stem looked for on the plates.
   *
   * 甲 never appears on a plate — that is what 遁甲 names — so a pair headed
   * by it is looked up under the instrument concealing its decade, exactly as
   * an hour of 甲 already is.
   */
  stem: Stem;
  /** True when the pair's own stem is 甲 and `stem` is the instrument for it. */
  concealed: boolean;
  /** Where that stem lies on the earth plate, which the ju alone fixed. */
  earth: Seat;
  /** Where the heaven plate has carried it. */
  heaven: Seat;
  /**
   * The palace the pair's branch moors in (泊宮).
   *
   * A branch is a direction before it is anything else, so this is the ground
   * the 演義 has the pair standing on — 泊宮生克刑害 — and it is fixed by the
   * branch alone, without reference to the plates.
   */
  mooring: Palace;
  /** The image of the pair (納音). */
  nayin: Nayin;
  /**
   * How that image stands to the ground it moors on.
   *
   * 「須以納音而論歲月用支」: the 演義 weighs a 本命 or a 行年 by its 納音
   * and not by the phase of its stem, which is why the image is read here and
   * carried in full.
   */
  nayinRelation: Relation;
}

export interface Nianming {
  /** 本命 — the year pillar of the birth, placed. */
  benming: Placement;
  /**
   * 行年 — the year being lived, placed.
   *
   * Absent unless the years and the direction of the count are both known: the
   * rule runs one way from 寅 and the other from 申, and there is no reading
   * of it that does without that.
   */
  xingnian?: Placement;
  /** The years counted, under `options.count`. Absent with the 行年. */
  years?: number;
  options: NianmingOptions;
}

/**
 * The pair of a year lived (行年).
 *
 * 「男順寅，女逆申，皆起五虎」: the count opens at 丙寅 and runs forwards, or
 * at 壬申 and runs backwards, one pair to a year. The two openings are not two
 * conventions but one — 五虎遁 gives the month of 寅 in a 甲 or 己 year as
 * 丙寅 and its month of 申 as 壬申 — which is why a rule stated in four
 * characters lands on those two pairs and no others.
 *
 * `years` is a count and not an age: what it counts is decided by
 * `NianmingOptions.count`, and a caller that has an age in completed years
 * hands over one number and a caller thinking in 虛歲 another.
 *
 * The direction is the tradition's rule, stated as the tradition states it,
 * and it is the only thing `gender` is read for here — the same as in
 * `luckCycles`.
 */
export function xingnianGanzhi(years: number, gender: Gender): Ganzhi {
  if (!Number.isInteger(years) || years < 1) {
    throw new ChartError('YEARS_OUT_OF_RANGE', { years });
  }
  // 丙寅 is index 2 and 壬申 index 8; the first year is the opening pair
  // itself, so the step is one short of the count.
  return gender === 'male' ? ganzhiOf(2 + (years - 1)) : ganzhiOf(8 - (years - 1));
}

/**
 * The years between a birth and a chart, counted at the turn of the year
 * pillar.
 *
 * Not a birthday: the year pillar turns at 立春 or at the lunar new year — the
 * chart's own `yearBoundary` decides which — and this counts those turns. Two
 * people born eleven months apart can therefore be one year apart here, which
 * is what 虛歲 has always done and what the 行年 rule was written to step by.
 */
export function yearsLived(
  birth: Moment,
  chart: Moment,
  options: NianmingOptions = DEFAULT_NIANMING_OPTIONS,
): number {
  const turns = sexagenaryYearOf(chart) - sexagenaryYearOf(birth);
  if (turns < 0) throw new ChartError('BIRTH_AFTER_CHART');
  return options.count === 'sui' ? turns + 1 : turns;
}

/**
 * The sexagenary year a moment falls in, as a number.
 *
 * The pillars carry the pair and not the year it belongs to, and the pair
 * alone repeats every sixty years. The civil year of the instant names two
 * candidates — it, and the one before it, for an instant that has not reached
 * 立春 — and only one of them bears the pillar the moment already computed.
 */
function sexagenaryYearOf(moment: Moment): number {
  const civil = Number(moment.local.slice(0, 4));
  return yearGanzhi(civil).index === moment.pillars.year.index ? civil : civil - 1;
}

/**
 * Places a birth, and optionally the year it is living, on a chart.
 *
 * The chart is somebody's question or somebody's hour; what this adds is where
 * the person stands inside it. Nothing in the chart moves: 本命 and 行年 are
 * looked up on the plates that were already laid.
 */
export function nianmingOf(
  chart: QimenChart,
  request: { birthYear: Ganzhi; years?: number; gender?: Gender },
  options: NianmingOptions = DEFAULT_NIANMING_OPTIONS,
): Nianming {
  const nianming: Nianming = {
    benming: placeOn(chart, request.birthYear),
    options,
  };
  if (request.years !== undefined && request.gender) {
    nianming.xingnian = placeOn(chart, xingnianGanzhi(request.years, request.gender));
    nianming.years = request.years;
  }
  return nianming;
}

function placeOn(chart: QimenChart, ganzhi: Ganzhi): Placement {
  const concealed = ganzhi.stem.id === 'jia';
  const stem = concealed ? decadeInstrument(ganzhi) : ganzhi.stem;
  const mooring = palace(palaceOfBranch(ganzhi.branch));
  const image = nayin(ganzhi);
  return {
    ganzhi,
    stem,
    concealed,
    earth: seatOf(chart, (contents) => contents.earth.index === stem.index),
    heaven: seatOf(chart, (contents) => contents.heaven.index === stem.index),
    mooring,
    nayin: image,
    nayinRelation: relationOf(image.element, mooring.element),
  };
}

function seatOf(
  chart: QimenChart,
  matches: (contents: QimenChart['palaces'][number]) => boolean,
): Seat {
  const found = chart.palaces.find(matches);
  // Nine palaces hold nine stems, which is every stem but 甲, and 甲 was
  // replaced before the search. There is nothing to fall through to.
  if (!found) throw new Error('the stem is on neither plate, which cannot happen');
  const seat: Seat = { palace: found.palace };
  if (found.palace.number === 5) seat.host = palace(lodge(5));
  return seat;
}
