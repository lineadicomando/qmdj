import { DEFAULT_TAIYI_OPTIONS, taiyiBoard, taiyiReadingPrompt } from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import { pageAddress, readInteger, readLocale } from '$lib/server/params';
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
 * `prompt.ts` and `PLAN.md` § 4 phase 21.
 *
 * `vary: Accept-Language` because the glosses around the hanzi — and now the
 * whole of the instructions — are what turns with a reader.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    // Bounded as the board endpoint bounds it, and for the same reason: the
    // count runs one a year in either direction without limit, and a refusal
    // beats a week of caches holding whatever year 999999 makes of it.
    const year =
      readInteger(url.searchParams, 'year', { least: 1, most: 9999 }) ??
      new Date().getUTCFullYear();

    const t = createTranslator(locale);
    setHeaders({ 'cache-control': 'public, max-age=604800', vary: 'Accept-Language' });
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
