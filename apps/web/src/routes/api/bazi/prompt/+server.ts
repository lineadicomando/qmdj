import { baziReadingPrompt, computeBazi } from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import {
  ephemerisContext,
  momentIsFixed,
  pageAddress,
  readInteger,
  readLocale,
  readMoment,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/bazi/prompt?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * The four pillars wrapped in the conditions for reading them, for pasting
 * into a model that has no connection to any of this.
 *
 * **There is no `asked`**, for the reason `/api/qizheng/prompt` has none: a
 * board of 命 is laid on a birth and nothing is asked of it, so there is no
 * line for a browser to append a question to.
 *
 * **What this prompt withholds is not a palace but an element.** A chart of 卜
 * refuses the 用神 and a model must choose one to say anything at all; here the
 * four pillars are complete and readable, and what is missing is the favourable
 * element — 用神, 喜用神 — which is the reading itself and which the schools
 * choose by different methods. A model will supply it unasked, because every
 * manual it has read opens by doing so. The prompt says the engine does not
 * choose, and that whoever does has taken a step of their own.
 *
 * `gender` only fixes the direction the decade cycles run in. Without it there
 * are no cycles, and the prompt drops the rule that bounds them rather than
 * naming something absent from the fence.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const { moment } = readMoment(url.searchParams);

    const gender = url.searchParams.get('gender');
    const cycles = readInteger(url.searchParams, 'cycles');
    const options: Parameters<typeof computeBazi>[1] = {};
    if (gender === 'male' || gender === 'female') options.gender = gender;
    if (cycles !== undefined) options.cycles = Math.min(12, Math.max(1, cycles));

    const bazi = computeBazi(moment, options, ephemerisContext());

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
      vary: 'Accept-Language',
    });
    return new Response(
      baziReadingPrompt(moment, bazi, createTranslator(locale), {
        source: pageAddress(url, locale, 'bazi'),
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
