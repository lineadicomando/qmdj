import { DEFAULT_TAIYI_OPTIONS, taiyiBoard } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { readInteger } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/taiyi?year=2026`
 *
 * The 太乙 board of a year in the 年計: 太乙 itself walking eight palaces and
 * never the centre, the two eyes, the 計神 and 合神, the two counts and the
 * generals they seat, the 八門直使, the 三基, 五福 and 大遊, and the conditions
 * 卷三 of 《太乙金鏡式經》 names.
 *
 * **The one board here that is cacheable `public`**, and that is a property of
 * the board rather than a staging decision. Every other endpoint is a pure
 * function of its URL too, but the key of a shared cache would hold somebody's
 * date, time and place of birth. A 年計 board holds nobody's data: it is a
 * function of the year, like the solar terms and for the same reason — it is
 * about something everyone is standing in. It can be linked, shared and
 * indexed, and it is the first thing on this site that can be.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    // Bounded as `/api/terms` is, and for the same reason: the count runs
    // one a year in either direction without limit, and a refusal beats a
    // week of caches holding whatever year 999999 makes of it.
    const year =
      readInteger(url.searchParams, 'year', { least: 1, most: 9999 }) ??
      new Date().getUTCFullYear();

    setHeaders({ 'cache-control': 'public, max-age=604800' });
    return json({ taiyi: taiyiBoard({ year }, DEFAULT_TAIYI_OPTIONS) });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
