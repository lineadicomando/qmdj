import {
  DEFAULT_QIZHENG_OPTIONS,
  qizhengBoard,
  qizhengTranscript,
  type QizhengOptions,
} from '@shipan/core';
import { createTranslator } from '@shipan/i18n';
import {
  ephemerisContext,
  momentIsFixed,
  pageAddress,
  readLocale,
  readMoment,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/qizheng/text?date=2026-08-14&time=14:30&locationId=3169070`
 *
 * The board said in words, in the form the CLI prints. Not a second
 * rendering: `qizhengTranscript` is the one the terminal uses and the one that
 * goes inside `/prompt`, so what is copied here cannot drift from what the
 * engine's own surfaces show.
 *
 * It composed the same parts by hand until the prompt beside it needed them
 * too, and printed the almanac's officer with them where the chart's and the
 * board's transcripts had always left it out. One rendering settles both: the
 * officer is a function of two pillars printed above it, and this is the one
 * board where the word for it collides with something else on the page — every
 * body here carries a 宿, and the almanac's 值日宿 is a lodge of another kind.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { moment } = readMoment(url.searchParams);

    const options: QizhengOptions = { ...DEFAULT_QIZHENG_OPTIONS };
    const luohou = url.searchParams.get('luohou');
    if (luohou === 'descending' || luohou === 'ascending') options.luohou = luohou;

    const board = qizhengBoard(
      { julianDay: moment.julianDayUT, hour: moment.hourBranch },
      options,
      ephemerisContext(),
    );

    const t = createTranslator(locale);
    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(
      qizhengTranscript(moment, board, t, { source: pageAddress(url, locale, 'qizheng') }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
