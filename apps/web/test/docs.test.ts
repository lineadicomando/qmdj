import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { INSTRUMENTS } from '../src/lib/instruments';
import { SECTIONS } from '../src/lib/navigation';

/**
 * The documents count things, and a count written by hand drifts.
 *
 * `README.md` said «eleven tools» while the server registered twelve, and
 * nothing anywhere could have noticed: the sentence was true when it was
 * written and no test read it. So the counts a document states are asserted
 * here against the code that produces them, and a phase that adds an endpoint
 * fails this suite until the sentence is corrected.
 *
 * The rule the documents follow — `docs/README.md` § "One fact, one home" —
 * is that a number belongs in one page. `docs/architecture.md` is that page
 * for the surfaces; `README.md` says how many boards there are because that
 * is what somebody arriving counts. Nothing else states a number, and nothing
 * else should.
 *
 * The MCP half of the same check lives in `packages/mcp/test/docs.test.ts`,
 * where a real client can be asked what it was offered.
 */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const read = (path: string): string => readFileSync(join(ROOT, path), 'utf8');

/**
 * The documents spell small numbers out, as prose does. The test therefore
 * has to know both faces of a count rather than forcing the prose into
 * digits — a page that read "9 commands" would be a page written for its
 * test.
 */
const WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

const spelled = (n: number): string => (n < WORDS.length ? WORDS[n] : String(n));

/** `<count> <noun>`, in whichever face the prose uses, anywhere in the file. */
function expectCount(path: string, count: number, noun: string): void {
  const document = read(path);
  const faces = [`${spelled(count)} ${noun}`, `${count} ${noun}`];
  const found = faces.some((face) => document.toLowerCase().includes(face.toLowerCase()));

  expect(
    found,
    `${path} should say "${faces[0]}" — the code has ${count} ${noun}. ` +
      `Whichever sentence states it is now wrong.`,
  ).toBe(true);
}

/** Every `+server.ts` under `src/routes/api`, at any depth. */
function endpoints(directory: string): number {
  let total = 0;
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) total += endpoints(path);
    else if (entry === '+server.ts') total += 1;
  }
  return total;
}

/** The `COMMANDS` tuple of the CLI, read as text: the test must not import it. */
function cliCommands(): number {
  const source = read('packages/core/src/cli.ts');
  const declaration = /const COMMANDS = \[([^\]]*)\] as const;/.exec(source);
  expect(declaration, 'cli.ts should declare COMMANDS as an array literal').not.toBeNull();
  return (declaration?.[1].match(/'[a-z]+'/g) ?? []).length;
}

describe('the counts the documents state', () => {
  it('names as many REST endpoints as there are', () => {
    const count = endpoints(join(ROOT, 'apps/web/src/routes/api'));
    expect(count).toBeGreaterThan(0);
    expectCount('docs/architecture.md', count, 'GET endpoints');
  });

  it('names as many sections as the nav lists', () => {
    expectCount('docs/architecture.md', SECTIONS.length, 'sections');
  });

  it('names as many CLI commands as the CLI takes', () => {
    expectCount('docs/architecture.md', cliCommands(), 'commands');
  });

  it('names as many boards as the consultation offers', () => {
    expectCount('README.md', INSTRUMENTS.length, 'boards');
  });
});

describe('the documents point where they say they point', () => {
  /**
   * The reorganisation traded length for links, which trades one failure for
   * another: a rule in `CLAUDE.md` is now a line and a pointer, and a pointer
   * to a file that does not exist is worse than the paragraph it replaced.
   */
  const linked = (path: string): string[] => {
    const document = read(path);
    return [...document.matchAll(/\]\(([^)#]+\.(?:md|tsv))(?:#[^)]*)?\)/g)]
      .map((match) => match[1])
      .filter((target) => !target.startsWith('http'));
  };

  for (const source of ['CLAUDE.md', 'README.md', 'ROADMAP.md', 'docs/README.md']) {
    it(`${source} links only to files that exist`, () => {
      for (const target of linked(source)) {
        const base = source.includes('/') ? source.slice(0, source.lastIndexOf('/') + 1) : '';
        expect(() => statSync(join(ROOT, base, target)), `${source} → ${target}`).not.toThrow();
      }
    });
  }

  it('keeps the history out of the rules', () => {
    /**
     * `docs/history/` is never normative, so nothing that binds a change may
     * cite it as the reason for anything. `CLAUDE.md` may name the directory
     * — it has to, to say what it is for — but may not link into a phase.
     */
    const rules = read('CLAUDE.md');
    const intoAPhase = /docs\/history\/[0-9]/.exec(rules);
    expect(
      intoAPhase,
      'CLAUDE.md cites a phase file. A rule stands on docs/, not on how it came about.',
    ).toBeNull();
  });
});
