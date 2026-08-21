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
