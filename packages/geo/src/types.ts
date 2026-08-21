import { DEFAULT_LOCALE, translate, type Locale, type MessageKey, type MessageParams } from '@shipan/i18n';

/**
 * A place with everything a chart needs: coordinates and — above all — the
 * IANA timezone, without which local time cannot be converted to Universal
 * Time, and without which no pillar can be trusted.
 */
export interface Location {
  /** GeoNames identifier, stable across releases of the dataset. */
  id: number;
  /** Name in the requested language, e.g. `Rome` with `lang: 'en'`, `Roma` with `'it'`. */
  name: string;
  /** ISO 3166-1 alpha-2 code, e.g. `IT`. */
  countryCode: string;
  /** Full country name in the requested language, e.g. `Italy`. */
  country: string;
  /** First-level subdivision, e.g. `Lazio`. Absent when unmapped. */
  region?: string;
  /** Latitude in decimal degrees, positive north. */
  latitude: number;
  /** Longitude in decimal degrees, positive east. */
  longitude: number;
  /** IANA identifier, e.g. `Europe/Rome`. */
  timezone: string;
  /** Population according to GeoNames: used to rank results. */
  population: number;
}

export interface SearchOptions {
  /** Maximum number of results. Default 10, capped at 50. */
  limit?: number;
  /** Restricts the search to one country (ISO 3166-1 alpha-2, e.g. `IT`). */
  countryCode?: string;
  /**
   * Language of the returned names. Default `en`.
   *
   * It never restricts the search: a query always runs against every known
   * name of a place, so one can type "Munich" and be shown "Monaco di
   * Baviera". Italian falls back to the international name where no exonym
   * exists — which is most minor towns.
   */
  lang?: Locale;
  /** Path of the SQLite database. Defaults to the environment variable or `<pkg>/data/geonames.db`. */
  databasePath?: string;
}

export type GeoErrorCode = 'DATABASE_MISSING' | 'EMPTY_QUERY' | 'DATABASE_CORRUPT';

/**
 * A usage error of the location lookup.
 *
 * It carries a `code` and the `params` that describe the failure, never a
 * sentence chosen for one language. `message` is an English rendering meant
 * for logs and stack traces; a surface that has to show the error to a person
 * translates `messageKey` with `params` in the locale it resolved.
 */
export class GeoError extends Error {
  readonly code: GeoErrorCode;
  readonly params: MessageParams;
  readonly messageKey: MessageKey;

  constructor(code: GeoErrorCode, params: MessageParams = {}) {
    const messageKey = `geo.error.${code}` as MessageKey;
    super(translate(DEFAULT_LOCALE, messageKey, params));
    this.name = 'GeoError';
    this.code = code;
    this.params = params;
    this.messageKey = messageKey;
  }
}
