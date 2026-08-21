import { DEFAULT_ZIWEI_OPTIONS, computeZiwei, ziweiReadingPrompt } from '@shipan/core';
import { createTranslator } from '@shipan/i18n';
import {
  momentIsFixed,
  pageAddress,
  readLocale,
  readMoment,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/ziwei/prompt?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * The board wrapped in the conditions for reading it, for pasting into a model that has no connection to any of this.

 * **There is no `asked`**, for the reason `/api/bazi/prompt` has none: a
 * board of 命 is laid on a birth and nothing is asked of it, so there is no
 * line for a browser to append a question to.
 *
 * **What this prompt spends its first paragraph on is that none of this is in
 * the sky.** A model handed twelve palaces on twelve branches, with stars in
 * them, reaches for planets — and the reading that follows is fluent,
 * confident, and about a different art.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { moment } = readMoment(url.searchParams);

    const gender = url.searchParams.get('gender');
    const options = { ...DEFAULT_ZIWEI_OPTIONS };
    if (gender === 'male' || gender === 'female') options.gender = gender;

    const board = computeZiwei(moment, options);

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(
      ziweiReadingPrompt(moment, board, createTranslator(locale), {
        source: pageAddress(url, locale, 'ziwei'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
