import { baziTranscript, computeBazi } from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import {
  ephemerisContext,
  momentIsFixed,
  pageAddress,
  readInteger,
  readLocale,
  readMoment,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/bazi/text?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * The four pillars said in words, in the form the CLI prints. Not a second
 * rendering: `baziTranscript` is the one the terminal uses and the one that
 * goes inside `/prompt`.
 *
 * The oldest board here was the last to get this, and the reason is worth a
 * line: 八字 arrived as the substrate a chart is cast from rather than as
 * something anybody would hand over, so nothing ever asked it for a rendering
 * of its own. That it had neither `/text` nor `/prompt` when the other three
 * had one or both was an omission, not a decision. See `docs/history/` phase 18.
 *
 * `gender` is optional and only the decade luck cycles depend on it. Without
 * it the pillars are complete and the cycles are absent, which is the correct
 * answer rather than a degraded one.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { moment } = readMoment(url.searchParams);

    const gender = url.searchParams.get('gender');
    const cycles = readInteger(url.searchParams, 'cycles');
    const options: Parameters<typeof computeBazi>[1] = {};
    if (gender === 'male' || gender === 'female') options.gender = gender;
    if (cycles !== undefined) options.cycles = Math.min(12, Math.max(1, cycles));

    const bazi = computeBazi(moment, options, ephemerisContext());

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(
      baziTranscript(moment, bazi, createTranslator(locale), {
        source: pageAddress(url, locale, 'bazi'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
