import { sunCrossing, type EphemerisContext } from './ephemeris.js';
import { dayGanzhi, BRANCHES, type Branch, type Ganzhi } from './ganzhi.js';
import { calendarDayNumber } from './lunar.js';
import { jieAt, SOLAR_TERMS, type SolarTermDefinition } from './solar-terms.js';

/**
 * 曆注 — what a printed almanac puts under a date.
 *
 * The layer dunjia was always read beside. A chart chooses an hour and a
 * direction; the almanac is the page that choice was weighed against, and a
 * reader of one who cannot see the other is missing the half the tradition
 * printed first.
 *
 * **It is not a board.** Nothing is laid, nothing is asked, and the same page
 * belongs to everybody who opens it on the same day — which is why it takes no
 * options, sits in no consultation, and enters no prompt. See `PLAN.md` § 4
 * phase 15.
 *
 * **And it stops where the rest of this engine stops.** The 協紀 hands every
 * one of these down inside its 宜忌 — this day suits, this day forbids — and a
 * 宜忌 is advice: ordering days, dating an act, telling somebody what to do.
 * What travels here is the name of the day's officer and the arithmetic that
 * put it there. What each officer is *for* stays in the book.
 */

export type OfficerId =
  | 'jian' | 'chu' | 'man' | 'ping'
  | 'ding' | 'zhi' | 'po' | 'wei'
  | 'cheng' | 'shou' | 'kai' | 'bi';

export interface Officer {
  id: OfficerId;
  hanzi: string;
  pinyin: string;
}

/**
 * 建除十二神, in the order they run.
 *
 * The order is the rule: 建 opens on the day whose branch is the month's, and
 * the other eleven follow it round the twelve branches. 《協紀辨方書》卷四,
 * quoting the 厯書: 「厯家以建除滿平定執破危成收開閉凡十二日周而復始……其法從
 * 月建上起建，與斗杓所指相應。如正月建寅則寅日起建，順行十二辰是也」.
 */
export const OFFICERS: readonly Officer[] = [
  { id: 'jian', hanzi: '建', pinyin: 'jiàn' },
  { id: 'chu', hanzi: '除', pinyin: 'chú' },
  { id: 'man', hanzi: '滿', pinyin: 'mǎn' },
  { id: 'ping', hanzi: '平', pinyin: 'píng' },
  { id: 'ding', hanzi: '定', pinyin: 'dìng' },
  { id: 'zhi', hanzi: '執', pinyin: 'zhí' },
  { id: 'po', hanzi: '破', pinyin: 'pò' },
  { id: 'wei', hanzi: '危', pinyin: 'wēi' },
  { id: 'cheng', hanzi: '成', pinyin: 'chéng' },
  { id: 'shou', hanzi: '收', pinyin: 'shōu' },
  { id: 'kai', hanzi: '開', pinyin: 'kāi' },
  { id: 'bi', hanzi: '閉', pinyin: 'bì' },
];

export interface Jianchu {
  /** The officer holding the day. */
  officer: Officer;
  /** The day the page describes, reckoned on the calendar's own meridian. */
  day: Ganzhi;
  /** The branch of the solar month the count opened from. */
  monthBranch: Branch;
  /** The 節 that opened that month. */
  jie: SolarTermDefinition;
  /**
   * True on the second of the two days a 交節 gives the same officer.
   *
   * 《協紀辨方書》卷四: 「每月交節則疊兩值日」. It is not a second rule and
   * nothing here special-cases it — the month branch advances on the same day
   * the day branch does, so the difference between them, which is the officer,
   * stands still. The flag is reported because a reader who sees 執 twice
   * should be able to tell a doubling from a mistake.
   */
  doubled: boolean;
}

/**
 * The officer a day carries, from the month's branch and the day's.
 *
 * The whole rule, and it is subtraction: 建 stands where the two branches
 * meet and the count runs forward from there.
 */
export function officerOf(monthBranch: Branch, dayBranch: Branch): Officer {
  const step = (dayBranch.index - monthBranch.index + 12) % 12;
  return OFFICERS[step] as Officer;
}

/**
 * The 建除 page for an instant.
 *
 * It takes an instant and no options, which is the whole of what makes it a
 * page rather than a chart: `dayBoundary` and `trueSolarTime` move the hour
 * and the day a chart is read at, and they do not move what an almanac
 * printed.
 */
export function jianchuAt(julianDayUT: number, context: EphemerisContext): Jianchu {
  const dayNumber = calendarDayNumber(julianDayUT);
  const jie = monthOpeningOn(julianDayUT, dayNumber, context);
  const day = dayGanzhi(dayNumber);
  const monthBranch = BRANCHES[jie.term.monthBranch as number] as Branch;

  return {
    officer: officerOf(monthBranch, day.branch),
    day,
    monthBranch,
    jie: jie.term,
    doubled: calendarDayNumber(jie.julianDayUT) === dayNumber,
  };
}

/**
 * The 節 whose month this **day** belongs to, which is not always the one the
 * instant belongs to.
 *
 * This is the difference between the almanac and the pillars, and it is the
 * whole of it. A month pillar turns at the instant the Sun reaches the 節; a
 * page turns on the date, so the whole of the 節's day belongs to the new
 * month — a chart cast at nine in the morning of a 節 that strikes at eight in
 * the evening carries the old month pillar and the new month's officer, and
 * both are right about different questions.
 *
 * That the doubling falls out of this rather than being written into it is the
 * reason to compute it this way: 「每月交節則疊兩值日」 is a description of
 * what the day grain does, not an extra clause to remember.
 */
function monthOpeningOn(
  julianDayUT: number,
  dayNumber: number,
  context: EphemerisContext,
): { term: SolarTermDefinition; julianDayUT: number } {
  const current = jieAt(julianDayUT, context);
  if (calendarDayNumber(current.julianDayUT) === dayNumber) return current;

  // The instant may still be sitting in the hours of a 節's own day before the
  // Sun reaches it. Only the next one can be on this date; anything later is a
  // month away.
  const nextLongitude = (current.term.longitude + 30) % 360;
  const definition = SOLAR_TERMS.find(
    (term) => term.longitude === nextLongitude,
  ) as SolarTermDefinition;
  const next = sunCrossing(definition.longitude, current.julianDayUT + 1, context);

  return calendarDayNumber(next) === dayNumber
    ? { term: definition, julianDayUT: next }
    : current;
}
