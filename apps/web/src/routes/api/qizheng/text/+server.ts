import {
  DEFAULT_QIZHENG_OPTIONS,
  formatMoment,
  formatQizheng,
  formatWarnings,
  qizhengBoard,
  type QizhengOptions,
} from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import {
  ephemerisContext,
  momentIsFixed,
  readLocale,
  readMoment,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/qizheng/text?date=2026-08-14&time=14:30&locationId=3169070`
 *
 * The board said in words, in the form the CLI prints. Not a second
 * rendering: `formatQizheng` is the one the terminal uses, so what is copied
 * here cannot drift from what the engine's own surface shows.
 *
 * There is no `/prompt` beside it, and that is deliberate rather than
 * pending. A consultation takes one instrument, chosen before the press —
 * and this board shares the day pillar and the twelve palaces with the other
 * two, so a model handed it alongside one of them would count one fact twice.
 * See `PLAN.md` § 4 phase 14.
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
      [formatMoment(moment, t), '', formatQizheng(board, t), formatWarnings(moment, t)]
        .filter((part) => part !== '')
        .join('\n'),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
