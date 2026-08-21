import { matchRuns, scanCharts, type ScanMatch } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { ephemerisContext, readCriteria, readInterval } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/moments?from=2026-09-01&to=2026-09-08&locationId=1816670&gate=kaimen`
 *
 * Every chart standing over an interval, narrowed to the palaces that answer
 * what was asked. The oldest use of the art, and the one the other endpoints
 * cannot serve: they answer *what stands now*, and this answers *when, and
 * which way to face*.
 *
 * It reports and does not rank. There is no score in the answer and no order
 * but time, because a palace answering a question is a fact and a palace
 * being a good place to be is a reading.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { from, to, place, options, label } = readInterval(url.searchParams);
    const criteria = readCriteria(url.searchParams);

    const runs = scanCharts(from, to, place, options, ephemerisContext());
    const matches = matchRuns(runs, criteria);

    // `private`, as a chart is: the answer is a pure function of its URL, but
    // that URL holds a place and a stretch of somebody's calendar. An
    // interval is always fixed — `from` and `to` are required — so unlike a
    // chart there is no "now" here to keep something stale.
    setHeaders({ 'cache-control': 'private, max-age=86400' });

    return json({
      from: from.date,
      to: to.date,
      place: label ?? null,
      timezone: place.timezone,
      criteria,
      scanned: runs.length,
      moments: matches.map(project),
    });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};

/**
 * One run, cut down to what the answer is about.
 *
 * A month is some four hundred runs, and a whole chart apiece would be
 * megabytes of nine palaces to deliver an answer about one. The engine does
 * not make that cut — it does not know which palace the caller cared about
 * until the criteria say — so the surface makes it, and says here that it did.
 *
 * `/api/qimen` remains the way to get the whole board for any of these
 * moments, which is what the interface links each row to.
 */
function project({ run, palaces }: ScanMatch): unknown {
  const numbers = new Set(palaces.map((cell) => cell.palace.number));

  return {
    start: run.start,
    end: run.end,
    hour: run.chart.moment.pillars.hour,
    ju: run.chart.ju,
    palaces,
    // The configurations of the palaces that answered, and those of the whole
    // board. The ones that fell elsewhere are about a palace nobody asked for.
    patterns: run.chart.patterns.filter(
      (found) => found.palace === undefined || numbers.has(found.palace),
    ),
  };
}
