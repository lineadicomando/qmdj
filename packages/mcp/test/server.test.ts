import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { createServer, SERVER_NAME } from '../src/server.js';

/**
 * The server is exercised through a real client over an in-memory transport,
 * so that the schemas, the descriptions and the results are the ones a client
 * would actually receive rather than the ones the handlers happen to return.
 */
let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test', version: '0' });
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
});

/** Beijing, so that no test depends on where it runs. */
const BEIJING = {
  latitude: 39.9075,
  longitude: 116.3972,
  timezone: 'Asia/Shanghai',
  date: '2024-06-15',
  time: '14:00',
  day_boundary: 'midnight' as const,
  true_solar_time: false,
};

async function call(name: string, args: Record<string, unknown>): Promise<string> {
  const result = (await client.callTool({ name, arguments: args })) as {
    content: { type: string; text: string }[];
    isError?: boolean;
  };
  return result.content.map((part) => part.text).join('\n');
}

async function failing(name: string, args: Record<string, unknown>): Promise<string> {
  const result = (await client.callTool({ name, arguments: args })) as {
    content: { text: string }[];
    isError?: boolean;
  };
  expect(result.isError).toBe(true);
  return result.content.map((part) => part.text).join('\n');
}

describe('what the server offers', () => {
  it('names itself', async () => {
    expect(client.getServerVersion()?.name).toBe(SERVER_NAME);
  });

  it('exposes the tools an agent needs and no others', async () => {
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'compute_bazi',
      'compute_liuren',
      'compute_qimen_chart',
      'compute_qizheng',
      'draw_liuren',
      'draw_qimen_chart',
      'lunar_date',
      'scan_moments',
      'search_location',
      'solar_terms',
    ]);
  });

  it('tells an agent what not to do', async () => {
    const { tools } = await client.listTools();
    const byName = new Map(tools.map((tool) => [tool.name, tool.description ?? '']));

    // The three ways an agent produces something plausible and wrong, each
    // headed off in the description of the tool that would produce it.
    expect(byName.get('compute_qimen_chart')).toMatch(/OMIT date and time/);
    expect(byName.get('search_location')).toMatch(/do not invent/i);
    expect(byName.get('draw_qimen_chart')).toMatch(/not instead of it/);
    expect(byName.get('draw_liuren')).toMatch(/not instead of it/);
    expect(byName.get('compute_bazi')).toMatch(/do not guess/i);
    // The board of the other 式 answers a question asked now, and the mistake
    // worth heading off is laying it for a birth as if it were a natal chart.
    expect(byName.get('compute_liuren')).toMatch(/not for a birth/i);
    expect(byName.get('compute_liuren')).toMatch(/does not choose the 用神/i);
    // The three things a model reading a 七政四餘 board gets confidently
    // wrong: counting four remainders, reading 羅睺 as Rahu, and taking the
    // lodge boundaries for a published table.
    expect(byName.get('compute_qizheng')).toMatch(/three remainders, not\s+\*\*four\*\*|three remainders, not/i);
    expect(byName.get('compute_qizheng')).toMatch(/descending node here/i);
    expect(byName.get('compute_qizheng')).toMatch(/no epoch\s+enters|no epoch enters/i);
    // The two ways an agent turns a scan into something it is not: dropping
    // the direction, and answering a question that was not asked.
    expect(byName.get('scan_moments')).toMatch(/never the hour alone/i);
    expect(byName.get('scan_moments')).toMatch(/rather than loosening the question/i);
  });

  it('says where it stops, where an agent will read it', async () => {
    const { tools } = await client.listTools();
    const chart = tools.find((tool) => tool.name === 'compute_qimen_chart');

    // The boundary an agent has to be told, now that a fortune comes back with
    // each configuration: the fortune belongs to the arrangement, and reading
    // it as a verdict on the hour is the mistake worth naming outright.
    expect(chart?.description).toMatch(/arrangements only/i);
    expect(chart?.description).toMatch(/property of the arrangement/i);
    expect(chart?.description).toMatch(/does not rank/i);
    expect(chart?.description).toMatch(/not the server's\s+to make/i);
  });

  it('offers reference material without spending context on it', async () => {
    const { resources } = await client.listResources();

    expect(resources.map((resource) => resource.uri).sort()).toEqual([
      'qimendunjia://reference/gates-stars-spirits',
      'qimendunjia://reference/palaces',
      'qimendunjia://reference/purposes',
      'qimendunjia://reference/solar-terms',
    ]);
  });

  it('renders the reference material from the engine, not from a copy', async () => {
    const { contents } = await client.readResource({
      uri: 'qimendunjia://reference/gates-stars-spirits',
    });
    const text = String(contents[0]?.text ?? '');

    expect(text).toContain('休門');
    expect(text).toContain('天蓬');
    expect(text).toContain('值符');
  });
});

