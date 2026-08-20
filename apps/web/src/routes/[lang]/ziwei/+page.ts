import { lookupPlace, momentQuery, readMoment, type Failure } from '$lib/moment';
import type { PageLoad } from './$types';

/**
 * As for the pillars: the address is read, and the address is what is shared.
 *
 * It waits for a date for the reason they do. A board of 命 laid on whoever
 * opened the page is not a lesser answer, it is a wrong one — an empty birth
 * is nobody's, where an empty *instant* on a board of 卜 is this minute and
 * belongs to whoever is looking.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const { input, locationId } = readMoment(url);
  const { place, failure: unknownPlace } = await lookupPlace(fetch, locationId, locale);
  const moment = { ...input, place };

  // Asked for, never assumed: only the direction of the cycles needs it.
  const gender = url.searchParams.get('gender') ?? '';

  // A place that could not be found stops it here, as it does for the chart.
  if (unknownPlace) return { moment, gender, result: undefined, failure: unknownPlace };
  if (!input.date) return { moment, gender, result: undefined, failure: undefined };

  const response = await fetch(`/api/ziwei?${momentQuery(moment, { gender, lang: locale })}`);
  const body = await response.json();

  return response.ok
    ? { moment, gender, result: body, failure: undefined }
    : { moment, gender, result: undefined, failure: body as Failure };
};
