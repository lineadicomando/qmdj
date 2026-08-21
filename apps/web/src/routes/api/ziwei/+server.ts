import { DEFAULT_ZIWEI_OPTIONS, computeZiwei } from '@shipan/core';
import { json } from '@sveltejs/kit';
import { momentIsFixed, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/ziwei?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * The twelve seats of a 紫微斗數 board, counted from a birth.
 *
 * No ephemeris is passed, and that is not an omission: this board reads a
 * lunar date, an hour branch and a year pillar, all of which the moment
 * already carries. Nothing on it is a position.
 *
 * `gender` is optional and only the 大限, the 小限 and the two rings of twelve
 * depend on it. Without it the seats are complete and those four are absent,
 * which is the correct answer rather than a degraded one — the same bargain
 * `/api/bazi` makes with its luck cycles.
 *
 * `private` in a cache, never `public`: the address holds somebody's date,
 * time and place of birth.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { moment, label } = readMoment(url.searchParams);

    const gender = url.searchParams.get('gender');
    const options = { ...DEFAULT_ZIWEI_OPTIONS };
    if (gender === 'male' || gender === 'female') options.gender = gender;

    const ziwei = computeZiwei(moment, options);

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return json({ moment, ziwei, place: label ?? null });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
