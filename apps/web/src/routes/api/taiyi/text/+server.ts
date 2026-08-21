import { DEFAULT_TAIYI_OPTIONS, taiyiBoard, taiyiTranscript } from '@shipan/core';
import { createTranslator } from '@shipan/i18n';
import {
  localeVary,
  pageAddress,
  readLocale,
  readTaiyiYear,
  taiyiCacheControl,
} from '$lib/server/params';
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
 * `public` like the board itself, and `vary: Accept-Language` only where the
 * address does not say `lang` — see `localeVary`, since a header nearly unique
 * to a reader makes a shared cache a private one with extra steps.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { year, named } = readTaiyiYear(url.searchParams);

    const t = createTranslator(locale);
    setHeaders({
      'cache-control': taiyiCacheControl(named),
      ...localeVary(url.searchParams),
    });
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
