import { describe, expect, it } from 'vitest';
import { GET as chart } from '../src/routes/api/chart/+server';
import { GET as plate } from '../src/routes/api/chart/plate/+server';
import { GET as bazi } from '../src/routes/api/bazi/+server';
import { GET as terms } from '../src/routes/api/terms/+server';
import { GET as locations } from '../src/routes/api/locations/+server';

/**
 * The endpoints are called as SvelteKit calls them, with a URL and a request.
 * What is asserted is the contract a client depends on: the shape of the
 * answer, the cache header, and the shape of a failure.
 */
type Handler = (event: never) => Response | Promise<Response>;

interface Called {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  text: string;
}

async function call(handler: Handler, query: string, accept = 'en'): Promise<Called> {
  const url = new URL(`http://localhost/api?${query}`);
  const headers: Record<string, string> = {};
  const event = {
    url,
    request: new Request(url, { headers: { 'accept-language': accept } }),
    setHeaders: (values: Record<string, string>) => Object.assign(headers, values),
  };

  try {
    const response = await handler(event as never);
    const text = await response.text();
    return {
      status: response.status,
      headers: { ...headers, ...Object.fromEntries(response.headers) },
      body: text.startsWith('{') ? JSON.parse(text) : undefined,
      text,
    };
  } catch (thrown) {
    // `error()` throws; what it throws is the response the client will see.
    const failure = thrown as { status: number; body: Record<string, unknown> };
    return { status: failure.status, headers, body: failure.body, text: '' };
  }
}

const MOMENT = 'date=2024-06-15&time=14:00&timezone=Asia/Shanghai&trueSolarTime=false&dayBoundary=midnight';

describe('GET /api/chart', () => {
  it('casts a chart from the query string alone', async () => {
    const { status, body } = await call(chart, MOMENT);
    const answer = body as { chart: { ju: unknown; palaces: unknown[] } };

    expect(status).toBe(200);
    expect(answer.chart.ju).toMatchObject({ yang: true, number: 9, yuan: 'xia' });
    expect(answer.chart.palaces).toHaveLength(9);
  });

  it('is cacheable by the browser that asked, and by nothing else', async () => {
    // The key of a shared cache would be an address holding somebody's date,
    // time and place of birth.
    const { headers } = await call(chart, MOMENT);

    expect(headers['cache-control']).toBe('private, max-age=86400');
  });

  it('carries the options that produced it', async () => {
    const { body } = await call(chart, MOMENT);

    expect((body as { chart: { options: unknown } }).chart.options).toMatchObject({
      method: 'chaibu',
      trueSolarTime: false,
      dayBoundary: 'midnight',
    });
  });

  it('needs nothing at all', async () => {
    // No date, no time, no place: the present moment, in the server's zone.
    expect((await call(chart, '')).status).toBe(200);
  });

  it('is not cacheable at all when the address does not say when', async () => {
    // Without a date the question is "now", which is a different question
    // every hour: an answer kept for a day would be yesterday's chart.
    expect((await call(chart, 'timezone=Asia/Shanghai')).headers['cache-control']).toBe('no-store');
    expect((await call(chart, 'date=2024-06-15')).headers['cache-control']).toBe('no-store');
  });

  it('leaves the longitude correction at zero when given only a timezone', async () => {
    // The stand-in meridian must come from the offset at the chart's moment:
    // read from today's clock, a winter chart requested in summer would carry
    // a spurious hour of correction. One of the two dates catches it in
    // whichever season this test runs.
    for (const date of ['2024-01-15', '2024-07-15']) {
      const { body } = await call(chart, `date=${date}&time=10:00&timezone=Europe/Rome`);
      const answer = body as { chart: { moment: { solar: { longitudeMinutes: number } } } };

      expect(answer.chart.moment.solar.longitudeMinutes).toBe(0);
    }
  });

  it('fails with a code and parameters, not with prose', async () => {
    const { status, body } = await call(chart, 'date=15/06/2024');

    expect(status).toBe(400);
    expect(body).toMatchObject({
      code: 'INVALID_DATE',
      messageKey: 'core.error.INVALID_DATE',
      params: { date: '15/06/2024' },
    });
  });

  it('refuses half a set of coordinates', async () => {
    expect((await call(chart, 'latitude=39.9')).status).toBe(400);
  });
});

