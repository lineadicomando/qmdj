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
