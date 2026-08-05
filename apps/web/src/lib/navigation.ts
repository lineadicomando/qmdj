import type { MessageKey } from '@qimendunjia/i18n';

/** The sections, in the order the header lists them. */
export const SECTIONS: readonly { slug: string; label: MessageKey }[] = [
  { slug: '', label: 'nav.chart' },
  { slug: 'bazi', label: 'nav.bazi' },
  { slug: 'moments', label: 'nav.moments' },
];

/**
 * `search` carries the moment across.
 *
 * The chart and the pillars ask different questions of the same instant, and
 * someone who has just cast a chart and wants the pillars of it should not
 * have to type the date, the time and the place again. Parameters the other
 * section has no use for are harmless: an endpoint reads what it knows.
 *
 * The scan is the exception, and it costs nothing. It takes an interval where
 * those two take an instant, so `date` and `time` mean nothing to it and
 * `from` and `to` mean nothing to them; the place, which all three share,
 * still travels. What the scan hands back is a link the other way — a row of
 * its answer opens the whole board for that hour in the chart section.
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
