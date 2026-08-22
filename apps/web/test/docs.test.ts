import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PARAMETERS } from '@shipan/core';
import { LOCALES } from '@shipan/i18n';
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

/** Every source file of every workspace, for the tests that read the source. */
function sources(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (['node_modules', 'dist', '.svelte-kit', 'coverage'].includes(entry)) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) sources(path, found);
    else if (/\.(ts|svelte)$/.test(path)) found.push(path);
  }
  return found;
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

  it('lists the languages the project actually speaks', () => {
    /**
     * `docs/i18n.md` prints `LOCALES` in a code block, and how many there are
     * is a state rather than a design: Spanish is on the roadmap and the page
     * says so. A page that went on printing two after a third landed would be
     * wrong about the one thing it is the home of — and the same page tells
     * the reader this test holds it, so the claim has to be true.
     */
    const page = read('docs/i18n.md');
    const declaration = /export const LOCALES = \[([^\]]*)\] as const;/.exec(page);
    expect(declaration, 'docs/i18n.md should print the LOCALES declaration').not.toBeNull();
    expect((declaration?.[1].match(/'([a-z]+)'/g) ?? []).map((tag) => tag.slice(1, -1))).toEqual([
      ...LOCALES,
    ]);
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

  /**
   * The phases the source cites are phases that exist.
   *
   * A comment saying «see `docs/history/` phase 21» is a pointer no tool can
   * follow: it is not a path, deliberately — `docs/` owns what binds and a
   * rule may not link into a phase — so nothing checks it, and thirty-odd of
   * them point wherever the numbering last left them. Renumber a phase and the
   * citations go on naming a file that has moved, in silence.
   *
   * The number is what is checked and not the shape of the sentence: whatever
   * a comment says around it, the phase it names has a file.
   */
  it('cites only phases that exist', () => {
    const phases = new Set(
      readdirSync(join(ROOT, 'docs/history'))
        .map((entry) => /^(\d+)-/.exec(entry)?.[1])
        .filter(Boolean)
        .map((number) => Number(number)),
    );
    expect(phases.size).toBeGreaterThan(0);

    const cited = new Map<number, string[]>();
    for (const path of sources(join(ROOT, 'packages')).concat(sources(join(ROOT, 'apps')))) {
      const text = readFileSync(path, 'utf8');
      for (const match of text.matchAll(/docs\/history\/`?\s*phases?\s+(\d+)(?:\s+and\s+(\d+))?/g)) {
        for (const number of [match[1], match[2]].filter(Boolean)) {
          const at = Number(number);
          cited.set(at, [...(cited.get(at) ?? []), path.slice(ROOT.length)]);
        }
      }
    }
    expect(cited.size, 'the source should cite some phases').toBeGreaterThan(0);

    const missing = [...cited].filter(([number]) => !phases.has(number));
    expect(
      missing.map(([number, where]) => `phase ${number} (${where.join(', ')})`),
      'A source comment names a phase file that is not in docs/history/.',
    ).toEqual([]);
  });

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

/**
 * The register of quantities, against the page that says how to read it and
 * the page it indexes.
 *
 * `docs/sources.tsv` is four columns of prose and two of vocabulary, and both
 * of the second kind can go quietly wrong: a `rung` outside the ladder means
 * nothing, and a `section` naming an argument that has been renamed is a row
 * a reader cannot follow. Neither is visible by eye in forty-seven rows.
 *
 * The allowed rungs are read out of `docs/notes.md` rather than written here,
 * for the reason the counts above are read out of the code: that page is where
 * the ladder is defined, and a test carrying its own copy would be a second
 * definition free to disagree with the first.
 */
describe('docs/sources.tsv', () => {
  const COLUMNS = ['board', 'quantity', 'rung', 'stands_on', 'checked_against', 'section'];

  const register = (): Record<string, string>[] => {
    const [header, ...lines] = read('docs/sources.tsv').trim().split('\n');
    expect(header?.split('\t'), 'the register should carry the columns docs/notes.md lists').toEqual(
      COLUMNS,
    );
    return lines.map((line) => {
      const cells = line.split('\t');
      expect(cells.length, line.slice(0, 60)).toBe(COLUMNS.length);
      return Object.fromEntries(COLUMNS.map((column, index) => [column, cells[index] as string]));
    });
  };

  it('fills every cell of every row', () => {
    const rows = register();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      for (const column of COLUMNS) {
        expect(row[column]?.trim(), `${row.quantity} · ${column}`).toBeTruthy();
      }
    }
  });

  it('weighs each quantity on a rung docs/notes.md declares', () => {
    // The ladder's own table: `| **0** | **Measured…` and the dash beneath it.
    const ladder = read('docs/notes.md');
    const declared = new Set(
      [...ladder.matchAll(/^\| \*\*([0-9])\*\* \|/gm)].map((match) => match[1] as string),
    );
    expect(declared.size, 'docs/notes.md should declare the rungs in a table').toBeGreaterThan(1);
    // The row that is not a number: a quantity the engine carries with nothing
    // registered behind it. It is a claim like any other and has to be one of
    // the values, or a blank cell would pass for it.
    declared.add('-');
    expect(ladder).toContain('**Nothing registered.**');

    for (const row of register()) {
      expect(declared.has(row.rung as string), `${row.quantity} is on rung ${row.rung}`).toBe(true);
    }
  });

  it('points at arguments docs/sources.md actually makes', () => {
    const headings = new Set(
      [...read('docs/sources.md').matchAll(/^#{2,4} (.+)$/gm)].map((match) =>
        (match[1] as string).trim(),
      ),
    );
    for (const row of register()) {
      expect(
        headings.has(row.section as string),
        `docs/sources.tsv sends "${row.quantity}" to a section docs/sources.md does not have: ` +
          `"${row.section}".`,
      ).toBe(true);
    }
  });

  it('weighs something on every layer the engine declares a parameter for', () => {
    // A board that has a school divergence and no quantity in the register is
    // a board somebody can configure and nobody can weigh — which is the state
    // `CLAUDE.md` says the register exists to prevent.
    const weighed = new Set(register().map((row) => row.board));
    for (const board of new Set(PARAMETERS.map((parameter) => parameter.board))) {
      expect(weighed.has(board), `nothing in docs/sources.tsv stands for ${board}`).toBe(true);
    }
  });
});
