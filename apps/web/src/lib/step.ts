/**
 * Moving a moment by a unit of the calendar.
 *
 * A Qi Men chart is consulted for an instant one moves around — the next
 * double hour, the same hour tomorrow — which the four pillars of a birth
 * never are. So this exists for the chart alone.
 *
 * The arithmetic is on the wall clock and stays there. It is the same string
 * a person typed into the form and the same one the address carries, and the
 * engine is what turns it into an instant: doing any of that here would put a
 * second, worse conversion beside the one that was tested against an
 * independent implementation. A day step that lands on an hour a timezone
 * skipped is therefore not handled here either — the engine already says so,
 * in a warning that carries a code.
 *
 * Fifteen lines rather than a date library: the client imports only types
 * from the engine, and four buttons do not justify putting Luxon in front of
 * everyone who opens the page.
 */

/** 時辰, 日, 月, 年 — the units the chart is stepped by. */
export type Unit = 'shichen' | 'day' | 'month' | 'year';

export interface Wall {
  /** `YYYY-MM-DD`. */
  date: string;
  /** `HH:mm`. */
  time: string;
}

/** A double hour is two hours: twelve of them make the day, one per branch. */
const SHICHEN_MINUTES = 120;
const DAY_MINUTES = 24 * 60;

export function step(from: Wall, unit: Unit, by: number): Wall {
  const [year, month, day] = from.date.split('-').map(Number);
  const [hour, minute] = (from.time || '00:00').split(':').map(Number);

  if (unit === 'shichen') {
    // A fixed two hours on the clock lands on the next branch, because the
    // branches are two hours wide and the step keeps its place inside one.
    const total = hour * 60 + minute + SHICHEN_MINUTES * by;
    const carried = Math.floor(total / DAY_MINUTES);
    const minutes = total - carried * DAY_MINUTES;
    return {
      date: carried === 0 ? from.date : addDays(year, month, day, carried),
      time: clock(Math.floor(minutes / 60), minutes % 60),
    };
  }

  if (unit === 'day') {
    return { date: addDays(year, month, day, by), time: clock(hour, minute) };
  }

  // Months and years are not a number of days, and the day of the month may
  // not exist in the month arrived at: the 31st of January a month on is the
  // end of February, not the 3rd of March.
  const months = year * 12 + (month - 1) + (unit === 'month' ? by : by * 12);
  const target = { year: Math.floor(months / 12), month: (months % 12) + 1 };
  return {
    date: date(target.year, target.month, Math.min(day, daysInMonth(target.year, target.month))),
    time: clock(hour, minute),
  };
}

function addDays(year: number, month: number, day: number, by: number): string {
  const at = midnightUtc(year, month, day);
  at.setUTCDate(at.getUTCDate() + by);
  return date(at.getUTCFullYear(), at.getUTCMonth() + 1, at.getUTCDate());
}

function daysInMonth(year: number, month: number): number {
  const at = midnightUtc(year, month, 1);
  at.setUTCMonth(at.getUTCMonth() + 1, 0);
  return at.getUTCDate();
}

/**
 * `Date` as a calendar and nothing else — UTC throughout, so the machine's own
 * zone cannot reach the result. Built through `setUTCFullYear` because the
 * `Date.UTC` shorthand reads a year of 98 as 1998.
 */
function midnightUtc(year: number, month: number, day: number): Date {
  const at = new Date(0);
  at.setUTCFullYear(year, month - 1, day);
  at.setUTCHours(0, 0, 0, 0);
  return at;
}

function date(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
}

function clock(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
