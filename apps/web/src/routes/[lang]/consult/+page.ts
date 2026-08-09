import { lookupPlace, readMoment, type Failure } from '$lib/moment';
import type { PageLoad } from './$types';

/**
 * The setup is loaded; the chart is not.
 *
 * The other two sections cast from the address, because there a chart is a
 * pure function of its parameters and the address is the thing worth sharing.
 * Here it is the opposite and deliberately so: a consultation is an act, not
 * an address. It is cast at the instant it is asked for, it holds somebody's
 * question, and it is not reproducible by reloading — which is what a
 * consultation is, rather than a shortcoming of this page.
 *
 * So what the address carries is the setup — the mode, the place, the options,
 * and under the natal mode the birth — and what it never carries is the
 * question or the chart. Reloading finds the fields as they were and the page
 * uncast, which is the honest state.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const { input, locationId } = readMoment(url);
  const { place, failure } = await lookupPlace(fetch, locationId, locale);

  return {
    moment: { ...input, place },
    // The two frames do not overlap, so this is a choice of one and not a
    // pair of switches. Anything but `natal` is the question.
    natal: url.searchParams.get('mode') === 'natal',
    failure: failure as Failure | undefined,
  };
};
