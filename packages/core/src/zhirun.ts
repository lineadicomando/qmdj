import { sunCrossing, type EphemerisContext } from './ephemeris.js';
import { dayGanzhi } from './ganzhi.js';
import { SOLAR_TERMS, type SolarTermId } from './solar-terms.js';

/**
 * Where a day stands in the bookkeeping of the 置閏 method.
 *
 * Under zhirun the ju does not follow the term the Sun is actually in: it
 * follows the day's place in the sexagenary cycle. Days run in five-day
 * stretches headed by a 甲 or 己 day (the 符頭), and three stretches — always
 * upper, middle, lower in that order — make a fifteen-day block headed by
 * 甲子, 甲午, 己卯 or 己酉. Each block serves one term and takes that term's
 * three ju numbers; because a block is 15 days and a term averages a little
 * more, the blocks drift ahead of the terms (超神), and the drift is paid
 * off by an intercalated block (閏) that repeats 芒種 or 大雪, after which
 * the blocks trail the terms instead (接氣).
 */
export interface ZhirunAssignment {
  /**
   * The term whose ju the day's block serves. Under 超神 it can be a term
   * that has not yet begun; it is not the term in force at the instant.
   */
  term: SolarTermId;
  /** 0 upper, 1 middle, 2 lower — the stretch's place in its block. */
  yuanIndex: 0 | 1 | 2;
  /** True inside an intercalated block, which repeats 芒種 or 大雪. */
  leap: boolean;
}

/**
 * The heads of the fifteen-day blocks are the four 上元 futou — 甲子 (0),
 * 己卯 (15), 甲午 (30), 己酉 (45) — which is to say the days whose sexagenary
 * index is a multiple of fifteen. The sixty-day cycle is exactly four blocks.
 */
const BLOCK = 15;

/**
 * How many whole days the block head may precede the solstice's civil day.
 *
 * This is the contested pin of the whole method. The classical rule says to
 * intercalate when the 超神 has grown to nine days or more, which is read here
 * as a gap of nine, bounding the head to at most eight days before the
 * solstice and, the blocks being fifteen days apart, to at most six after it —
 * a window of exactly one block, so the head a solstice takes is never
 * ambiguous. Sources that say "ten" instead of "nine" shift the window by one
 * day, and a Japanese tradition that says "the futou nearest the solstice"
 * shifts it the other way; the three coincide except when the head falls
 * exactly at the edge. `kinqimen`, the one runnable reference, intercalates at
 * nine that way, and so does this table.
 *
 * **《奇門遁甲統宗》卷一 置閏法 counts its nine inclusively**, which makes it a
 * gap of eight, and its dated worked example over 1717–1719 intercalates one
 * day earlier than this. Every day pillar in that example is reproduced here
 * and the two part in exactly one cell — a solstice at position 8. The value
 * is left at 8 because one text against one runnable reference is one against
 * one; `docs/sources.md` § 置閏 has the whole of it, and this is the first
 * thing to reopen if a second witness turns up.
 */
const MAX_CHAOSHEN = 8;

/**
 * Assigns a day to its term under the 置閏 method.
 *
 * `day` is the Julian Day Number the day pillar was read from — the futou is
 * a fact about the day pillar, so it follows the same reckoning, whatever
 * `dayBoundary` and `trueSolarTime` made of it. The solstices are placed on
 * civil days through `dayOf`, in the chart's own zone: the bookkeeping runs
 * on the chart's calendar exactly as the day pillar does, which keeps the
 * chart consistent with itself and means a chart far from 120°E can turn a
 * page one civil day away from the Chinese almanac.
 *
 * The assignment needs no history. Pinning each solstice's block inside its
 * one-block window fixes every block between two consecutive solstices:
 * twelve blocks serve the twelve terms in order, and a thirteenth, when the
 * window forces one, is the intercalation — it repeats the term before the
 * solstice, 芒種 or 大雪, which is the only place the tradition allows it.
 */
