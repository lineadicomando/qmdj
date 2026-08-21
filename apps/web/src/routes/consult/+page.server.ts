import { resolveLocale } from '@qimendunjia/i18n';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * The same name as `[lang]/consult`, typed without a language.
 *
 * It is `/+page.server.ts` with a word in front of it, and it answers the way
 * that one does: the language is negotiated from the request, so the reader
 * lands on the consultation in a language they read.
 *
 * 307 and not the 308 its sibling under `[lang]` uses, and the difference is
 * the whole reason the two are separate files: this destination depends on
 * who is asking. A permanent redirect here would be a browser remembering one
 * reader's language for the next one, and a shared cache remembering it for
 * everybody.
 *
 * A static segment wins over `[lang]`, so this is reached rather than
 * `/consult` being read as a language named "consult" and 404ing.
 */
export const load: PageServerLoad = ({ request, url }) => {
  redirect(307, `/${resolveLocale(request.headers.get('accept-language'))}${url.search}`);
};
