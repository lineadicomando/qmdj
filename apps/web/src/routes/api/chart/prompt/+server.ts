import { computeQimenChart, nianmingOf, readingPrompt } from '@qimendunjia/core';
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
 * `GET /api/chart/prompt?date=2024-06-15&time=14:00&locationId=1816670&asked=true`
 *
 * The chart wrapped in what somebody reading it has to be told, for pasting
 * into an assistant that has no connection to this engine. It is
 * `docs/agent-prompt.md` addressed to a model that will never read it.
 *
 * **`asked` is a yes or no, and never the question itself.** A question is
 * somebody's own — *will the illness pass*, *should I leave* — and a question
 * in a query string is a question written into every access log between the
 * browser and this handler. So the frame is built here and ends on the line
 * that introduces one, and the browser appends the single line that must not
 * leave it. Without `asked` the prompt says plainly that nothing was asked,
 * which is the honest answer and not the same as choosing a 用神 for somebody.
 *
 * `born=1990-06-01` places a 年命 inside the prompt's fence, with the line
 * that says what it is not: not a chart of a birth, and no palace standing
 * for a part of a life. It sits beside a question rather than excluding one —
 * the birth is who is asking, and the chart is still the chart of the moment.
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
      readingPrompt(
        moment,
        chart,
        createTranslator(locale),
        {
          source: pageAddress(url, locale),
          ...(url.searchParams.get('asked') === 'true' ? { question: '' } : {}),
          ...(birth
            ? { nianming: nianmingOf(chart, birth, readNianmingOptions(url.searchParams)) }
            : {}),
        },
      ),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
