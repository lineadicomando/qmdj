import type { MessageKey } from '@qimendunjia/i18n';

/** The sections, in the order the header lists them. */
export const SECTIONS: readonly { slug: string; label: MessageKey }[] = [
  { slug: '', label: 'nav.chart' },
  { slug: 'bazi', label: 'nav.bazi' },
];

/**
 * `search` carries the moment across.
 *
 * The two sections ask different questions of the same instant, and someone
 * who has just cast a chart and wants the pillars of it should not have to
 * type the date, the time and the place again. Parameters the other section
 * has no use for are harmless: an endpoint reads what it knows.
 */
export function href(locale: string, slug: string, search = ''): string {
  return `${slug ? `/${locale}/${slug}` : `/${locale}`}${search}`;
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
