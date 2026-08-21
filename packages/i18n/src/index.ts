/**
 * @shipan/i18n — message catalogs and locale negotiation.
 *
 * A leaf package: it depends on nothing, not even on Node, so it can be
 * imported by the engine, the CLI, the MCP server and the browser bundle
 * alike.
 *
 * The rule it exists to enforce: **the engine does not localise, exactly as
 * it does not interpret.** `core` returns identifiers, hanzi and numbers;
 * human-readable text is produced here, at the surface. A calculation that
 * returned a translated string would be untestable across locales and would
 * tie the engine to a concern that belongs to whoever displays the result.
 *
 * Chinese characters are not a locale. 休門 is not the Chinese rendering of
 * "Rest Gate": it is the name of the gate, and both an English and an Italian
 * reader expect to see it in the palace. Hanzi therefore travels in the
 * engine's output at all times, and the catalog supplies only the gloss
 * beside it.
 */

export { format, type MessageParams } from './format.js';
export {
  catalogs,
  createTranslator,
  loadCatalog,
  translate,
  translatorOver,
  type Translator,
} from './translate.js';
export { type MessageKey } from './catalogs/en.js';
export {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  parseLocale,
  resolveLocale,
  type Locale,
} from './locale.js';
