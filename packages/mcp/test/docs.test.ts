import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CHART_PARAMETERS, implementedValues } from '@shipan/core';
import { beforeAll, describe, expect, it } from 'vitest';
import { createServer } from '../src/server.js';

/**
 * How many tools and how many resources this server offers is stated in
 * `docs/architecture.md`, and a number written by hand drifts: `README.md`
 * said «eleven tools» while the server registered twelve.
 *
 * The count is taken from a real client rather than from the source, because
 * what a document claims is what a caller is offered — a tool registered and
 * never listed would be a different bug and this test should not hide it.
 *
 * The rest of the surface counts are asserted in `apps/web/test/docs.test.ts`.
 */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

let client: Client;

beforeAll(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test', version: '0' });
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
});

const architecture = (): string => readFileSync(join(ROOT, 'docs/architecture.md'), 'utf8');

describe('the counts docs/architecture.md states about MCP', () => {
  it('names as many tools as the server offers', async () => {
    const { tools } = await client.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(
      architecture(),
      `docs/architecture.md should say "${tools.length} tools"`,
    ).toContain(`${tools.length} tools`);
  });

  it('names as many reference resources as the server offers', async () => {
    const { resources } = await client.listResources();
    expect(resources.length).toBeGreaterThan(0);
    expect(
      architecture(),
      `docs/architecture.md should say "${resources.length} reference resources"`,
    ).toContain(`${resources.length} reference resources`);
  });
});

/**
 * The instructions are the only thing a client always sees, and they had gone
 * stale in the way a hand-written count goes stale: they opened on «Qi Men Dun
 * Jia charts and the Four Pillars» while the server had been laying six boards
 * since 紫微斗數 landed. Nothing could have noticed — the sentence was true
 * when it was written and no test read it.
 *
 * So the same bargain the counts get. A board added to this server has to be
 * named in the frame a caller reads before choosing one, because the frame is
 * where the choice is made: an agent that never learns 太乙 is offered will
 * cast the board it was told about instead of the board that answers.
 */
describe('the instructions the server always sends', () => {
  it('names every compute tool the server offers', async () => {
    const { tools } = await client.listTools();
    const compute = tools.map((tool) => tool.name).filter((name) => name.startsWith('compute_'));
    expect(compute.length).toBeGreaterThan(0);

    const instructions = client.getInstructions() ?? '';
    for (const name of compute) {
      expect(instructions, `the instructions should name ${name}`).toContain(name);
    }
  });

  /**
   * The one rule whose failure happens before anything has been read: an agent
   * handed six boards calls three and reports their agreement. `docs/readings.md`
   * owns the argument; this asserts the line survives an edit of the frame.
   */
  it('says that one board is read and never two of one instant', () => {
    expect(client.getInstructions() ?? '').toContain('NEVER TWO OF ONE INSTANT');
  });
});

/**
 * What an agent is offered for a school divergence, against what the engine
 * computes.
 *
 * The tool schema names the *implemented* values and not the declared ones,
 * which is the same choice the web form makes and for the same reason: an
 * option that can only ever come back as an error is not a choice, and a
 * model handed 茅山 in an enum will eventually pass it. What that costs is a
 * copy of the implemented list, sitting where nothing but this test can see
 * that it has fallen behind — and the day 飛盤 or a second 神煞 register
 * lands, an agent would go on being told the old set.
 *
 * Asked of a real client, like the counts above: what a caller is offered is
 * the claim, and a schema built and never listed would be a different bug.
 */
describe('the values the tool schema offers', () => {
  const enumOf = async (tool: string, property: string): Promise<unknown> => {
    const { tools } = await client.listTools();
    const found = tools.find((candidate) => candidate.name === tool);
    expect(found, `the server offers no ${tool}`).toBeDefined();
    const properties = (found?.inputSchema as { properties: Record<string, { enum?: unknown }> })
      .properties;
    return properties[property]?.enum;
  };

  // The chart's options, by the name an agent passes them under. `shensha`
  // rides on the chart tools because the almanac line comes back with the
  // chart, and it is the almanac's parameter wherever it is written.
  const offered: Array<[string, keyof typeof CHART_PARAMETERS]> = [
    ['method', 'method'],
    ['yuan', 'yuan'],
    ['day_boundary', 'dayBoundary'],
    ['year_boundary', 'yearBoundary'],
    ['shensha', 'shensha'],
  ];

  for (const [property, parameter] of offered) {
    it(`offers for ${property} exactly what the engine computes`, async () => {
      expect(await enumOf('compute_qimen_chart', property)).toEqual(
        implementedValues(CHART_PARAMETERS[parameter]),
      );
    });
  }
});