export function zhirunAssignment(args: {
  /** Julian Day Number the day pillar was read from. */
  day: number;
  /** The instant, used only to find the solstices around it. */
  julianDayUT: number;
  /** An instant's civil day, in the same reckoning as `day`. */
  dayOf: (julianDayUT: number) => number;
  context: EphemerisContext;
}): ZhirunAssignment {
  const { day, julianDayUT, dayOf, context } = args;

  const cyclePosition = dayGanzhi(day).index % BLOCK;
  const blockHead = day - cyclePosition;
  const yuanIndex = Math.floor(cyclePosition / 5) as 0 | 1 | 2;

  // The solstices bracketing the block, each pinned to its own block head.
  // The one to anchor on is the latest whose head is not after this block's:
  // under 超神 that can be a solstice that has not happened yet.
  const solstices = solsticesAround(julianDayUT, context).map((solstice) => ({
    ...solstice,
    head: pinnedHead(dayOf(solstice.julianDayUT)),
  }));

  const anchorAt = solstices.findLastIndex((s) => s.head <= blockHead);
  const anchor = solstices[anchorAt];
  const next = solstices[anchorAt + 1];
  // Unreachable: the search spans more than a year back and a year forward,
  // so a solstice head on either side of any block in between is guaranteed.
  if (!anchor || !next) throw new Error('no solstice found around the moment');

  const blocksIn = (span: number): number => {
    // Block heads all lie on the multiples of fifteen in the day cycle, so a
    // span between two of them is always a whole number of blocks.
    if (span % BLOCK !== 0) throw new Error(`blocks out of step by ${span % BLOCK} days`);
    return span / BLOCK;
  };

  const n = blocksIn(blockHead - anchor.head);
  const between = blocksIn(next.head - anchor.head);

  // Twelve blocks carry the twelve terms from one solstice to the other.
  // A thirteenth is the intercalation: it repeats the twelfth term — 芒種
  // before 夏至, 大雪 before 冬至 — rather than reaching the solstice early.
  const leap = between === 13 && n === 12;
  const termIndex = (anchor.termIndex + (leap ? 11 : n)) % SOLAR_TERMS.length;
  const term = SOLAR_TERMS[termIndex]?.id as SolarTermId;

  return { term, yuanIndex, leap };
}

/** The solstice's block head: the one 上元 futou inside its one-block window. */
function pinnedHead(solsticeDay: number): number {
  const position = dayGanzhi(solsticeDay).index % BLOCK;
  // A head up to MAX_CHAOSHEN days back keeps the 超神 under the classical
  // bound; further back than that, the intercalation has already pushed the
  // assignment on, and the head lands after the solstice instead (接氣).
  return position <= MAX_CHAOSHEN
    ? solsticeDay - position
    : solsticeDay - position + BLOCK;
}

interface Solstice {
  julianDayUT: number;
  /** Index into SOLAR_TERMS: 夏至 or 冬至. */
  termIndex: number;
}

const XIAZHI_INDEX = SOLAR_TERMS.findIndex((t) => t.id === 'xiazhi');
const DONGZHI_INDEX = SOLAR_TERMS.findIndex((t) => t.id === 'dongzhi');

/**
 * Every solstice from over a year before an instant to over a year after,
 * in chronological order.
 *
 * The reach is deliberate: the anchoring solstice can stand almost half a
 * year before the moment, or — when the moment's block already serves a
 * coming solstice — some days after it, and the solstice after the anchor is
 * needed too, another half year on.
 */
function solsticesAround(julianDayUT: number, context: EphemerisContext): Solstice[] {
  const found: Solstice[] = [];
  for (const [longitude, termIndex] of [
    [90, XIAZHI_INDEX],
    [270, DONGZHI_INDEX],
  ] as const) {
    let cursor = julianDayUT - 400;
    for (;;) {
      const crossing = sunCrossing(longitude, cursor, context);
      if (crossing > julianDayUT + 400) break;
      found.push({ julianDayUT: crossing, termIndex });
      cursor = crossing + 1;
    }
  }
  return found.sort((a, b) => a.julianDayUT - b.julianDayUT);
}
