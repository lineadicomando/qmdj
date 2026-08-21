import { lookupPlace, momentQuery, readMoment, type Failure } from '$lib/moment';
import type { PageLoad } from './$types';

/**
 * Casting is loading, because the address is the chart.
 *
 * The alternative — holding the moment in the component and fetching on
 * submit — has the page show one thing while its address says another, so a
 * link is not the chart the person was looking at and a reload loses it.
 * Reading the address instead gives the link, the reload, and the moment
 * carried between the two sections, all from the same code.
 *
 * An empty address is not an empty page: it is the present moment, which is
 * the chart a Qi Men reader wants most often and the one every other is
 * stepped away from. The pillars cannot do the same — see `bazi/+page.ts`.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const { input, locationId } = readMoment(url);
  const { place, failure: unknownPlace } = await lookupPlace(fetch, locationId, locale);
  const moment = { ...input, place };

  // A place that could not be found stops it here. Casting for the server's
  // own zone instead would answer a question nobody asked, and the answer
  // would look like the right one.
  if (unknownPlace) return { moment, chart: undefined, failure: unknownPlace };

  const response = await fetch(`/api/qimen?${momentQuery(moment, { lang: locale })}`);
  const body = await response.json();

  // A failure is data, not a page: the form has to stay on screen, because
  // what needs correcting is in it.
  // `body.qimen` on the wire, `chart` on the page: the endpoint is named for
  // the art it lays out, and what it hands back is a chart. Only the address
  // and the payload took the art's name — see `lib/instruments.ts`.
  return response.ok
    ? { moment, chart: body.qimen, failure: undefined }
    : { moment, chart: undefined, failure: body as Failure };
};
