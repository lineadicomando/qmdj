import { DEFAULT_TAIYI_OPTIONS, taiyiBoard, taiyiTranscript } from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import { pageAddress, readInteger, readLocale } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/taiyi/text?year=2026&lang=en`
 *
 * The board said in words, in the form the CLI prints. Not a second
 * rendering: `taiyiTranscript` is the one the terminal uses, so what is copied
 * here cannot drift from what the engine's own surfaces show.
 *
 * `/prompt` beside it is the same board with the instructions for reading it
 * around it. This is the bare transcript, which is what somebody copying the
 * board itself wants — and it is what goes inside that prompt's fence, so the
 * two cannot drift.
 *
 * `public` like the board itself, and `vary: Accept-Language` because the
 * glosses around the hanzi are the one thing here that turns with a reader.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const year =
      readInteger(url.searchParams, 'year', { least: 1, most: 9999 }) ??
      new Date().getUTCFullYear();

    const t = createTranslator(locale);
    setHeaders({ 'cache-control': 'public, max-age=604800', vary: 'Accept-Language' });
    return new Response(
      taiyiTranscript(taiyiBoard({ year }, DEFAULT_TAIYI_OPTIONS), t, {
        source: pageAddress(url, locale, 'taiyi'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