describe('GET /api/bazi', () => {
  it('reads the pillars out', async () => {
    const { body } = await call(bazi, `${MOMENT}&gender=male`);
    const answer = body as { bazi: { pillars: unknown[]; luck?: unknown } };

    expect(answer.bazi.pillars).toHaveLength(4);
    expect(answer.bazi.luck).toBeTruthy();
  });

  it('leaves the cycles out without a gender', async () => {
    const { body } = await call(bazi, MOMENT);

    expect((body as { bazi: { luck?: unknown } }).bazi.luck).toBeUndefined();
  });
});

describe('GET /api/terms', () => {
  it('lists twenty-four terms', async () => {
    const { body } = await call(terms, 'year=2024&timezone=Asia/Shanghai');

    expect((body as { terms: unknown[] }).terms).toHaveLength(24);
  });

  it('may be cached anywhere, unlike a chart', async () => {
    // A year's terms are a published fact about the sky, not about a person.
    const { headers } = await call(terms, 'year=2024');

    expect(headers['cache-control']).toMatch(/^public/);
  });
});

describe('GET /api/locations', () => {
  it('returns candidates and chooses none of them', async () => {
    const { body } = await call(locations, 'q=Rome');
    const results = (body as { results: { countryCode: string }[] }).results;

    expect(results.length).toBeGreaterThan(1);
    expect(new Set(results.map((place) => place.countryCode)).size).toBeGreaterThan(1);
  });

  it('searches every language and answers in the one asked for', async () => {
    const { body } = await call(locations, 'q=Munich&lang=it');
    const first = (body as { results: { name: string }[] }).results[0];

    expect(first?.name).toBe('Monaco di Baviera');
  });

  it('reports an empty query rather than returning everything', async () => {
    const { status, body } = await call(locations, 'q=');

    expect(status).toBe(400);
    expect(body).toMatchObject({ code: 'EMPTY_QUERY' });
  });

  it('finds a place by identifier, in the shape a search answers in', async () => {
    // An address carries the identifier and not the name: this is what lets a
    // form reopen with the place still chosen.
    const { body } = await call(locations, 'q=Rome');
    const rome = (body as { results: { id: number; name: string }[] }).results[0];

    const again = await call(locations, `id=${rome.id}`);
    const results = (again.body as { results: { id: number; name: string }[] }).results;

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: rome.id, name: rome.name });
  });

  it('answers an identifier in the language asked for', async () => {
    const { body } = await call(locations, 'q=Munich&lang=it');
    const munich = (body as { results: { id: number }[] }).results[0];

    const { body: italian } = await call(locations, `id=${munich.id}&lang=it`);

    expect((italian as { results: { name: string }[] }).results[0]?.name).toBe(
      'Monaco di Baviera',
    );
  });

  it('says a place is unknown with a code, not with an empty list', async () => {
    const { status, body } = await call(locations, 'id=0');

    expect(status).toBe(404);
    expect(body).toMatchObject({
      code: 'UNKNOWN_LOCATION',
      messageKey: 'web.error.UNKNOWN_LOCATION',
      params: { id: '0' },
    });
  });
});

describe('GET /api/chart/plate', () => {
  it('returns an SVG', async () => {
    const { status, headers, text } = await call(plate, `${MOMENT}&size=400`);

    expect(status).toBe(200);
    expect(headers['content-type']).toMatch(/image\/svg\+xml/);
    expect(text.startsWith('<svg')).toBe(true);
  });

  it('writes the palaces in the language it was asked for', async () => {
    const english = await call(plate, `${MOMENT}&lang=en`);
    const italian = await call(plate, `${MOMENT}&lang=it`);

    // The drawing is where the Chinese gives way: someone who cannot read it
    // has nothing to hold on to in a picture, where a table can carry both.
    expect(english.text).toContain('Rest');
    expect(italian.text).toContain('Riposo');
    expect(english.text).not.toContain('休門');
  });

  it('resolves to one appearance when asked, and carries both when not', async () => {
    // A page that knows what its reader picked asks for that one; a drawing
    // dropped anywhere else carries both behind a media query, because an
    // `<img>` resolves those against the system and not against the page.
    const auto = await call(plate, MOMENT);
    const dark = await call(plate, `${MOMENT}&scheme=dark`);

    expect(auto.text).toContain('prefers-color-scheme');
    expect(dark.text).not.toContain('prefers-color-scheme');
  });
});
