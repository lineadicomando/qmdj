import { en, type MessageKey } from './catalogs/en.js';
import { it } from './catalogs/it.js';
import { format, type MessageParams } from './format.js';
import { DEFAULT_LOCALE, type Locale } from './locale.js';

export const catalogs: Record<Locale, Record<MessageKey, string>> = { en, it };

/**
 * Renders one message in one locale.
 *
 * Falls back to English and then to the key itself. Neither should ever
 * happen — the catalogs are typed against a single key union and a test
 * asserts they agree — but a missing string must degrade to something
 * printable rather than to `undefined` in the middle of a chart.
 */
export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const message = catalogs[locale]?.[key] ?? catalogs[DEFAULT_LOCALE][key] ?? key;
  return format(message, params);
}

/**
 * A translator bound to one locale.
 *
 * Surfaces resolve the locale once per request, per command or per tool call
 * and pass this down. It is callable so that call sites read as `t('key')`,
 * and carries its own `locale` for the places that need to format a date or
 * set a `lang` attribute.
 */
export interface Translator {
  (key: MessageKey, params?: MessageParams): string;
  readonly locale: Locale;
}

export function createTranslator(locale: Locale): Translator {
  const translator = (key: MessageKey, params?: MessageParams): string =>
    translate(locale, key, params);
  return Object.assign(translator, { locale });
}

/**
 * The one catalog a locale needs, fetched on its own.
 *
 * Everything above this line reaches both catalogs through `catalogs`, which
 * is what a bundler has to follow: import `translate` anywhere and English and
 * Italian both come with it. On a server that costs nothing. In a browser it
 * meant an Italian reader downloading the English catalog and an English
 * reader the Italian one, in the chunk the layout loads on every page.
 *
 * Split behind a dynamic import, the two become chunks a bundler can keep
 * apart, and a reader is served the one they read.
 */
export async function loadCatalog(locale: Locale): Promise<Record<MessageKey, string>> {
  const module = locale === 'it' ? await import('./catalogs/it.js') : await import('./catalogs/en.js');
  return locale === 'it'
    ? (module as { it: Record<MessageKey, string> }).it
    : (module as { en: Record<MessageKey, string> }).en;
}

/**
 * A translator over one catalog already in hand.
 *
 * **It has no English to fall back on, and that is the point rather than a
 * shortcut.** `translate` falls back to `DEFAULT_LOCALE` and then to the key;
 * the first of those needs the English catalog present, which is the whole of
 * what this exists to avoid loading. So a key this catalog lacks degrades
 * straight to the key.
 *
 * What makes that safe is not optimism. The catalogs are typed against a
 * single key union, so a missing Italian key is a compilation error, and
 * `catalogs.test.ts` asserts the two agree in both directions besides. The
 * fallback was already documented as something that «should never happen»;
 * what is given up here is the second of two nets under a case the type system
 * does not permit.
 */
export function translatorOver(
  locale: Locale,
  catalog: Record<MessageKey, string>,
): Translator {
  const translator = (key: MessageKey, params?: MessageParams): string =>
    format(catalog[key] ?? key, params);
  return Object.assign(translator, { locale });
}
