import { readInstrument } from '$lib/instruments';
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
 * So what the address carries is the setup — the place, the options, which
 * instrument the instant is to be laid on, and the birth if one was given for
 * a 年命 — and what it never carries is the question or the board. Reloading
 * finds the fields as they were and the page uncast, which is the honest
 * state.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const { input, locationId } = readMoment(url);
  const { place, failure } = await lookupPlace(fetch, locationId, locale);

  const gender = url.searchParams.get('gender');

  return {
    moment: { ...input, place },
    // The birth, when one was given. It is setup and not the question: what
    // it produces is a 年命 inside the chart of the moment, and the chart is
    // still cast for the instant of the press.
    born: url.searchParams.get('born') ?? '',
    gender: gender === 'male' || gender === 'female' ? gender : '',
    // Which board the question is put to. Setup exactly as `trueSolarTime` is:
    // chosen before the press, and nothing is laid until then. An address
    // naming no instrument, or one that is not an instrument, opens on the
    // default rather than on a lookup that would miss.
    instrument: readInstrument(url.searchParams.get('instrument')),
    failure: failure as Failure | undefined,
  };
};