describe('compute_qimen_chart', () => {
  it('casts a chart for a place and a moment', async () => {
    const text = await call('compute_qimen_chart', BEIJING);

    expect(text).toContain('yang dun 9');
    expect(text).toContain('天蓬');
    expect(text).toContain('休門');
  });

  it('says which method cast it', async () => {
    expect(await call('compute_qimen_chart', BEIJING)).toContain('chaibu');
  });

  it('casts by the method it is asked for', async () => {
    const zhirun = await call('compute_qimen_chart', { ...BEIJING, method: 'zhirun' });

    expect(zhirun).toContain('zhirun');
    expect(zhirun).not.toContain('chaibu');
  });

  it('reads a date given without a time as noon, not as the hour it is asked in', async () => {
    // Falling back to the clock made the same call answer differently every
    // time it ran. A chart is a pure function of its input and a saved one
    // has to reproduce; noon is the convention `born_time` already declares.
    const text = await call('compute_qimen_chart', {
      latitude: BEIJING.latitude,
      longitude: BEIJING.longitude,
      timezone: BEIJING.timezone,
      date: '2024-06-15',
      day_boundary: 'midnight',
      true_solar_time: false,
    });

    expect(text).toContain('2024-06-15T12:00:00+08:00');
  });

  it('says where the centre lodges', async () => {
    // The centre has no gate and no spirit, so its stem is read elsewhere.
    // An agent that could not see where would have to know it from outside.
    const text = await call('compute_qimen_chart', BEIJING);

    expect(text).toContain('The centre lodges in 2 southwest 坤');
  });

  it("says the almanac's officer for the day", async () => {
    // 曆注. The layer is not part of the board and is reported beside it, so an
    // agent reading a chart can see the page it was traditionally read against
    // without being told what the page says the day suits.
    const text = await call('compute_qimen_chart', BEIJING);

    expect(text).toContain('定 dìng');
    expect(text).toContain('天刑 tiānxíng');
    expect(text).toContain('庚戌');
  });

  /**
   * 年命 — the birth looked up inside the chart, which is the classical
   * direction. The chart is not recast for it, and the 行年 is left out
   * rather than guessed when the direction of its count is unknown.
   */
  it('places a birth in the chart when one is given', async () => {
    const text = await call('compute_qimen_chart', { ...BEIJING, born: '1990-06-01' });

    expect(text).toContain('本命');
    expect(text).toContain('庚午');
    expect(text).not.toContain('行年');
    // The chart itself is the chart of the moment, unmoved.
    expect(text).toContain('yang dun 9');
  });

  it('places the year being lived only with the direction its count runs in', async () => {
    const text = await call('compute_qimen_chart', {
      ...BEIJING,
      born: '1990-06-01',
      gender: 'male',
    });

    expect(text).toContain('行年');
    expect(text).toContain('虛歲');
  });

  it('says nothing of a birth when none was given', async () => {
    expect(await call('compute_qimen_chart', BEIJING)).not.toContain('本命');
  });

  it('tells an agent that this is not a chart of a birth', async () => {
    const { tools } = await client.listTools();
    const chart = tools.find((tool) => tool.name === 'compute_qimen_chart');

    expect(chart?.description).toMatch(/It is not a chart of a birth/);
    expect(chart?.description).toMatch(/no palace here stands for a part of one/);
  });

  it('reads the yuan from the futou when asked, and says it did', async () => {
    // The two readings part company on this day; see the CLI test for why.
    const at = { ...BEIJING, date: '1999-01-06', time: '12:00' };

    expect(await call('compute_qimen_chart', at)).toContain('upper yuan');

    const futou = await call('compute_qimen_chart', { ...at, yuan: 'futou' });
    expect(futou).toContain('middle yuan');
    expect(futou).toContain('futou cycle');
  });

  it('answers in the language it was asked in', async () => {
    const italian = await call('compute_qimen_chart', { ...BEIJING, lang: 'it' });

    expect(italian).toContain('Nove palazzi');
    // The hanzi do not move with the language: they are the names.
    expect(italian).toContain('休門');
  });

  it('refuses half a set of coordinates rather than filling it in', async () => {
    const text = await failing('compute_qimen_chart', { latitude: 39.9, date: '2024-06-15' });

    expect(text).toMatch(/incomplete/i);
    expect(text).toMatch(/search_location/);

    // The refusal is a coded error like any other, so it arrives in the
    // language the agent asked for.
    const italian = await failing('compute_qimen_chart', {
      latitude: 39.9,
      date: '2024-06-15',
      lang: 'it',
    });
    expect(italian).toMatch(/Le coordinate sono incomplete/);
  });

  it('refuses an invented location id', async () => {
    expect(await failing('compute_qimen_chart', { location_id: 1 })).toMatch(/do not invent/i);

    expect(await failing('compute_qimen_chart', { location_id: 1, lang: 'it' })).toMatch(
      /non inventarlo/,
    );
  });

  it('rejects a malformed date at the schema, before any calculation', async () => {
    // The shape of a date is stated in the tool's schema, so validation
    // refuses it before the engine runs and the agent is told which field is
    // wrong. That message comes from the protocol and is not translated —
    // the only text this server emits that is not.
    const text = await failing('compute_qimen_chart', { ...BEIJING, date: '15/06/2024' });

    expect(text).toMatch(/validation/i);
    expect(text).toMatch(/date/);
  });

  it('reports a domain error in the language the agent asked for', async () => {
    // A zone name has no shape a schema can check: it reaches the engine,
    // which rejects it by code, and the code is translated here.
    const text = await failing('compute_qimen_chart', {
      ...BEIJING,
      timezone: 'Mars/Olympus',
      lang: 'it',
    });

    expect(text).toMatch(/sconosciuto/);
  });
});

