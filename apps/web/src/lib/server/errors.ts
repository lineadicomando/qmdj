import { ChartError } from '@qimendunjia/core';
import { GeoError } from '@qimendunjia/geo';
import { error } from '@sveltejs/kit';

/**
 * Turns a domain error into an HTTP one.
 *
 * The status says how the client should react; the body says what happened,
 * and it says it as a **code with parameters** rather than as a sentence.
 * A client in another language translates it; a client that only logs it has
 * the English message too. Neither has to parse prose.
 */
export function toHttpError(cause: unknown): never {
  if (cause instanceof ChartError) {
    error(statusFor(cause.code), {
      message: cause.message,
      code: cause.code,
      messageKey: cause.messageKey,
      params: cause.params,
    });
  }

  if (cause instanceof GeoError) {
    // A missing dataset is the server's fault, not the request's: it means
    // nobody ran the import, and no amount of fixing the query will help.
    error(cause.code === 'DATABASE_MISSING' ? 503 : 400, {
      message: cause.message,
      code: cause.code,
      messageKey: cause.messageKey,
      params: cause.params,
    });
  }

  throw cause;
}

function statusFor(code: string): number {
  // Everything the caller can fix is a 400; an ephemeris that will not
  // compute is not, and neither is a date outside the files' coverage.
  return code === 'EPHEMERIS_FAILURE'
    ? 500
    : code === 'METHOD_NOT_IMPLEMENTED' || code === 'OPTION_NOT_IMPLEMENTED'
      ? 501
      : 400;
}

/** `error()` throws an object of this shape; it must be rethrown, not wrapped. */
export function isHttpError(cause: unknown): boolean {
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'status' in cause &&
    typeof (cause as { status: unknown }).status === 'number'
  );
}
