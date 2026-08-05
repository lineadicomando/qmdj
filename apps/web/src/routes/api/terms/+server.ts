import { solarTermsOfYear, systemTimezone } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { ephemerisContext } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/terms?year=2024&timezone=Asia/Shanghai`
 *
 * The zone is part of the question, not a formality: a term beginning at
 * 00:30 in Shanghai began the previous evening in Rome, so the two answers
 * date it to different days.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const year = Number(url.searchParams.get('year') ?? new Date().getUTCFullYear());
    const timezone = url.searchParams.get('timezone') ?? systemTimezone();
    const terms = solarTermsOfYear(year, timezone, ephemerisContext());

    // A past year's terms never change, so this one may be cached anywhere.
    setHeaders({ 'cache-control': 'public, max-age=604800' });
    return json({ year, timezone, terms });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
