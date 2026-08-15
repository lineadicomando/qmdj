import { lookupPlace, momentQuery, readMoment, type Failure } from '$lib/moment';
import type { PageLoad } from './$types';

/**
 * Placing is loading, as laying is for the 六壬 board.
 *
 * An empty address is the present sky, which is a reasonable page for this
 * section in a way it is not for the pillars: where a chart of birth for
 * whoever opened the page is a wrong answer, the seven governors *now* is a
 * real thing to look at — it is where they are, and it is the same for
 * everybody. That this board is a 命 art does not make it a form: a birth
 * goes in the address like any other instant.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const { input, locationId } = readMoment(url);
  const { place, failure: unknownPlace } = await lookupPlace(fetch, locationId, locale);
  const moment = { ...input, place };

  // The one divergence a reader might move, read from the address like every
  // other, so that a board is a link.
  const asked = url.searchParams.get('luohou');
  const luohou = asked === 'ascending' ? 'ascending' : 'descending';

  if (unknownPlace) return { moment, luohou, result: undefined, failure: unknownPlace };

  const response = await fetch(`/api/qizheng?${momentQuery(moment, { luohou, lang: locale })}`);
  const body = await response.json();

  return response.ok
    ? { moment, luohou, result: body, failure: undefined }
    : { moment, luohou, result: undefined, failure: body as Failure };
};
