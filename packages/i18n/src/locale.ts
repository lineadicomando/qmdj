/**
 * The locales the project speaks, and how a surface decides which one to use.
 *
 * English is the default everywhere. It is the fallback of last resort too:
 * a surface that cannot determine a locale must still produce readable text.
 */
export const LOCALES = ['en', 'it'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the first usable locale out of an ordered list of candidates.
 *
 * Surfaces differ in where a preference may come from — a path segment, a
 * query parameter, a cookie, an `Accept-Language` header, an environment
 * variable — but they all agree on the precedence: the more explicit the
 * source, the earlier it goes. Passing the candidates in order keeps that
 * decision at the surface, where it belongs, and out of this package.
 *
 * Each candidate is read leniently: `it`, `it-CH` and `Accept-Language`
 * strings are all accepted, so a surface can forward what it has without
 * parsing it first.
 */
export function resolveLocale(...candidates: (string | null | undefined)[]): Locale {
  for (const candidate of candidates) {
    const locale = parseLocale(candidate);
    if (locale) return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Reads a single language tag or an `Accept-Language` header.
 *
 * Returns `undefined` rather than the default when nothing matches, so that
 * `resolveLocale` can tell "this source said nothing" from "this source said
 * English" and move on to the next candidate.
 */
export function parseLocale(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined;

  const ranked = value
    .split(',')
    .map(readRange)
    .filter((range) => range.quality > 0)
    // Stable sort: at equal quality the header's own order decides, which is
    // what the specification prescribes.
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;

    // `it-CH` and `it_CH` both mean Italian. The region is irrelevant here:
    // the project has no regional variants, and pretending otherwise would
    // reject a perfectly clear preference.
    const primary = tag.split(/[-_]/)[0];
    if (isLocale(primary)) return primary;
  }

  return undefined;
}

interface LanguageRange {
  tag: string;
  quality: number;
}

function readRange(part: string): LanguageRange {
  const [tag = '', ...parameters] = part.trim().split(';');

  for (const parameter of parameters) {
    const match = /^q=([\d.]+)$/i.exec(parameter.trim());
    if (!match) continue;
    const quality = Number(match[1]);
    return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
  }

  return { tag: tag.trim().toLowerCase(), quality: 1 };
}
