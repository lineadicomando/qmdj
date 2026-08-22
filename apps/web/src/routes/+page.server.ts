import { resolveLocale } from '@shipan/i18n';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * The root has no language, so it sends the reader to one.
 *
 * Each locale is a distinct address rather than one address with a switch:
 * the interface is public and indexable, and a shared link should open in the
 * language it was shared in.
 */
export const load: PageServerLoad = ({ request }) => {
  redirect(307, `/${resolveLocale(request.headers.get('accept-language'))}`);
};
