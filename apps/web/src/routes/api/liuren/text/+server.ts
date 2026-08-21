import {
  DEFAULT_LIUREN_OPTIONS,
  liurenBoard,
  liurenTranscript,
  type LiurenOptions,
} from '@shipan/core';
import { createTranslator } from '@shipan/i18n';
import { momentIsFixed, pageAddress, readLocale, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/liuren/text?date=2026-08-14&time=14:30&locationId=3169070`
 *
 * The board said in words, in the form the CLI prints. Not a second
 * rendering: `liurenTranscript` is the one the terminal uses, so what is
 * copied here cannot drift from what the engine's own surface shows.
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
      liurenTranscript(moment, board, createTranslator(locale), {
        source: pageAddress(url, locale),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
