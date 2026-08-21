import type { MessageKey } from '@shipan/i18n';

/**
 * The sections, in the order the header lists them, and in two kinds.
 *
 * **Acts first, instruments after.** A consultation and the choosing of a
 * time are things a reader *does*: one asks a question at an instant, the
 * other looks through a stretch of them for an hour. The three that follow
 * are boards they *look at*. That division is the one this site is arranged
 * by, and the consultation leads because the classical use of these methods
 * is a question put at an instant.
 *
 * It was written here before and stated as «the consultation, and the three
 * sections after it are the instruments that use serves itself with» — which
 * stopped being true when the 六壬 board made them four, one of which was an
 * act. The order now says what the sentence always meant.
 *
 * **The division governs the labels too, and that is easy to get wrong.** An
 * act is *described*, in the reader's own language, so `nav.consult` and
 * `nav.moments` differ between the catalogs. An instrument is *named*, and a
 * name does not translate: `Qi Men`, `Liu Ren`, `Qi Zheng` and `Ba Zi`
 * are identical in both. The 七政四餘 section arrived as «Seven Governors»
 * and «Sette governatori» — a gloss where the other three had names, and the
 * only instrument label in the two catalogs that was not the same string,
 * which is what gave it away. The heading is where the gloss belongs: a
 * reader who clicks a name they do not know lands on a page that says what it
 * is, and a nav item has no room to.
 *
 * **The six instruments are in the order the consultation offers them**, and
 * that is one order rather than two lists that happen to agree. It is the span
 * of what each board is about: 奇門 and 六壬 are put at an instant, 太乙 is
 * laid on a year, and the three of 命 are laid on a life — and within those,
 * the widest frame first, the sky a birth happened under before the seats it
 * is counted in before what it is made of. See `INSTRUMENTS` in
 * `instruments.ts`, which is where the argument is written out. A reader meets
 * these arts here, and the select they open afterwards should not make them
 * learn the row a second time.
 *
 * **What the grouping does not say is which art a section uses.** Choosing a
 * time walks Qi Men charts and only those, and no arrangement of a flat list
 * can carry that: a nav says where things are, not what they are made of. It
 * is said on that section's own page, in its title and in its opening line,
 * which is where somebody reading results needs it.
 *
 * The cost of the order is paid knowingly and it is the chart's address.
 * `/[lang]` was the chart of now and is now a form: a link to a chart is
 * `/[lang]/qimen` with the moment in it.
 *
 * **A slug is the name of what the section holds, and `chart` was not one.**
 * Every other instrument here is addressed by the art it lays out, and that
 * one was addressed by the shape its answer comes out in — which reads as a
 * generic where the neighbours read as names, and stops saying anything at
 * all now that six sections draw a board apiece. The label above it never
 * said `Chart`: it has said `Qi Men` since there was a nav, so the rename
 * moved the address to where the word already was rather than changing what
 * a reader sees.
 */
export const SECTIONS: readonly {
  slug: string;
  label: MessageKey;
  /**
   * The name at full length, worn only while this section is the one being
   * read — and absent where there is no longer form to wear.
   *
   * A name is cut in a list and said whole in a title, and that is the
   * distinction the two keys carry. Which four have one, and why 八字 and
   * 太乙 do not, is argued in the catalogs beside the strings themselves: the
   * reason is about the names and not about this list, and it would be a
   * paragraph of Chinese bibliography in a file about where links go.
   *
   * Only an instrument has one, and that follows from the division above
   * rather than being a second rule: an act is described rather than named,
   * and a description does not have a long form and a short one.
   */
  full?: MessageKey;
  /** Which of the two kinds it is, for the break the header sets between them. */
  group: 'act' | 'instrument';
}[] = [
  { slug: '', label: 'nav.consult', group: 'act' },
  { slug: 'moments', label: 'nav.moments', group: 'act' },
  { slug: 'qimen', label: 'nav.qimen', full: 'nav.qimen.full', group: 'instrument' },
  { slug: 'liuren', label: 'nav.liuren', full: 'nav.liuren.full', group: 'instrument' },
  { slug: 'taiyi', label: 'nav.taiyi', group: 'instrument' },
  { slug: 'qizheng', label: 'nav.qizheng', full: 'nav.qizheng.full', group: 'instrument' },
  { slug: 'ziwei', label: 'nav.ziwei', full: 'nav.ziwei.full', group: 'instrument' },
  { slug: 'bazi', label: 'nav.bazi', group: 'instrument' },
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
 * The search string a section link may carry across.
 *
 * The moment travels — that is what carrying `search` is for — and the birth
 * does not. `born` and its companions are the parameters `pageAddress` keeps
 * out of every shareable address for the same reason: they are somebody's
 * birth, they belong to the section that asked for them, and a header link
 * that hauled them along would write them into the address of every section
 * visited after a consultation.
 *
 * `instrument` is dropped for a different reason and the same effect: which
 * board a question is put to is the consultation's own setup and means
 * nothing in a section that is one board already. Carried, it would write a
 * parameter into every address that reads it that nothing there reads.
 */
export function carriedSearch(search: string): string {
  const params = new URLSearchParams(search);
  for (const only of ['born', 'bornTime', 'bornTz', 'gender', 'years', 'instrument']) {
    params.delete(only);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
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
 * The consultation lives at the root of a language, so a plain `startsWith`
 * would mark it current on every page of the site.
 */
export function isCurrent(locale: string, slug: string, pathname: string): boolean {
  const target = href(locale, slug);
  return slug ? pathname === target || pathname.startsWith(`${target}/`) : pathname === target;
}
