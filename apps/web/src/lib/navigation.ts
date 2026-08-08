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
 * Whether a click on a link meant *here*, or meant *somewhere else*.
 *
 * A modifier, or any button but the first, is how a person says "open this
 * apart from what I am reading". A script that takes a link over must let
 * those through: preventing them would be taking away the one thing that was
 * asked for.
 *
 * Which is why what a script takes over stays a link. `href` remains what a
 * middle click, a new tab, a saved bookmark and a page without scripts all
 * get; only the plain click is answered here, and a button in its place would
 * have thrown all four away to gain nothing.
 */
export function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
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
