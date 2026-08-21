import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Every message in the catalogs is one somebody can still reach.
 *
 * `catalogs.test.ts` holds the two catalogs to each other: same keys both
 * ways, same placeholders, nothing empty. What that cannot see is a key that
 * has gone dead in **both** languages at once, because a pair of orphans is
 * perfectly symmetrical. Three had: `consult.changeYear` was superseded when a
 * board of 天 began offering to change the *matter* rather than the year, and
 * two `cli.field` entries outlived the lines that printed them. Each was true
 * when it was written, and nothing anywhere could have noticed.
 *
 * It lives here rather than in `packages/i18n` because answering the question
 * means reading every surface, and that package is a leaf: it depends on
 * nothing, and a test in it that reached up into `apps/web` would invert the
 * one dependency the architecture is careful about. `docs.test.ts` is the
 * precedent — it reads `packages/core/src/cli.ts` from the repository root for
 * the same reason.
 */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** Every source file of every workspace, catalogs and tests excluded. */
function sources(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (['node_modules', 'dist', '.svelte-kit', 'test', 'coverage'].includes(entry)) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) sources(path, found);
    else if (/\.(ts|svelte)$/.test(path) && !path.includes(join('src', 'catalogs'))) found.push(path);
  }
  return found;
}

/**
 * A key is live if it is written out, **or** if a template could build it.
 *
 * The second half is not a loophole, it is most of the catalog: 555 of 958
 * keys are never written anywhere, because the interface reads them as
 * `` t(`label.gate.${gate.id}`) `` — one line standing for eight messages.
 * Nothing short of running the engine can enumerate those, so what is checked
 * is the prefix: a key beginning with one a template interpolates from is
 * treated as reachable.
 *
 * That makes the test **generous and never wrong in the direction that
 * matters**. It cannot claim a live key is dead — the worst it does is let a
 * dead one through, when it happens to share a prefix with a live family. It
 * caught the three there were, which is what a guard against drift has to do.
 */
function templatePrefixes(haystack: string): string[] {
  return [...haystack.matchAll(/`([a-zA-Z0-9_.]*)\$\{/g)]
    .map((match) => match[1] as string)
    .filter(Boolean);
}

describe('the catalogs carry nothing nobody reads', () => {
  it('has a reader for every key', () => {
    const catalog = readFileSync(join(ROOT, 'packages/i18n/src/catalogs/en.ts'), 'utf8');
    const keys = [...catalog.matchAll(/^\s+'([^']+)':/gm)].map((match) => match[1] as string);
    expect(keys.length).toBeGreaterThan(500);

    const haystack = [...sources(join(ROOT, 'packages')), ...sources(join(ROOT, 'apps'))]
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    const prefixes = templatePrefixes(haystack);

    const orphans = keys.filter(
      (key) => !haystack.includes(key) && !prefixes.some((prefix) => key.startsWith(prefix)),
    );

    expect(
      orphans,
      `These keys are in the catalogs and nothing reads them. Either a surface ` +
        `lost the line that printed one, or the key outlived what it was for — ` +
        `and a message nobody can reach is a message nobody maintains.`,
    ).toEqual([]);
  });
});
