import type { PageLoad } from './$types';

/**
 * The one section on this site whose whole address is a number.
 *
 * No place, no hour, no birth: a 年計 board is a function of the year and of
 * nothing else, so the load is a year and a fetch. An empty address is the
 * year being stood in, which is the right default here in a way it is nowhere
 * else — a board of now is the board everybody is standing in.
 *
 * **The year is not decided here, and that is the point.** What the address
 * says is passed to the endpoint as it stands, and the year that comes back is
 * the board's own. Two things follow, and both were wrong when this load
 * answered for itself: a year the endpoint refuses — 16444 for a mistyped
 * 1644, or one outside the bounds — arrives as a failure the reader can see,
 * instead of being replaced in silence by the current year under an address
 * still naming the year they asked for; and an *empty* address is answered by
 * 立春 rather than by the browser's calendar, so the section and the endpoint
 * agree in January, which they did not while one read a local year and the
 * other a UTC one.
 *
 * No `lang` either: the board is identifiers, hanzi and numbers, and the
 * endpoint never reads one. Sending it split a shared week-long cache into a
 * copy per locale of an identical answer.
 */
export const load: PageLoad = async ({ url, fetch }) => {
  const asked = url.searchParams.get('year');
  const query = asked === null || asked === '' ? '' : `?year=${encodeURIComponent(asked)}`;

  const response = await fetch(`/api/taiyi${query}`);
  const body = await response.json();

  return response.ok
    ? { asked, year: body.taiyi.year as number, result: body, failure: undefined }
    : { asked, year: undefined, result: undefined, failure: body };
};
