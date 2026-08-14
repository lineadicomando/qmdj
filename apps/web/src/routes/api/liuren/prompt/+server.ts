import {
  DEFAULT_LIUREN_OPTIONS,
  liurenBoard,
  liurenReadingPrompt,
  type LiurenOptions,
} from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import { momentIsFixed, pageAddress, readLocale, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/liuren/prompt?date=2026-08-14&time=14:30&locationId=3169070&asked=true`
 *
 * The board wrapped in the conditions for reading it, for pasting into a model
 * that has no connection to any of this.
 *
 * **`asked` is a yes or no, and never the question itself.** What somebody
 * asks a board is theirs, and a query string is written into every log along
 * the way. Told `asked=true` the prompt ends on the line that introduces a
 * question, for the browser to append; without it the prompt says plainly that
 * nothing was asked.
 *
 * **And one board is in the fence, never two.** A model handed a Qi Men chart
 * and a Liu Ren board of one instant reads their agreement as corroboration,
 * when the two share the day pillar, the decade, the void branches and seven
 * of the eight spirits — where they agree it is frequently one fact printed
 * twice. See `PLAN.md` § 4 phase 14.
 *
 * No 年命 here, and not by omission: the person asking is already in this
 * board, standing on the day stem.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { moment } = readMoment(url.searchParams);

    const options: LiurenOptions = { ...DEFAULT_LIUREN_OPTIONS };
    const guiren = url.searchParams.get('guiren');
    if (guiren === 'chou' || guiren === 'wei') options.guiren = guiren;

    const board = liurenBoard(
      { term: moment.solarTerm.term, day: moment.pillars.day, hour: moment.hourBranch },
      options,
    );

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(
      liurenReadingPrompt(moment, board, createTranslator(locale), {
        source: pageAddress(url, locale),
        ...(url.searchParams.get('asked') === 'true' ? { question: '' } : {}),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
