import { isLocale, loadCatalog, translatorOver } from '@shipan/i18n';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

/**
 * The language of everything under it, and the catalog of that language alone.
 *
 * `createTranslator` would do the same job in one synchronous line, and it
 * reaches both catalogs to do it. This load runs in the browser as well as on
 * the server, so that line put English and Italian together into the chunk
 * every page waits on — an Italian reader paying for the English catalog and
 * an English reader for the Italian one, which was the largest asset the
 * client had. `loadCatalog` is a dynamic import, so the two are chunks the
 * bundler keeps apart and the reader is served the one they read.
 *
 * The load becomes asynchronous and nothing else moves: `t` is a `Translator`
 * exactly as before, and every page and component under this layout goes on
 * calling it the same way.
 */
export const load: LayoutLoad = async ({ params }) => {
  // An unknown language is a wrong address, not a reason to fall back: a
  // silent fallback would make /fr and /en the same page under two names.
  if (!isLocale(params.lang)) error(404, { message: `No such language: ${params.lang}` });

  return { locale: params.lang, t: translatorOver(params.lang, await loadCatalog(params.lang)) };
};
