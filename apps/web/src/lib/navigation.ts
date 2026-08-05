import type { MessageKey } from '@qimendunjia/i18n';

/** The sections, in the order the header lists them. */
export const SECTIONS: readonly { slug: string; label: MessageKey }[] = [
  { slug: '', label: 'nav.chart' },
  { slug: 'bazi', label: 'nav.bazi' },
];

export function href(locale: string, slug: string): string {
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

/**
 * Whether a section is the one being read.
 *
 * The chart lives at the root of a language, so a plain `startsWith` would
 * mark it current on every page of the site.
 */
export function isCurrent(locale: string, slug: string, pathname: string): boolean {
  const target = href(locale, slug);
  return slug ? pathname === target || pathname.startsWith(`${target}/`) : pathname === target;
}
