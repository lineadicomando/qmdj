import { DEFAULT_LIUREN_OPTIONS, liurenBoard, type LiurenOptions } from '@shipan/core';
import { json } from '@sveltejs/kit';
import { momentIsFixed, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/liuren?date=2026-08-14&time=14:30&locationId=3169070&guiren=chou`
 *
 * The 大六壬 board for an instant — the second of the 三式, laid on the same
 * moment the first is. It takes the term and the pillars the moment already
 * carries and reaches for no ephemeris of its own.
 *
 * `private` like the chart and never `public`: it is a pure function of its
 * URL, but the key of a shared cache would hold somebody's date, time and
 * place. Cached only when the moment is fixed — a board asked for *now* is a
 * different board a minute later.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { moment, label } = readMoment(url.searchParams);

    const options: LiurenOptions = { ...DEFAULT_LIUREN_OPTIONS };
    const guiren = url.searchParams.get('guiren');
    if (guiren === 'chou' || guiren === 'wei') options.guiren = guiren;

    const board = liurenBoard(
      { term: moment.solarTerm.term, day: moment.pillars.day, hour: moment.hourBranch },
      options,
    );

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return json({ moment, liuren: board, place: label ?? null });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
