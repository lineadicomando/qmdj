import { lookupPlace, type Failure } from '$lib/moment';
import { defaultInterval, intervalQuery, readInterval } from '$lib/interval';
import type { PageLoad } from './$types';

/**
 * Scanning is loading, as casting is: the address is the question.
 *
 * Unlike the chart, an empty address is **not** an answer here. A chart has a
 * sensible default — now — and a scan does not: it needs two dates, and
 * guessing an interval would answer a question nobody asked. So an address
 * without one shows the form filled with the coming week and waits.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const { input, criteria, locationId } = readInterval(url);
  const { place, failure: unknownPlace } = await lookupPlace(fetch, locationId, locale);
  const interval = { ...input, place };

  if (!input.from || !input.to) {
    return { interval: { ...interval, ...defaultInterval() }, criteria, scan: undefined, failure: undefined };
  }
  if (unknownPlace) return { interval, criteria, scan: undefined, failure: unknownPlace };

  const response = await fetch(`/api/moments?${intervalQuery(interval, criteria, { lang: locale })}`);
  const body = await response.json();

  return response.ok
    ? { interval, criteria, scan: body, failure: undefined }
    : { interval, criteria, scan: undefined, failure: body as Failure };
};
