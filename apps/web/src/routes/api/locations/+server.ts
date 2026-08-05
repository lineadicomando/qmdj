import { searchLocations } from '@qimendunjia/geo';
import { resolveLocale } from '@qimendunjia/i18n';
import { json } from '@sveltejs/kit';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/locations?q=Beijing&lang=en`
 *
 * Returns the candidates and chooses none of them. Picking the most populous
 * "Rome" for the caller would produce a chart that is plausible and wrong,
 * and nothing downstream could detect it.
 */
export const GET: RequestHandler = ({ url, setHeaders }) => {
  try {
    const query = url.searchParams.get('q') ?? '';
    const lang = resolveLocale(url.searchParams.get('lang'));

    const options: Parameters<typeof searchLocations>[1] = { lang };
    const country = url.searchParams.get('country');
    const limit = url.searchParams.get('limit');
    if (country) options.countryCode = country;
    if (limit) options.limit = Number(limit);

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
