import {
  DEFAULT_QIZHENG_OPTIONS,
  qizhengBoard,
  qizhengReadingPrompt,
  type QizhengOptions,
} from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
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
 * `GET /api/qizheng/prompt?date=1968-03-12&time=14:30&locationId=3169070`
 *
 * The board wrapped in the conditions for reading it, for pasting into a model
 * that has no connection to any of this.
 *
 * **There is no `asked`, and that is the whole difference from the two beside
 * it.** A board of 卜 is cast *for* a question and its prompt ends on the line
 * that introduces one; this is laid on a birth and nothing is asked of it. The
 * flag is not merely unused here — there is no line for a browser to append a
 * question to, because a question would name a seat this board prints. Somebody
 * writing «what about my career» has said 官祿宮, and a model handed the two
 * together arrives there without making a choice anybody could ask it to
 * justify. See `prompt.ts` and `PLAN.md` § 4 phase 18.
 *
 * **And one board is in the fence, never two.** Sharper here than between the
 * other two: the twelve palaces of this board *are* the ring a 六壬 board seats
 * its 月將 on, so the Sun's palace on one is the general of the other. That is
 * one fact, not two witnesses.
 *
 * Phase 16 refused this endpoint on exactly that ground and the ground was
 * sound — it just does not reach the conclusion, since a consultation hands
 * over one board and the pair never meets. What had to be settled first was
 * different: this board arrives with its twelve seats already *named*, so the
 * prompt says outright that a name is not an assignment. `PLAN.md` § 4 phase 16
 * records the reversal.
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

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(
      qizhengReadingPrompt(moment, board, createTranslator(locale), {
        source: pageAddress(url, locale, 'qizheng'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
