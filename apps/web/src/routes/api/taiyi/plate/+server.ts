import { DEFAULT_TAIYI_OPTIONS, taiyiBoard, taiyiLabels } from '@shipan/core';
import { createTranslator } from '@shipan/i18n';
import { renderTaiyiSvg } from '@shipan/plate';
import {
  localeVary,
  readLocale,
  readPlateOptions,
  readTaiyiYear,
  taiyiCacheControl,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/taiyi/plate?year=2026`
 *
 * The 太乙 board as a picture: the nine palaces with an empty middle, and the
 * sixteen gods on the border around them.
 *
 * **A grid and not a ring**, unlike the two boards drawn before it, and that
 * is a property of the figure rather than a choice of style: the eight 宮 of
 * this board are the outer palaces of a Qi Men chart in the same arrangement
 * of directions, so a ring would say they were the twelve 六壬 and 七政四餘
 * share. The middle is drawn and left empty, because 太乙不入中宮.
 *
 * It carries one standing line on its own face, and it matters more here than
 * either of the 七政四餘 board's: this picture will be looked at beside a
 * chart, and the palace numbers are one seat off the Luoshu's, so a reader
 * carrying the chart's numbering across gets all eight wrong with nothing to
 * warn them.
 *
 * Each of the sixteen is glossed in its own cell — the board is drawn at the
 * measure of a page, and a cell of it has room for the word under the name —
 * and the readings are said together in the band under the grid, as they are
 * on every other drawing here.
 *
 * `public` like the board itself: a 年計 board holds nobody's data.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const t = createTranslator(locale);
    const { year, named } = readTaiyiYear(url.searchParams);

    const board = taiyiBoard({ year }, DEFAULT_TAIYI_OPTIONS);

    const { size, scheme } = readPlateOptions(url.searchParams);

    const svg = renderTaiyiSvg(board, {
      size,
      scheme,
      labels: taiyiLabels(t),
      // The year and its pillar, which is the whole of what this board is laid
      // on — no instant, no place, and nobody's birth.
      heading: `${board.year} · ${board.sui.hanzi} ${board.sui.pinyin}`,
      readings: t('cli.heading.readings'),
    });

    setHeaders({
      'cache-control': taiyiCacheControl(named),
      ...localeVary(url.searchParams),
    });
    return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8' } });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