describe('compute_bazi', () => {
  it('reads the pillars out', async () => {
    const text = await call('compute_bazi', { ...BEIJING, gender: 'male' });

    expect(text).toContain('day master');
    expect(text).toContain('Luck cycles');
  });

  it('leaves the cycles out without a gender, and says so', async () => {
    const text = await call('compute_bazi', BEIJING);

    expect(text).not.toContain('Luck cycles');
    expect(text).toMatch(/gender/);
  });
});

describe('the other tools', () => {
  it('lists the terms of a year in a named zone', async () => {
    const text = await call('solar_terms', { year: 2024, timezone: 'Asia/Shanghai' });

    expect(text).toContain('立春');
    expect(text).toContain('2024-02-04 16:27');
  });

  it('gives a lunar date, leap months included', async () => {
    const text = await call('lunar_date', {
      date: '2023-04-01',
      time: '12:00',
      timezone: 'Asia/Shanghai',
    });

    expect(text).toMatch(/leap month 2\/11/);
  });

  it('draws a chart as an SVG', async () => {
    const text = await call('draw_qimen_chart', { ...BEIJING, size: 400 });

    expect(text.startsWith('<svg')).toBe(true);
    // `size` is the width. The height is the width plus whatever the list of
    // configurations under the board needs, which depends on the hour — the
    // board itself is the same square on every chart.
    const box = /viewBox="0 0 (\d+) ([\d.]+)"/.exec(text);
    expect(Number(box?.[1])).toBe(400);
    expect(Number(box?.[2])).toBeGreaterThanOrEqual(400);
    // Framed by the directions: an agent that passes the picture on has
    // passed on which way it faces, which is half of what was asked.
    expect(text).toContain('>NE<');
    expect(text).toContain('>子<');
  });

  it('says a place search in the language it was asked in', async () => {
    // Every other tool translates its scaffolding; this one used to answer in
    // English whatever `lang` said, so a model relaying the result handed
    // somebody Italian place names under an English sentence.
    const found = await call('search_location', { query: 'Roma', lang: 'it' });
    expect(found).toMatch(/candidat/i);
    expect(found).toContain('location_id');
    expect(found).not.toMatch(/The first column/);

    const missing = await call('search_location', { query: 'Zzzzzq', lang: 'it' });
    expect(missing).toMatch(/Nessun luogo trovato/);
    expect(missing).not.toMatch(/No place found/);
  });
});


