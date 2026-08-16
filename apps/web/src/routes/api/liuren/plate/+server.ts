import {
  DEFAULT_LIUREN_OPTIONS,
  liurenBoard,
  liurenLabels,
  sayGanzhi,
  type LiurenOptions,
} from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import { renderLiurenSvg } from '@qimendunjia/plate';
import { momentIsFixed, readLocale, readMoment, readPlateOptions } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/liuren/plate?date=2026-08-14&time=14:30&locationId=3169070`
 *
 * The Liu Ren board as a picture: a ring of twelve rather than a grid of
 * nine. Like the chart's plate it travels further than the page it was made
 * on, so a board drawn by a rule nothing could check says so on its own face.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const t = createTranslator(locale);
    const { moment } = readMoment(url.searchParams);

    const options: LiurenOptions = { ...DEFAULT_LIUREN_OPTIONS };
    const guiren = url.searchParams.get('guiren');
    if (guiren === 'chou' || guiren === 'wei') options.guiren = guiren;

    const board = liurenBoard(
      { term: moment.solarTerm.term, day: moment.pillars.day, hour: moment.hourBranch },
      options,
    );

    const { size, scheme } = readPlateOptions(url.searchParams);

    const svg = renderLiurenSvg(board, {
      size,
      scheme,
      labels: liurenLabels(t),
      // The day and the hour the board was laid for, and the general that
      // turned it. Without them the picture is a ring of branches nobody can
      // date — and the picture is what gets sent on.
      heading:
        `${sayGanzhi(board.day, t)} ${board.day.hanzi} · ${board.hour.hanzi} · ` +
        `${t('cli.field.yuejiang')} ${board.yuejiang.hanzi} ${board.yuejiang.branch.hanzi}`,
      // The twelve branches, the twelve generals and the stems the board turned
      // up, each said aloud under the ring — for the same reason the chart's
      // plate carries them: the picture is the half of this that travels.
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
