import { computeBazi } from '@shipan/core';
import { json } from '@sveltejs/kit';
import { ephemerisContext, momentIsFixed, readInteger, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/bazi?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * `gender` is optional and only the decade luck cycles depend on it. Without
 * it the pillars are complete and the cycles are absent — which is the
 * correct answer, not a degraded one.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { moment, label } = readMoment(url.searchParams);

    const gender = url.searchParams.get('gender');
    const cycles = readInteger(url.searchParams, 'cycles');
    const options: Parameters<typeof computeBazi>[1] = {};
    if (gender === 'male' || gender === 'female') options.gender = gender;
    if (cycles !== undefined) options.cycles = Math.min(12, Math.max(1, cycles));

    const bazi = computeBazi(moment, options, ephemerisContext());

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return json({ moment, bazi, place: label ?? null });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
