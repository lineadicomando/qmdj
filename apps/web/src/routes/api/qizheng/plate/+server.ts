import {
  DEFAULT_QIZHENG_OPTIONS,
  qizhengBoard,
  qizhengLabels,
  type QizhengOptions,
} from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import { renderQizhengSvg } from '@qimendunjia/plate';
import {
  ephemerisContext,
  momentIsFixed,
  readInteger,
  readLocale,
  readMoment,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/qizheng/plate?date=1968-03-12&time=14:30&locationId=3169070`
 *
 * The 七政四餘 board as a picture: the same ring of twelve the 六壬 board is
 * drawn on, because it is the same twelve — thirty-degree stretches of the
 * ecliptic under the branches that name them — with the eleven listed and
 * glossed above it.
 *
 * It carries its two standing lines on its own face, and that matters more
 * here than on either other board: this picture will be looked at beside an
 * almanac, and a reader comparing degrees needs to know on the sheet that
 * these 宿 begin at their stars rather than at a printed table, and that the
 * count of remainders is three on purpose.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const t = createTranslator(locale);
    const { moment } = readMoment(url.searchParams);

    const options: QizhengOptions = { ...DEFAULT_QIZHENG_OPTIONS };
    const luohou = url.searchParams.get('luohou');
    if (luohou === 'descending' || luohou === 'ascending') options.luohou = luohou;

    const board = qizhengBoard(
      { julianDay: moment.julianDayUT, hour: moment.hourBranch },
      options,
      ephemerisContext(),
    );

    const size = Math.min(2048, Math.max(240, readInteger(url.searchParams, 'size') ?? 900));
    const asked = url.searchParams.get('scheme');
    const scheme = asked === 'light' || asked === 'dark' ? asked : 'auto';

    const svg = renderQizhengSvg(board, {
      size,
      scheme,
      labels: qizhengLabels(t),
      // The instant, and nothing else. The other two boards head themselves
      // with a pillar because a pillar *is* the board's ground; here the
      // ground is the sky at a moment, and the moment is the whole of it.
      heading: `${moment.input.date} ${moment.input.time} · ${moment.input.timezone}`,
      readings: t('cli.heading.readings'),
    });

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8' } });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
