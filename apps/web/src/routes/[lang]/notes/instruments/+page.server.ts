import { PARAMETERS } from '@shipan/core';
import { LAYERS } from '$lib/notes';
import type { PageServerLoad } from './$types';

/**
 * What is computed, board by board — read off the engine and never written.
 *
 * **A server load and not a universal one.** `PARAMETERS` is a value in
 * `@shipan/core`, and importing values from that package into anything the
 * browser runs drags the native ephemeris binding and its data files into the
 * bundle — the reason `$lib/vocabulary.ts` exists at all. Here the page is
 * rendered once on the server out of a table that never changes between
 * requests, so nothing has to reach the client but the finished markup.
 *
 * **Cacheable in public, which is unusual on this site.** Every other page
 * that carries an answer carries somebody's date, time and place, and is
 * `private` for that reason. This one is a description of the engine: it
 * holds nobody's data, it is the same page for every reader of a language,
 * and it changes when the code does.
 */
export const load: PageServerLoad = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, max-age=3600' });

  return {
    // Grouped here rather than in the page, so that the markup walks one list
    // and the ordering decision — the pillars first, the boards in the
    // consultation's order, the two that are not boards last — stays in the
    // registry that states it.
    layers: LAYERS.map((layer) => ({
      ...layer,
      parameters: PARAMETERS.filter((parameter) => parameter.board === layer.id).map(
        (parameter) => ({
          id: parameter.id,
          default: String(parameter.default),
          values: parameter.values.map((value) => ({
            id: String(value.id),
            name: value.name,
            implemented: value.implemented,
          })),
        }),
      ),
    })),
  };
};
