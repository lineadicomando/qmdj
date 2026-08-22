import { LAYERS } from '$lib/notes';
import { REGISTER } from '$lib/server/register';
import type { PageServerLoad } from './$types';

/**
 * The register, grouped by the layer each quantity belongs to.
 *
 * Server-side because that is where the register is — `$lib/server/register`
 * inlines `docs/sources.tsv` at build time — and because the page renders it
 * whole, so sending the rows to the browser as data would send them twice.
 *
 * `public` for the reason the page beside it is: this is a description of what
 * the engine stands on. It holds nobody's date, time or place.
 */
export const load: PageServerLoad = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, max-age=3600' });

  // Walked in the layers' own order rather than the file's, so the two derived
  // pages lay the engine out the same way — the pillars first, the boards in
  // the consultation's order, the two that are not boards last. A row naming a
  // layer this site does not know would vanish here, which is what the test in
  // `docs.test.ts` exists to prevent.
  const grouped = LAYERS.map((layer) => ({
    ...layer,
    quantities: REGISTER.filter((row) => row.board === layer.id),
  })).filter((layer) => layer.quantities.length > 0);

  return {
    layers: grouped,
    /**
     * How many quantities are held at each rung, strongest first.
     *
     * Not decoration and not a score: it is the one thing a reader cannot get
     * by reading the rows, because it takes reading all of them. What it
     * answers is «how much of this rests on what» — and it is honest in both
     * directions, since the rungs a reader would rather not see are counted
     * in the same line as the others.
     */
    tally: ['0', '1', '2', '3', '4', '5', '-'].map((rung) => ({
      rung,
      count: REGISTER.filter((row) => row.rung === rung).length,
    })),
  };
};
