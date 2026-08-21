import { computeQimenChart, nianmingOf } from '@shipan/core';
import { json } from '@sveltejs/kit';
import {
  momentIsFixed,
  readMoment,
  readNianming,
  readNianmingOptions,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/qimen?date=2024-06-15&time=14:00&locationId=1816670`
 *
 * GET and not POST on purpose: a chart is a pure function of its parameters,
 * so the address is shareable and the answer cacheable.
 *
 * Everything is optional. With no date and time the chart is cast for now;
 * with no place, for the server's own zone on its own meridian.
 *
 * `born=1990-06-01` adds a 年命: the birth looked up inside this chart. The
 * chart does not move for it — that is the whole of the classical direction —
 * so the answer carries the same chart with one more field beside it.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const { moment, label } = readMoment(url.searchParams);
    const chart = computeQimenChart(moment, moment.options);
    const birth = readNianming(url.searchParams, chart);
    const nianming = birth
      ? nianmingOf(chart, birth, readNianmingOptions(url.searchParams))
      : null;

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
    // `qimen` and not `chart`: every board endpoint here answers with its
    // board named after itself, and this was the one that did not — which is
    // what `Instrument.api` being a single field depends on. See
    // `lib/instruments.ts`.
    return json({ qimen: chart, nianming, place: label ?? null });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
