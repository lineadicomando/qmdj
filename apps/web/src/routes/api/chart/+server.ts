import { computeQimenChart } from '@qimendunjia/core';
import { json } from '@sveltejs/kit';
import { momentIsFixed, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/chart?date=2024-06-15&time=14:00&locationId=1816670`
 *
 * GET and not POST on purpose: a chart is a pure function of its parameters,
 * so the address is shareable and the answer cacheable.
 *
 * Everything is optional. With no date and time the chart is cast for now;
 * with no place, for the server's own zone on its own meridian.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { moment, label } = readMoment(url.searchParams);
    const chart = computeQimenChart(moment, moment.options);

    // `private`, not `public`: the answer is cacheable — it is a pure
    // function of the URL — but only by the browser that asked. `public`
    // would let a shared cache keep it, and the key of that cache is an
    // address holding somebody's date, time and place of birth.
    //
    // And cacheable only where the URL fixes the instant. Without a date the
    // question is "now", which is a different question every hour.
    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return json({ chart, place: label ?? null });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
