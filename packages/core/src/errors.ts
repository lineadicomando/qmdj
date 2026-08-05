import {
  DEFAULT_LOCALE,
  translate,
  type MessageKey,
  type MessageParams,
} from '@qimendunjia/i18n';

export type ChartErrorCode =
  | 'INVALID_DATE'
  | 'INVALID_TIME'
  | 'UNKNOWN_TIMEZONE'
  | 'INVALID_COORDINATES'
  | 'DATE_OUT_OF_RANGE'
  | 'EPHEMERIS_FAILURE'
  | 'METHOD_NOT_IMPLEMENTED'
  | 'EMPTY_INTERVAL'
  | 'INTERVAL_TOO_LONG';

/**
 * A usage error of the engine: malformed input, or a condition under which
 * the calculation cannot be performed.
 *
 * It carries a `code` and the `params` that describe the failure, never a
 * sentence chosen for one language. `message` is an English rendering meant
 * for logs and stack traces; a surface showing the error to a person
 * translates `messageKey` with `params` in the locale it resolved.
 */
export class ChartError extends Error {
  readonly code: ChartErrorCode;
  readonly params: MessageParams;
  readonly messageKey: MessageKey;

  constructor(code: ChartErrorCode, params: MessageParams = {}) {
    const messageKey = `core.error.${code}` as MessageKey;
    super(translate(DEFAULT_LOCALE, messageKey, params));
    this.name = 'ChartError';
    this.code = code;
    this.params = params;
    this.messageKey = messageKey;
  }
}

export type ChartWarningCode =
  | 'AMBIGUOUS_LOCAL_TIME'
  | 'NONEXISTENT_LOCAL_TIME'
  | 'MOSHIER_FALLBACK';

/**
 * Something the caller should know, which did not prevent the calculation.
 *
 * A warning is a `{ code, params }` pair for the same reason an error is: the
 * engine states what happened, the surface decides how to say it. A chart
 * carries its warnings so that a saved chart still explains itself.
 */
export interface ChartWarning {
  code: ChartWarningCode;
  params: MessageParams;
}

export function warning(code: ChartWarningCode, params: MessageParams = {}): ChartWarning {
  return { code, params };
}
