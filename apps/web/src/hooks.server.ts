import { resolveLocale } from '@qimendunjia/i18n';
import type { Handle } from '@sveltejs/kit';

/**
 * Puts the page's language in the document.
 *
 * `lang` on `<html>` is what a screen reader pronounces from and what a
 * browser offers to translate from; a page that lies about it is worse than
 * one that says nothing.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const locale = resolveLocale(
    event.params['lang'],
    event.request.headers.get('accept-language'),
  );
  return resolve(event, { transformPageChunk: ({ html }) => html.replace('%lang%', locale) });
};
