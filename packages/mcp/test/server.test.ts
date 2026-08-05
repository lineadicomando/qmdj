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
      'compute_qimen_chart',
      'draw_qimen_chart',
      'lunar_date',
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
    expect(byName.get('compute_bazi')).toMatch(/do not guess/i);
  });

  it('says it does not interpret, where an agent will read it', async () => {
    const { tools } = await client.listTools();
    const chart = tools.find((tool) => tool.name === 'compute_qimen_chart');

    expect(chart?.description).toMatch(/arrangements only/i);
    expect(chart?.description).toMatch(/not the server's to say/i);
  });

  it('offers reference material without spending context on it', async () => {
    const { resources } = await client.listResources();

    expect(resources.map((resource) => resource.uri).sort()).toEqual([
      'qimendunjia://reference/gates-stars-spirits',
      'qimendunjia://reference/palaces',
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
  });

  it('refuses an invented location id', async () => {
    expect(await failing('compute_qimen_chart', { location_id: 1 })).toMatch(/do not invent/i);
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
    expect(text).toContain('viewBox="0 0 400 400"');
    // The picture carries the note that it is not a reading.
    expect(text).toMatch(/not the engine/i);
  });
});
