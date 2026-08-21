import { DEFAULT_ZIWEI_OPTIONS, computeZiwei, ziweiLabels } from '@shipan/core';
import { createTranslator } from '@shipan/i18n';
import { renderZiweiSvg } from '@shipan/plate';
import {
  momentIsFixed,
  readLocale,
  readMoment,
  readPlateOptions,
} from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/ziwei/plate?date=1968-03-12&time=14:30&locationId=3169070&gender=male`
 *
 * The 紫微斗數 board as a picture: twelve seats round the border of a four by
 * four, with the birth in the middle of it.
 *
 * **It is the figure the book prints its own tables in**, which is why it is a
 * grid and not the ring the 六壬 and 七政四餘 boards share. Those twelve are
 * stretches of the ecliptic; these are seats in a count, and drawing them
 * round would say the two figures were one thing.
 *
 * It carries no standing line, unlike the 七政四餘 picture. It did — that
 * nothing here is in the sky — and the line came off as something anybody
 * looking at this board already knows. What still says it, to the one reader
 * who does not, is the prompt, which opens on it at length: a model handed
 * twelve palaces with stars in them is exactly who would take them for a sky.
 *
 * `private` in a cache, never `public`: the address holds somebody's birth.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const t = createTranslator(locale);
    const { moment } = readMoment(url.searchParams);

    const gender = url.searchParams.get('gender');
    const options = { ...DEFAULT_ZIWEI_OPTIONS };
    if (gender === 'male' || gender === 'female') options.gender = gender;

    const board = computeZiwei(moment, options);
    const { size, scheme } = readPlateOptions(url.searchParams);

    const svg = renderZiweiSvg(board, {
      size,
      scheme,
      labels: ziweiLabels(t),
      // The birth as it was given. The middle of the board already carries the
      // lunar date the seats were counted from, and the two are not the same
      // fact: one is when somebody was born, the other is what the almanac
      // called that day.
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
