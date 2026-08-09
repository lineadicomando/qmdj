import { describe, expect, it } from 'vitest';
import { GET as chart } from '../src/routes/api/chart/+server';
import { GET as plate } from '../src/routes/api/chart/plate/+server';
import { GET as prompt } from '../src/routes/api/chart/prompt/+server';
import { GET as text_ } from '../src/routes/api/chart/text/+server';
import { GET as bazi } from '../src/routes/api/bazi/+server';
import { GET as terms } from '../src/routes/api/terms/+server';
import { GET as locations } from '../src/routes/api/locations/+server';
import { GET as moments } from '../src/routes/api/moments/+server';

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

  it('casts by the method the address chooses', async () => {
    // The same instant under the two schools, and not even the dun survives:
    // 15 June 2024 is ten days into 芒種, lower yuan of a yang chart under
    // chaibu — but its 庚戌 day stands in a block already serving 夏至, six
    // days before the Sun gets there (超神), and 夏至 opens the yin half.
    const { body } = await call(chart, `${MOMENT}&method=zhirun`);
    const answer = body as { chart: { ju: Record<string, unknown>; options: { method: string } } };

    expect(answer.chart.options.method).toBe('zhirun');
    expect(answer.chart.ju).toMatchObject({ yang: false, number: 9, yuan: 'shang' });
    expect(answer.chart.ju['term']).toMatchObject({ id: 'xiazhi' });
  });

  it('refuses a method it has never heard of', async () => {
    // Ignoring it instead would cast a chaibu chart under whatever name the
    // address misspelt, and it would look exactly like the chart asked for.
    const { status, body } = await call(chart, `${MOMENT}&method=zhirn`);

    expect(status).toBe(400);
    expect(body).toMatchObject({
      code: 'UNKNOWN_IDENTIFIER',
      params: { parameter: 'method', value: 'zhirn' },
    });
  });

  it('answers maoshan with a refusal, not a substitute', async () => {
    const { status, body } = await call(chart, `${MOMENT}&method=maoshan`);

    expect(status).toBe(501);
    expect(body).toMatchObject({ code: 'METHOD_NOT_IMPLEMENTED' });
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

    // The word leads, in the reader's own language — but the drawing carries
    // both, as the table does: 休門 is what the gate is called, and a reader
    // who knows the subject looks for it in the picture too.
    expect(english.text).toContain('Rest');
    expect(italian.text).toContain('Riposo');
    expect(english.text).toContain('休門');
    // Down to the pillars along the top and the chief along the foot.
    expect(english.text).toMatch(/chief Canopy 天蓬 — chief gate Rest 休門/);
  });

  it('frames the drawing with the directions, in the language it was asked for', async () => {
    const english = await call(plate, `${MOMENT}&lang=en`);
    const italian = await call(plate, `${MOMENT}&lang=it`);

    // West is W in English and O in Italian, from `ovest`: the abbreviation
    // is not the word cut short, which is why it has a key of its own.
    expect(english.text).toContain('>W<');
    expect(italian.text).toContain('>O<');
    // And the branches beside them, which are the same in either.
    expect(english.text).toContain('>子<');
    expect(italian.text).toContain('>子<');
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

describe('GET /api/chart/text', () => {
  it('says the chart in words, in the language it was asked for', async () => {
    const { status, headers, text } = await call(text_, `${MOMENT}&lang=en`);

    expect(status).toBe(200);
    expect(headers['content-type']).toMatch(/text\/plain/);
    expect(text).toContain('yang dun');
    expect(text).toContain('休門');
    expect((await call(text_, `${MOMENT}&lang=it`)).text).toContain('Riposo');
  });

  it('says where the chart can be cast again', async () => {
    // The page and the API read the same query string, so the address of one
    // is the address of the other with the section's path.
    const { text } = await call(text_, `${MOMENT}&lang=it`);

    expect(text).toContain('http://localhost/it?date=2024-06-15&time=14%3A00');
    expect(text).not.toContain('lang=it');
  });

  it('is cacheable by the browser that asked, and by nothing else', async () => {
    expect((await call(text_, MOMENT)).headers['cache-control']).toBe('private, max-age=86400');
    expect((await call(text_, 'timezone=Asia/Shanghai')).headers['cache-control']).toBe('no-store');
  });
});

describe('GET /api/chart/prompt', () => {
  it('carries the chart and the rules for reading it', async () => {
    const { status, headers, text } = await call(prompt, `${MOMENT}&lang=en`);

    expect(status).toBe(200);
    expect(headers['content-type']).toMatch(/text\/plain/);
    // The chart itself, and not merely an instruction to cast one: a model
    // given a date casts it from memory and gets it wrong.
    expect(text).toContain('yang dun');
    expect(text).toContain('用神');
    expect(text).toContain('Do not rank the palaces');
  });

  /**
   * The question is somebody's own, and a query string is written into every
   * log between the browser and this handler. So the server is told only that
   * one exists, and the prompt ends on the line the browser appends it to.
   */
  it('is told that a question exists, and never what it is', async () => {
    const without = await call(prompt, `${MOMENT}&lang=en`);
    const with_ = await call(prompt, `${MOMENT}&lang=en&asked=true`);

    expect(without.text).toContain('No question was asked');
    expect(with_.text.endsWith('The question asked is:\n')).toBe(true);
  });

  it('leaves the parameters only the API answers to out of the address it cites', async () => {
    const { text } = await call(prompt, `${MOMENT}&lang=en&asked=true`);

    expect(text).toContain('http://localhost/en?date=2024-06-15');
    expect(text).not.toContain('asked=true');
  });

  it('fails with a code and parameters, as every other endpoint does', async () => {
    const { status, body } = await call(prompt, 'date=15/06/2024');

    expect(status).toBe(400);
    expect(body).toMatchObject({ code: 'INVALID_DATE' });
  });
});


describe('GET /api/moments', () => {
  const INTERVAL =
    'from=2026-09-01&to=2026-09-03&latitude=39.9075&longitude=116.3972&timezone=Asia/Shanghai&trueSolarTime=false&dayBoundary=midnight';

  it('narrows the palaces of an hour, not the hours themselves, when given a gate', async () => {
    const { status, body } = await call(moments, `${INTERVAL}&gate=kaimen`);
    const answer = body as { scanned: number; moments: { start: string; palaces: unknown[] }[] };

    expect(status).toBe(200);
    expect(answer.scanned).toBeGreaterThan(20);

    // Naming a gate removes no hour: the open gate stands somewhere in every
    // chart. What it does is say where — one palace of the nine.
    expect(answer.moments).toHaveLength(answer.scanned);
    for (const moment of answer.moments) {
      expect(moment.start).toMatch(/^2026-09-0[12]T/);
      expect(moment.palaces).toHaveLength(1);
    }
  });

  it('removes hours only when what is asked can be absent from one', async () => {
    const { body: all } = await call(moments, `${INTERVAL}&gate=kaimen`);
    const { body: south } = await call(moments, `${INTERVAL}&gate=kaimen&towards=se,s`);

    const count = (answer: unknown): number => (answer as { moments: unknown[] }).moments.length;
    expect(count(south)).toBeGreaterThan(0);
    expect(count(south)).toBeLessThan(count(all));
  });

  it('carries the direction, which is half the answer', async () => {
    const { body } = await call(moments, `${INTERVAL}&gate=kaimen`);
    const [first] = (body as { moments: { palaces: { palace: { direction: string } }[] }[] }).moments;

    expect(first?.palaces[0]?.palace.direction).toMatch(/^(n|ne|e|se|s|sw|w|nw)$/);
  });

  it('cuts the chart down to what was asked about, and says nothing of the rest', async () => {
    const { body } = await call(moments, `${INTERVAL}&gate=kaimen`);
    const [first] = (body as { moments: { palaces: unknown[]; patterns: { palace?: number }[] }[] })
      .moments;
    const number = (first?.palaces[0] as { palace: { number: number } }).palace.number;

    // Configurations of the palace that answered, or of the whole board.
    for (const pattern of first?.patterns ?? []) {
      if (pattern.palace !== undefined) expect(pattern.palace).toBe(number);
    }
  });

  it('is private and never public: the address holds a place and a calendar', async () => {
    const { headers } = await call(moments, INTERVAL);

    expect(headers['cache-control']).toContain('private');
    expect(headers['cache-control']).not.toContain('public');
  });

  it('refuses an interval longer than it will walk', async () => {
    const { status, body } = await call(
      moments,
      'from=2026-01-01&to=2026-12-01&timezone=Asia/Shanghai',
    );

    expect(status).toBe(400);
    expect((body as { code: string }).code).toBe('INTERVAL_TOO_LONG');
  });

  it('refuses an identifier the engine has never heard of', async () => {
    // Left unchecked it would match nothing, which reads exactly like an
    // arrangement that never occurred.
    const { status, body } = await call(moments, `${INTERVAL}&gate=kaimen1`);

    expect(status).toBe(400);
    expect((body as { code: string; params: { value: string } }).code).toBe('UNKNOWN_IDENTIFIER');
    expect((body as { params: { value: string } }).params.value).toBe('kaimen1');
  });

  it('answers with nothing rather than with the nearest thing', async () => {
    const { status, body } = await call(
      moments,
      `${INTERVAL}&gate=kaimen&star=tianpeng&spirit=zhifu&minStrength=wang`,
    );

    expect(status).toBe(200);
    // Whatever it found, it found by the question as asked.
    for (const moment of (body as { moments: { palaces: any[] }[] }).moments) {
      expect(moment.palaces[0].gate.id).toBe('kaimen');
      expect(moment.palaces[0].star.id).toBe('tianpeng');
    }
  });

  it('carries no verdict about any hour it reports', async () => {
    const { text } = await call(moments, `${INTERVAL}&gate=kaimen`);

    for (const word of ['lucky', 'favourable', 'auspicious', 'best', 'avoid', 'score']) {
      expect(text.toLowerCase()).not.toContain(word);
    }
  });
});
