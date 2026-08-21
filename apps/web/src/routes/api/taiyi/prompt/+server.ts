import { DEFAULT_TAIYI_OPTIONS, taiyiBoard, taiyiReadingPrompt } from '@shipan/core';
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
 * `GET /api/taiyi/prompt?year=2026&lang=en`
 *
 * The board wrapped in the conditions for reading it, for pasting into a model
 * that has no connection to any of this.
 *
 * **The first prompt on this site that is cacheable `public`**, and it is a
 * property of the board rather than a relaxation of anything. The other four
 * prompt endpoints are pure functions of their URLs too, but the key of a
 * shared cache would hold somebody's date, time and place of birth. A 年計
 * board holds nobody's data: it is a function of a year, like the solar terms
 * and for the same reason. Nothing here is anybody's, so nothing here needs
 * keeping out of a cache.
 *
 * **There is no `asked` and there is `about`, and the difference between them
 * is the design.** A question asks what will happen and puts the person asking
 * inside a figure they are not in, which this board refuses: nobody is on it.
 * A **matter** — `about=true` — names what is being looked at, which is a field
 * of view and not a question, and it is what the assignment of 主 and 客 has to
 * be made *for*. Without one the prompt reads a figure and says the assignment
 * was never made, which is honest and is also a caption; with one it is a
 * reading of a year about something.
 *
 * `about` is a yes or a no and **never the matter itself**, exactly as `asked`
 * is on the two boards of 卜. The prompt ends on the line that introduces it and
 * the browser appends the text, because a matter is somebody's own — the merger
 * they are watching, the dispute they are in — and one in a query string is one
 * written into every access log along the way.
 *
 * Which is what keeps this cacheable at all: a boolean varies the response, a
 * matter would have varied the key.
 *
 * Phase 20 declined this endpoint on the ground that what such a board would be
 * handed over *for* had not been designed. Phase 21 designed it, and the first
 * reading it produced showed the design was half there — the register refused
 * everything and commissioned nothing, so the answer was a precise account of a
 * board that never says «and so?». The matter is what it was missing. See
 * `prompt.ts`, `docs/readings.md` and `docs/history/` phase 21.
 *
 * `vary: Accept-Language` where the address does not say `lang` — the glosses
 * around the hanzi, and the whole of the instructions, are what turns with a
 * reader, but a header that nearly names one is not a key a shared cache can
 * afford. See `localeVary`.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    // Bounded and cut at 立春 as the board endpoint is, and by the same reader:
    // a prompt built around a different board from the one the section shows
    // would be the two surfaces disagreeing inside one conversation.
    const { year, named } = readTaiyiYear(url.searchParams);

    const t = createTranslator(locale);
    setHeaders({
      'cache-control': taiyiCacheControl(named),
      ...localeVary(url.searchParams),
    });
    return new Response(
      taiyiReadingPrompt(taiyiBoard({ year }, DEFAULT_TAIYI_OPTIONS), t, {
        // An empty string, never the text: the caller is saying a matter exists
        // and that it will append it. See `TaiyiReadingRequest.matter`.
        ...(url.searchParams.get('about') === 'true' ? { matter: '' } : {}),
        // The section, which for this board really does hold what it names: a
        // 年計 board is a pure function of a year, so the link lands on the
        // board itself rather than on the form that would lay it again.
        source: pageAddress(url, locale, 'taiyi'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
