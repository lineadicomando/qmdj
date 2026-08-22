import type { MessageKey } from '@shipan/i18n';

/**
 * The section of notes: its addresses, and the layers its first page lays out.
 *
 * **This is the registry `instruments.ts` could not be.** That one answers
 * «what can a consultation be laid on» — six rows, each an art a reader picks
 * before writing a question. This answers «what does this engine compute»,
 * which is a wider question and stays wider: the 曆注 are computed and are not
 * an instrument, the almanac being a page of a published book rather than a
 * board; the pillars are computed under every board and are nobody's choice;
 * the 年命 is a birth placed inside a chart of a moment. That the two lists
 * differ is itself content, and the page says so — a reader who notices the
 * nav is shorter than this page is owed the reason rather than left to guess.
 *
 * The overlap is not duplicated. Where a layer is also an instrument its name
 * is read off `INSTRUMENTS`, which is where a name lives; what is added here
 * is the layers that have no instrument to be named by, and what each layer is
 * computed *from*, which no other descriptor states.
 */

/**
 * A layer of the engine, in the order the page lays them out.
 *
 * The pillars first, because everything below stands on them; then the six
 * boards in the order the consultation offers them, which is the span of what
 * each is about; then the two that are computed and are not boards.
 */
export interface Layer {
  /**
   * The identifier `ParameterBoard` uses in `packages/core/src/parameters.ts`,
   * or `bazi` — which has no parameter of its own and is a layer all the same.
   *
   * A board with no divergence is not a board with nothing to say: 八字 stands
   * on the calendrical layer entire, and a page that listed only what has a
   * parameter would leave the four pillars off the list of what is computed.
   */
  readonly id: string;
  /**
   * The name, where the layer is an art with one — `undefined` where the
   * instrument registry already carries it.
   *
   * 曆注 and 年命 are named things in Chinese and are not instruments, so
   * their names have nowhere else to live. The calendrical layer is not a
   * named art at all: it is a way of reading an instant, so it is *described*
   * in the reader's own language and carries no hanzi. `docs/i18n.md` — the
   * glyph stands beside the word only where what is named is Chinese.
   */
  readonly name?: { readonly hanzi: string; readonly pinyin: string };
  /**
   * A heading in the reader's language, where the layer has no name to wear.
   *
   * Exactly one of these and a name: an art is *named* and a name does not
   * translate — `INSTRUMENTS` argues that at length and this registry does not
   * file a second copy in the catalogs — while a way of reading an instant is
   * *described*, and a description differs between languages. The calendrical
   * layer is the only one of the two here.
   */
  readonly title?: MessageKey;
  /** What the engine computes it from, said in the reader's language. */
  readonly takes: MessageKey;
  /** What it is, in one line, for a reader meeting it here first. */
  readonly does: MessageKey;
}

export const LAYERS: readonly Layer[] = [
  {
    id: 'pillars',
    title: 'notes.layer.pillars',
    takes: 'notes.takes.pillars',
    does: 'notes.does.pillars',
  },
  { id: 'qimen', takes: 'notes.takes.qimen', does: 'notes.does.qimen' },
  { id: 'liuren', takes: 'notes.takes.liuren', does: 'notes.does.liuren' },
  { id: 'taiyi', takes: 'notes.takes.taiyi', does: 'notes.does.taiyi' },
  { id: 'qizheng', takes: 'notes.takes.qizheng', does: 'notes.does.qizheng' },
  { id: 'ziwei', takes: 'notes.takes.ziwei', does: 'notes.does.ziwei' },
  { id: 'bazi', takes: 'notes.takes.bazi', does: 'notes.does.bazi' },
  {
    id: 'almanac',
    name: { hanzi: '曆注', pinyin: 'lìzhù' },
    takes: 'notes.takes.almanac',
    does: 'notes.does.almanac',
  },
  {
    id: 'nianming',
    name: { hanzi: '年命', pinyin: 'niánmìng' },
    takes: 'notes.takes.nianming',
    does: 'notes.does.nianming',
  },
];

/** The layer an identifier names, for a page walking the register by board. */
export function layerOf(id: string): Layer | undefined {
  return LAYERS.find((layer) => layer.id === id);
}

/**
 * The pages of the section, in the order the index leads to them.
 *
 * `kind` is not decoration: it is the line the whole section is arranged by.
 * A **derived** page reads a registry and cannot fall behind the engine; a
 * **written** page is prose somebody keeps, and carries the date it was last
 * checked for exactly that reason. See `docs/notes.md`.
 */
export interface NotePage {
  /** Under `/[lang]/notes`. The index itself is the empty slug. */
  readonly slug: string;
  readonly title: MessageKey;
  /**
   * What it answers, for the index and for nothing else.
   *
   * Absent on the index itself, which does not lead to itself: a line
   * describing the page a reader is standing on, in a list of places to go,
   * is a line that says «you are here» where every other says «go there».
   */
  readonly answers?: MessageKey;
  readonly kind: 'derived' | 'written';
}

export const NOTE_PAGES: readonly NotePage[] = [
  { slug: '', title: 'notes.title', kind: 'written' },
  {
    slug: 'instruments',
    title: 'notes.instruments.title',
    answers: 'notes.answers.instruments',
    kind: 'derived',
  },
  {
    slug: 'sources',
    title: 'notes.sources.title',
    answers: 'notes.answers.sources',
    kind: 'derived',
  },
];
