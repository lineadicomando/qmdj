import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
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
