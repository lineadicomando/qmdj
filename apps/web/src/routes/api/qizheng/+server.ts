import { DEFAULT_QIZHENG_OPTIONS, qizhengBoard, type QizhengOptions } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { ephemerisContext, momentIsFixed, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/qizheng?date=2026-08-14&time=14:30&locationId=3169070&luohou=descending`
 *
 * The 七政四餘 board for an instant: eleven positions read off the ephemeris,
 * each said in both of the frames the board holds — the 宿 with its 入宿度 and
 * the 宮 with its 宮度 — plus the 命宮 and the twelve 人事宮 numbered from it.
 *
 * This is the board that reaches deepest into the ephemeris. The others need
 * it for the calendar under them — the terms, the new moons — where this one
 * needs positions: the seven, the node, the apogee and twenty-eight fixed
 * stars, all at the one instant.
 *
 * `private` like the chart and never `public`, for the same reason: it is a
 * pure function of its URL, and the key of a shared cache would hold
 * somebody's date, time and place of birth — which this board, being a 命
 * art, is more likely than the others to have been given.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { moment, label } = readMoment(url.searchParams);

    const options: QizhengOptions = { ...DEFAULT_QIZHENG_OPTIONS };
    const luohou = url.searchParams.get('luohou');
    if (luohou === 'descending' || luohou === 'ascending') options.luohou = luohou;

    const board = qizhengBoard(
      { julianDay: moment.julianDayUT, hour: moment.hourBranch },
      options,
      ephemerisContext(),
    );

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return json({ moment, qizheng: board, place: label ?? null });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