describe('scan_moments', () => {
  const INTERVAL = {
    latitude: BEIJING.latitude,
    longitude: BEIJING.longitude,
    timezone: BEIJING.timezone,
    true_solar_time: false,
    day_boundary: 'midnight' as const,
    from: '2026-09-01',
    to: '2026-09-03',
  };

  it('answers with the hour and the way to face, never the hour alone', async () => {
    const text = await call('scan_moments', { ...INTERVAL, gate: 'kaimen' });

    expect(text).toContain('2026-09-01');
    expect(text).toContain('Open');
    // The palace names itself by its direction, which is half the answer.
    expect(text).toMatch(/\d (north|northeast|east|southeast|south|southwest|west|northwest)/);
  });

  it('keeps the name beside the word where the table has room for it', async () => {
    const text = await call('scan_moments', { ...INTERVAL, gate: 'kaimen' });

    // The hour pillar and the palace carry theirs, as the palace table of
    // compute_qimen_chart does. The gate, star and spirit columns are glossed
    // alone there too: four more pairs of hanzi would put this table past any
    // terminal, and an agent that needs the name has compute_qimen_chart.
    expect(text).toMatch(/· (Rat|Ox|Tiger|Rabbit|Dragon)\s+[甲乙丙丁戊己庚辛壬癸]/);
    expect(text).toMatch(/\d (north|south|east|west|northeast|northwest|southeast|southwest) [坎坤震巽乾兌艮離]/);
  });

  it('offers every spirit a chart can show, not one plate of them', async () => {
    const { tools } = await client.listTools();
    const scan = tools.find((tool) => tool.name === 'scan_moments');
    const spirit = (scan?.inputSchema as { properties: Record<string, { enum?: string[] }> })
      .properties['spirit'];

    // baihu stands only in a yin chart. A schema built from the yang plate
    // would make it unaskable for half the charts of the year.
    expect(spirit?.enum).toContain('baihu');
    expect(spirit?.enum).toContain('gouchen');
    expect(spirit?.enum).toHaveLength(10);
  });

  it('says that nothing answered rather than returning an empty table', async () => {
    const text = await call('scan_moments', {
      ...INTERVAL,
      gate: 'kaimen',
      star: 'tianpeng',
      spirit: 'zhifu',
      min_strength: 'wang',
    });

    if (!text.includes('Open')) expect(text).toMatch(/No palace/i);
  });

  it('refuses an interval the engine will not walk', async () => {
    const text = await failing('scan_moments', {
      ...INTERVAL,
      from: '2026-01-01',
      to: '2028-01-01',
    });

    expect(text).toMatch(/longer than/i);
  });

  it('carries no verdict about any hour it reports', async () => {
    const text = (await call('scan_moments', { ...INTERVAL, gate: 'kaimen' })).toLowerCase();

    for (const word of ['lucky', 'favourable', 'auspicious', 'best', 'avoid', 'recommend']) {
      expect(text).not.toContain(word);
    }
  });

  it('reads a birth on its own clock, even when the place came as a location_id', async () => {
    // 立春 2024 falls at 16:27 Beijing time, 09:27 in Rome. Ten in the
    // morning is on one side of it in Rome and the other in Beijing, so the
    // zone of the birth decides the year pillar: 甲辰 born in Rome, 癸卯 born
    // in Beijing. A resolution that let the interval's place override
    // `born_timezone` would admit the other year's palaces.
    const interval = { location_id: 1816670, from: INTERVAL.from, to: INTERVAL.to };
    const birth = { born: '2024-02-04', born_time: '10:00' };

    const rome = await call('scan_moments', { ...interval, ...birth, born_timezone: 'Europe/Rome' });
    const beijing = await call('scan_moments', { ...interval, ...birth });
    expect(rome).not.toBe(beijing);

    // And each admits exactly the palaces its year's stem stands on: 甲辰 is
    // looked for under 壬, the instrument of its decade, and 癸 under itself.
    expect(rome).toBe(await call('scan_moments', { ...interval, stem: 'ren' }));
    expect(beijing).toBe(await call('scan_moments', { ...interval, stem: 'gui' }));
  });
});


describe('the errands', () => {
  it('are a resource an agent reads, not an argument the server applies', async () => {
    const { tools } = await client.listTools();
    const scan = tools.find((tool) => tool.name === 'scan_moments');
    const properties = (scan?.inputSchema as { properties: Record<string, unknown> }).properties;

    // The tool takes the arrangement and never the errand. Were it otherwise
    // the server would be applying a doctrine where nobody could see it.
    expect(Object.keys(properties)).not.toContain('purpose');
    expect(Object.keys(properties)).not.toContain('for');
    expect(properties['gate']).toBeDefined();
  });

  it('name an errand and the gate it stands for, both ways round', async () => {
    const { contents } = await client.readResource({
      uri: 'qimendunjia://reference/purposes',
    });
    const text = String(contents[0]?.text ?? '');

    expect(text).toMatch(/Opening[^|]*\|[^|]*開門/);
    expect(text).toContain('`kaimen`');
    // Eight, because there are eight gates.
    expect(text.match(/^\| .+ \| .+ \|$/gm)).toHaveLength(9); // the header row too
  });

  it('keeps the gates nobody calls auspicious, with their own uses', async () => {
    const { contents } = await client.readResource({
      uri: 'qimendunjia://reference/purposes',
    });
    const text = String(contents[0]?.text ?? '');

    // Their absence would turn a table of associations into a list of good
    // things to do, which is the thing this server does not produce.
    expect(text).toContain('死門');
    expect(text).toContain('傷門');
  });

  it('tells an agent whose the choice is', async () => {
    const { resources } = await client.listResources();
    const purposes = resources.find((resource) => resource.uri.endsWith('/purposes'));

    expect(purposes?.description).toMatch(/the server does not apply it/i);
  });
});
