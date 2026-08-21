import { DEFAULT_ZIWEI_OPTIONS, computeZiwei, ziweiTranscript } from '@shipan/core';
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
 * `GET /api/ziwei/text?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * The board said in words, in the form the CLI prints — the same rendering the terminal uses and the one that goes inside `/prompt`.
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
      ziweiTranscript(moment, board, createTranslator(locale), {
        source: pageAddress(url, locale, 'ziwei'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
