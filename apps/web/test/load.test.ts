import { describe, expect, it } from 'vitest';
import { load as chart } from '../src/routes/[lang]/+page';
import { load as bazi } from '../src/routes/[lang]/bazi/+page';

/**
 * What the pages ask for, given an address.
 *
 * The endpoints have their own tests; these are about the step before, which
 * turns an address into the question the endpoints are asked. That step is
 * where an unknown place once went missing quietly, taking the chart's whole
 * meaning with it.
 */
type Load = (event: never) => unknown;

interface Asked {
  data: Record<string, unknown>;
  urls: string[];
}

/**
 * A stand-in for the endpoints: it records what was asked and answers what
 * the real ones would, so what is asserted is the question and not the maths.
 */
async function open(load: Load, address: string, places: Record<string, unknown> = {}): Promise<Asked> {
  const urls: string[] = [];

  const fetch = async (input: string): Promise<Response> => {
    urls.push(input);
    const url = new URL(input, 'http://localhost');

    if (url.pathname === '/api/locations') {
      const found = places[url.searchParams.get('id') ?? ''];
      return found
        ? Response.json({ query: null, results: [found] })
        : Response.json(
            {
              message: 'No location has that identifier.',
              code: 'UNKNOWN_LOCATION',
              messageKey: 'web.error.UNKNOWN_LOCATION',
              params: { id: url.searchParams.get('id') },
            },
            { status: 404 },
          );
    }
    return Response.json({ chart: { ju: 'a chart' }, bazi: { pillars: [] } });
  };

  const data = (await load({
    url: new URL(`http://localhost${address}`),
    fetch,
    parent: async () => ({ locale: 'en' }),
  } as never)) as Record<string, unknown>;

  return { data, urls };
}

const BEIJING = { id: 1816670, name: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' };

describe('the chart page', () => {
  it('casts for the present when the address says nothing', async () => {
    const { data, urls } = await open(chart, '/en');

    expect(data.chart).toBeTruthy();
    expect(urls.some((url) => url.startsWith('/api/chart?'))).toBe(true);
  });

  it('asks for the place the address names', async () => {
    const { urls } = await open(chart, '/en?date=1984-03-12&time=07:30&locationId=1816670', {
      '1816670': BEIJING,
    });

    expect(urls).toContain('/api/locations?id=1816670&lang=en');
    expect(urls).toContain('/api/chart?date=1984-03-12&time=07%3A30&locationId=1816670&lang=en');
  });

  it('refuses a place it cannot find instead of casting without one', async () => {
    // The failure this guards: dropping the identifier and computing for the
    // server's own zone produces something that looks exactly like a chart
    // and is a chart of somewhere else.
    const { data, urls } = await open(chart, '/en?date=1984-03-12&time=07:30&locationId=999999999');

    expect(data.chart).toBeUndefined();
    expect(data.failure).toMatchObject({ code: 'UNKNOWN_LOCATION' });
    expect(urls.some((url) => url.startsWith('/api/chart?'))).toBe(false);
  });

  it('keeps the options the address carries', async () => {
    const { urls } = await open(chart, '/en?date=1984-03-12&trueSolarTime=false&dayBoundary=midnight');

    expect(urls[0]).toBe('/api/chart?date=1984-03-12&trueSolarTime=false&dayBoundary=midnight&lang=en');
  });
});

describe('the pillars page', () => {
  it('waits for a date rather than reading the pillars of now', async () => {
    // A chart of birth cast for whoever opened the page is not a lesser
    // answer, it is a wrong one.
    const { data, urls } = await open(bazi, '/en');

    expect(data.result).toBeUndefined();
    expect(urls).toHaveLength(0);
  });

  it('carries the moment and the gender it was given', async () => {
    const { data, urls } = await open(bazi, '/en?date=1984-03-12&time=07:30&gender=female');

    expect(data.result).toBeTruthy();
    expect(urls[0]).toBe('/api/bazi?date=1984-03-12&time=07%3A30&gender=female&lang=en');
  });

  it('refuses a place it cannot find, as the chart does', async () => {
    const { data } = await open(bazi, '/en?date=1984-03-12&locationId=999999999');

    expect(data.result).toBeUndefined();
    expect(data.failure).toMatchObject({ code: 'UNKNOWN_LOCATION' });
  });
});
