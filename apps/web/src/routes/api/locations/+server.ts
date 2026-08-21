import { getLocation, searchLocations } from '@shipan/geo';
import { resolveLocale } from '@shipan/i18n';
import { error, json } from '@sveltejs/kit';
import { isHttpError, toHttpError } from '$lib/server/errors';
import { readInteger } from '$lib/server/params';
import type { RequestHandler } from './$types';

/**
 * `GET /api/locations?q=Beijing&lang=en` — or `?id=1816670`
 *
 * Returns the candidates and chooses none of them. Picking the most populous
 * "Rome" for the caller would produce a chart that is plausible and wrong,
 * and nothing downstream could detect it.
 *
 * `id` is the way back: an address carries the identifier of a place and not
 * its name, so reopening a form from one needs the name looked up again. It
 * answers in the shape a search answers in — one list, possibly of one — so
 * the caller reads a single answer rather than two.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const query = url.searchParams.get('q') ?? '';
    const lang = resolveLocale(url.searchParams.get('lang'));

    const id = url.searchParams.get('id');
    if (id !== null) {
      const found = getLocation(Number(id), { lang });
      if (!found) {
        error(404, {
          message: `No location has the identifier ${id}.`,
          code: 'UNKNOWN_LOCATION',
          messageKey: 'web.error.UNKNOWN_LOCATION',
          params: { id },
        });
      }
      setHeaders({ 'cache-control': 'public, max-age=86400' });
      return json({ query: null, results: [found] });
    }

    const options: Parameters<typeof searchLocations>[1] = { lang };
    const country = url.searchParams.get('country');
    // `readInteger` refuses what does not read as one: `Number('abc')` is NaN,
    // NaN slides through the clamp in `geo`, and SQLite's `LIMIT ?` answered
    // with a 500 in prose.
    const limit = readInteger(url.searchParams, 'limit');
    if (country) options.countryCode = country;
    if (limit !== undefined) options.limit = limit;

    const results = searchLocations(query, options);

    // The dataset only changes when it is reimported, and the query is in the
    // URL: a shared cache may keep this one.
    setHeaders({ 'cache-control': 'public, max-age=86400' });
    return json({ query, results });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
