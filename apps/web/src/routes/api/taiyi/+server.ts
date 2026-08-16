import { DEFAULT_TAIYI_OPTIONS, taiyiBoard } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { readTaiyiYear, taiyiCacheControl } from '$lib/server/params';
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
    // Bounded, and defaulted at 立春 rather than at New Year: see
    // `readTaiyiYear`, which is where every surface here asks what year is
    // being lived so that they all answer the same.
    const { year, named } = readTaiyiYear(url.searchParams);

    setHeaders({ 'cache-control': taiyiCacheControl(named) });
    return json({ taiyi: taiyiBoard({ year }, DEFAULT_TAIYI_OPTIONS) });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
