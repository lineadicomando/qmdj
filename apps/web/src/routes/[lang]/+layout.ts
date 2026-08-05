import { createTranslator, isLocale } from '@qimendunjia/i18n';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
  // An unknown language is a wrong address, not a reason to fall back: a
  // silent fallback would make /fr and /en the same page under two names.
  if (!isLocale(params.lang)) error(404, { message: `No such language: ${params.lang}` });

  return { locale: params.lang, t: createTranslator(params.lang) };
};
