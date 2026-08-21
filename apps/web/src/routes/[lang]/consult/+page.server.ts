import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * The consultation answers at the root of a language, and this is the name
 * somebody types looking for it.
 *
 * `/[lang]` is the consultation and stays the address — `PLAN.md` § 4 phase 12
 * settled that, and the nav points there. What this adds is the word: every
 * other section here can be reached by naming it, and the one that leads was
 * the only one a reader had to know was *nowhere* in order to find. So the
 * name resolves, and it resolves to the one address rather than standing
 * beside it: two addresses rendering one page is a page a search engine has
 * to be told about with a `canonical` this site does not carry, and a second
 * place a link to the consultation could come from.
 *
 * **It names the section and not the answer**, which is the distinction the
 * README draws when it says a consultation is an act and not a link. What is
 * still not in the address is the board and the question: this redirect leads
 * to a form, exactly as `/[lang]` does, and reloading either finds the fields
 * ready rather than the answer preserved.
 *
 * 308 and not 307: the destination is fixed, so a browser that remembers it
 * is remembering something true. The search string travels — under this
 * section it holds the setup, which is the place, the options, the instrument
 * and a birth given for a 年命, and dropping it would land the reader on a
 * consultation set up as nobody asked.
 *
 * An unknown language is not answered here. It redirects to `/fr`, which is
 * the 404 `[lang]/+layout.ts` raises — the same answer `/fr` itself gives,
 * arrived at one hop later.
 */
export const load: PageServerLoad = ({ params, url }) => {
  redirect(308, `/${params.lang}${url.search}`);
};
