import { describe, expect, it } from 'vitest';
import { load as consult } from '../src/routes/[lang]/+page';
import { load as bazi } from '../src/routes/[lang]/bazi/+page';
import { load as chart } from '../src/routes/[lang]/chart/+page';
import { load as moments } from '../src/routes/[lang]/moments/+page';
import { load as taiyi } from '../src/routes/[lang]/taiyi/+page';

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
    return Response.json({ chart: { ju: 'a chart' }, bazi: { pillars: [] }, taiyi: { ju: 49 } });
  };

  const data = (await load({
    url: new URL(`http://localhost${address}`),
    fetch,
    parent: async () => ({ locale: 'en' }),
  } as never)) as Record<string, unknown>;

  return { data, urls };
}

const BEIJING = { id: 1816670, name: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' };

/**
 * The one section whose whole address is a number.
 *
 * No place is looked up and none can be: this board is a function of a year,
 * which is why nothing here asks `/api/locations` and why the page can be
 * cached in public.
 */
describe('the 太乙 page', () => {
  it('lays the year the address names, and asks for no place', async () => {
    const { data, urls } = await open(taiyi, '/en?year=724');

    expect(data.year).toBe(724);
    expect(urls).toEqual(['/api/taiyi?year=724&lang=en']);
  });

  it('lays the year being stood in when the address says nothing', async () => {
    const { data } = await open(taiyi, '/en');
    expect(data.year).toBe(new Date().getFullYear());
  });

  it('falls back rather than passing a year the endpoint would refuse', async () => {
    const { data } = await open(taiyi, '/en?year=not-a-year');
    expect(data.year).toBe(new Date().getFullYear());
  });
});

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

describe('the consult page', () => {
  it('loads the setup and casts nothing', async () => {
    // A consultation is an act, not an address: the chart waits for the press.
    const { data, urls } = await open(consult, '/en?locationId=1816670&born=1990-06-01&gender=male', {
      '1816670': BEIJING,
    });

    expect((data.moment as { place?: unknown }).place).toMatchObject({ id: 1816670 });
    expect(data.born).toBe('1990-06-01');
    expect(data.gender).toBe('male');
    expect(data.failure).toBeUndefined();
    expect(urls.some((url) => url.startsWith('/api/chart'))).toBe(false);
  });

  it('reports a place it cannot find, for the page to show', async () => {
    // Nothing is cast at load, so there is nothing to refuse to cast — the
    // failure travels in the data instead, and the page says it before the
    // press that would otherwise cast for the server's own zone.
    const { data } = await open(consult, '/en?locationId=999999999');

    expect(data.failure).toMatchObject({ code: 'UNKNOWN_LOCATION' });
    expect((data.moment as { place?: unknown }).place).toBeUndefined();
  });

  it('takes the instrument from the address, and refuses one that is not', async () => {
    // Which board the question is put to is setup and travels, so an address
    // that names one reopens on it. A query string is anybody's to write,
    // though, and a name that is not an instrument has to land somewhere the
    // page can cast from: the default, rather than a lookup that misses and
    // leaves the form pointing at nothing. See `instruments.ts`.
    const { data: chosen } = await open(consult, '/en?instrument=liuren');
    expect(chosen.instrument).toBe('liuren');

    const { data: absent } = await open(consult, '/en');
    expect(absent.instrument).toBe('qimen');

    // All four are instruments now — this line named `qizheng` as the outside
    // case and was written to fail on the day phase 18 moved it across, which
    // it did.
    const { data: ofMing } = await open(consult, '/en?instrument=qizheng');
    expect(ofMing.instrument).toBe('qizheng');

    // 太乙 was the outside case twice over, for two different reasons, and is
    // neither now. Phase 20 kept it out on the ground that what such a board
    // would be handed to a model *for* had not been designed; phase 21
    // designed it, and the line has moved across. It is the third **kind** and
    // not merely the fifth row — nothing is asked of it and nobody is on it,
    // its subject being a year — so what this asserts is that `needs: 'year'`
    // survives a reload like the other two.
    const { data: ofTian } = await open(consult, '/en?instrument=taiyi&year=1644');
    expect(ofTian.instrument).toBe('taiyi');
    // The whole of that kind's input, and setup like the place: it comes back
    // on a reload. A year the endpoint would refuse never reaches the field —
    // it falls back to empty, which under this kind means the year being lived
    // and is an answer rather than a gap.
    expect(ofTian.year).toBe('1644');
    expect((await open(consult, '/en?instrument=taiyi&year=99999')).data.year).toBe('');
    // Nothing is cast at load here either, third kind or not.
    expect(ofTian.failure).toBeUndefined();

    // What is left outside, and it is not a board. The 曆注 are computed and
    // are not an instrument of anything: the almanac layer is a page of a
    // published book, a pure function of the date, and there is nothing to lay
    // it on. So the fallback is still exercised, and by the case that will
    // still be outside when every board is in.
    const { data: outside } = await open(consult, '/en?instrument=almanac');
    expect(outside.instrument).toBe('qimen');
  });
});

/**
 * `placeLost` is the distinction the board over the list hangs on, and the two
 * cases look alike from the page: `interval.place` is undefined in both.
 *
 * They are not alike. Naming no place is an ordinary scan, reckoned on the
 * meridian of the zone and said to be; naming one that matches nothing means
 * anything cast from that address is cast for the server's own zone. Guarding
 * on the place itself made a scan without one open no board at all — which is
 * most scans, since the form asks only for two dates.
 */
describe('the moments page', () => {
  it('scans without a place, and says a place was never lost', async () => {
    const { data } = await open(moments, '/en?from=2026-09-01&to=2026-09-08');

    expect(data.scan).toBeTruthy();
    expect((data.interval as { place?: unknown }).place).toBeUndefined();
    expect(data.placeLost).toBe(false);
  });

  it('says a place was lost when the address named one and there is none', async () => {
    const { data, urls } = await open(moments, '/en?from=2026-09-01&to=2026-09-08&locationId=999999999');

    expect(data.placeLost).toBe(true);
    expect(data.scan).toBeUndefined();
    expect(data.failure).toMatchObject({ code: 'UNKNOWN_LOCATION' });
    expect(urls.some((url) => url.startsWith('/api/moments?'))).toBe(false);
  });

  it('says the same before there is an interval to scan', async () => {
    // The panel opens on the coming week and waits; nothing has been lost.
    const { data } = await open(moments, '/en');

    expect(data.scan).toBeUndefined();
    expect(data.placeLost).toBe(false);
  });

  it('keeps the place it was given', async () => {
    const { data, urls } = await open(moments, '/en?from=2026-09-01&to=2026-09-08&locationId=1816670', {
      '1816670': BEIJING,
    });

    expect(data.placeLost).toBe(false);
    expect(urls).toContain('/api/moments?from=2026-09-01&to=2026-09-08&locationId=1816670&lang=en');
  });
});
