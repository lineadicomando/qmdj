import type { PageLoad } from './$types';

/**
 * The one section on this site whose whole address is a number.
 *
 * No place, no hour, no birth: a 年計 board is a function of the year and of
 * nothing else, so the load is a year and a fetch. An empty address is the
 * year being stood in, which is the right default here in a way it is nowhere
 * else — a board of now is the board everybody is standing in.
 */
export const load: PageLoad = async ({ url, fetch, parent }) => {
  const { locale } = await parent();
  const asked = url.searchParams.get('year');
  const year = asked && /^\d{1,4}$/.test(asked) ? Number(asked) : new Date().getFullYear();

  const response = await fetch(`/api/taiyi?year=${year}&lang=${locale}`);
  const body = await response.json();

  return response.ok
    ? { year, result: body, failure: undefined }
    : { year, result: undefined, failure: body };
};
