import { chartTranscript, computeQimenChart, nianmingOf } from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import {
  momentIsFixed,
  pageAddress,
  readLocale,
  readMoment,
  readNianming,
  readNianmingOptions,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/chart/text?date=2024-06-15&time=14:00&locationId=1816670`
 *
 * The chart said in words: the same thing `/api/chart` answers with, in the
 * form the CLI prints and a person can paste into a notebook. Not a second
 * rendering — `chartTranscript` is the one the terminal uses, so what is
 * copied here cannot drift from what the engine's own surface shows.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { moment } = readMoment(url.searchParams);
    const chart = computeQimenChart(moment, moment.options);
    const birth = readNianming(url.searchParams, chart);

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return new Response(
      chartTranscript(moment, chart, createTranslator(locale), {
        source: pageAddress(url, locale),
        // Inside the transcript, where it belongs: a 年命 is placed in this
        // chart, and the two copied apart could be paired wrongly later.
        ...(birth
          ? { nianming: nianmingOf(chart, birth, readNianmingOptions(url.searchParams)) }
          : {}),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
