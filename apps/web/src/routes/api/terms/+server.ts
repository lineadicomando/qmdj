import { solarTermsOfYear, systemTimezone } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { ephemerisContext, readYear } from '$lib/server/params';
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
    // Bounded by `readYear`, which is where the bounds live for every endpoint
    // that takes one. The default is the **civil** year and not the 太乙 one:
    // this is a table of the calendar, and «the terms of 2026» names the year
    // the terms are dated in rather than a year cut at one of them.
    const asked = readYear(url.searchParams);
    const year = asked ?? new Date().getUTCFullYear();
    const timezone = url.searchParams.get('timezone') ?? systemTimezone();
    const terms = solarTermsOfYear(year, timezone, ephemerisContext());

    // A past year's terms never change, so this one may be cached anywhere —
    // but an address that named no year is a function of the clock, and one
    // kept for a week goes on serving the old year into January.
    setHeaders({ 'cache-control': asked === undefined ? 'public, max-age=3600' : 'public, max-age=604800' });
    return json({ year, timezone, terms });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
