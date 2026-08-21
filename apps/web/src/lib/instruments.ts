import type { MessageKey } from '@qimendunjia/i18n';

/**
 * The instruments a consultation can be laid on, and everything that turns
 * with the choice.
 *
 * A consultation takes **one** instrument, chosen before the press and at no
 * point after it — see `docs/readings.md` for why that is the rule and not a
 * preference, and `docs/history/` phase 14 for the decision. What this file adds is the other half of it:
 * *which* one is a value, so that what turns with it is a field rather than a
 * conditional.
 *
 * **It replaced a boolean, and the boolean had begun to rot.** The
 * consultation used to derive `liuren = instrument === 'liuren'` and hang
 * seventeen branches off it — the endpoint, the key the board comes back
 * under, the drawing's measures, whether a birth is offered, which legend is
 * printed. Two of those branches read `width={liuren ? 900 : 900}`: a ternary
 * that stopped choosing anything when the two drawings came out the same
 * width, and that nobody saw, because at two instruments a dead branch and a
 * live one are the same shape. A descriptor cannot hide that — a column of
 * one repeated value is visible on the page.
 *
 * **A row is a board, and the fourth board was a row.** `docs/history/` phase 18
 * gave the consultation the instruments of 命 as well, and `needs` is the field
 * that arrived with them: a question, cast at the instant of asking, or a
 * birth, cast at the birth. It was left undeclared while both rows would have
 * held the same value, because a column with one value across every row
 * carries no information and no test can hold it to anything.
 *
 * **The fifth board was a row and a third value.** Phase 21 admits 太乙, whose
 * subject is a year — neither a question nor a person — so `needs` gained
 * `'year'` rather than the table gaining a branch. That the widening cost one
 * value in one column is the whole of the argument for the descriptor: at the
 * fourteen conditionals it replaced, a board that is neither of the two kinds
 * would have been fourteen edits and a page nobody could read afterwards.
 */
export type InstrumentId = 'qimen' | 'liuren' | 'qizheng' | 'bazi' | 'taiyi' | 'ziwei';

export interface Instrument {
  readonly id: InstrumentId;
  /**
   * The endpoint under `/api`, which is also the key the board comes back
   * under.
   *
   * One field and not two, because it is a convention rather than a
   * coincidence: every board endpoint returns its board named after itself —
   * `/api/qimen` a `qimen`, `/api/liuren` a `liuren`, and `/api/qizheng` and
   * `/api/bazi` likewise. It also addresses `/plate` and `/prompt` beneath it.
   *
   * **It held for five boards of six and was written as though it held for
   * all**, because the sixth was addressed `/api/chart` and answered with a
   * `chart` — the same word twice, so `api` stayed one field and the exception
   * was invisible. Naming the section after its art moved both halves at once
   * and the convention is now what this paragraph says it is.
   *
   * The one thing it does not settle is the moment: a chart carries its own
   * inside it, where the other boards are handed it alongside — and 太乙 has
   * none at all. The consultation reads `body.moment` and accepts its absence,
   * which is why that is not a field here.
   */
  readonly api: string;
  /**
   * What the reader is asked for, which is the whole of the difference between
   * the kinds — and now there are three.
   *
   * `question` — a board of 卜. The reader writes what they are asking and the
   * board is cast at the instant of the press: the question comes before the
   * casting or it is a caption on a board that was already there. The date and
   * the time sit under the options and empty, and empty is the press.
   *
   * `birth` — a board of 命. Nothing is asked of it. The date, the time and
   * the place *are* the input, so they stand in the open and a date is
   * required: a birth left empty would be the present, which is nobody's.
   *
   * `year` — a board of 天, which is 太乙 and nothing else here. Nothing is
   * asked of it either, and the difference from 命 is that there is nobody in
   * it: its subject is the year everybody is standing in. No place and no hour
   * enter it, so the whole of the form is one number, and empty is the year
   * being lived — which is the one place this section's «empty is the press»
   * rule survives into the other kinds, because a year left empty is
   * everybody's answer where a birth left empty is nobody's.
   *
   * **It also settles the address and whether a moment comes back**, and that
   * is one reason rather than two folded together: this is the column that says
   * what the board is a function of. A 年計 board is a function of `year=N`, and
   * `/api/taiyi` returns no moment because there is no instant under it.
   */
  readonly needs: 'question' | 'birth' | 'year';
  /**
   * Whether a birth may be given **beside** what was asked.
   *
   * Only where a board is cast for a question and a person can be placed
   * inside it — which is dunjia's 年命 and nothing else here. Not to be
   * confused with `needs: 'birth'`, where the birth is not an addition to the
   * board but the whole of its input.
   *
   * Under Qi Men it places a 年命 — 本命 and 行年, looked up *inside* the
   * chart of the moment, which is the classical direction. Under 六壬 it is
   * not offered, and structurally rather than cautiously: the querent already
   * stands on the day stem, and a second name for one person is how a reading
   * acquires a relation that was never there.
   */
  readonly takesBirth: boolean;
  /**
   * Whether a sex changes what is computed — and a third reason dividing the
   * four, agreeing with neither of the two above.
   *
   * Under dunjia it sets the direction the 行年 count runs, and so is only
   * meaningful beside a birth. Under 八字 it sets the direction the 大運 run,
   * and there it stands alone because the birth is the board's own input.
   * 六壬 and 七政四餘 have no use for it at all. Three fields, three reasons;
   * folding any pair of them would hold until the fifth board.
   */
  readonly takesGender: boolean;
  /**
   * Whether the drawing has a ramp of strengths to explain beneath it.
   *
   * Distinct from `takesBirth` although the two agree across both rows today,
   * and they are not to be folded together: this one is about the nine
   * palaces having a strength at all, that one about where a person stands in
   * a board. Two reasons that happen to divide the same two boards will stop
   * dividing them at the third.
   */
  readonly strengths: boolean;
  /**
   * The drawing, at the measure the plate actually emits it — where there is
   * one.
   *
   * Absent for 八字, which has no `/plate` and never had: four pillars are a
   * table and a table of four is not a picture. What stands in its place on
   * the page is `PillarPlate`, a component rather than an image, so nothing
   * here has a size to declare.
   */
  readonly plate?: {
    readonly width: number;
    readonly height: number;
  };
  /**
   * What the option says it is **for**, never what it is called.
   *
   * Somebody arriving with a question recognises the shape of their own, where
   * `Qi Men` and `Liu Ren` are two words they have no way to weigh. The same
   * rule that makes an option reading `zishi` unusable.
   *
   * The errand alone: what the art is *called* stands beside it in `name` and
   * is no longer on the tail of this string.
   */
  readonly option: MessageKey;
  /**
   * What to write in the field this instrument puts up — the question's
   * placeholder, or the matter's.
   *
   * A column of its own rather than a value read off `needs`, because it is
   * the one thing here that differs *inside* a kind: 奇門 and 六壬 are both
   * boards of 卜 and both take a question, and they take different questions —
   * a thing to be done and the hour to do it in, against a situation already
   * under way and the people in it. One «What are you asking?» over both was
   * the label said twice, and it left a reader who had just weighed two
   * errands with nothing telling them what their choice had changed.
   *
   * Absent on a board of 命, and absent the way `plate` is: there is no field
   * to put it under. Nothing is asked of those three, and a placeholder is
   * something to write in a box that is not there.
   */
  readonly asks?: MessageKey;
  /**
   * The name of the art, in its script and said aloud.
   *
   * Not a `MessageKey`, and that is the rule rather than an economy — 奇門遁甲
   * is Qí Mén Dùn Jiǎ on `/it` as on `/en`, so a name kept in the catalogs is
   * one fact filed twice in the one place built for what differs between them.
   *
   * **Said in syllables and capitalised, where the engine's readings are one
   * lowercase word.** Not a drift from `docs/sources.md` § The transliteration:
   * that rule is about the reading of a *term* — 休門 is xiūmén, one name of
   * one thing in a table of them — and this is the title of an art. The header
   * has been writing those titles apart and in capitals since there was a
   * header, `Qi Men Dun Jia` and `Zi Wei Dou Shu`, and a reader who meets
   * `qíméndùnjiǎ` on a card below has no way to tell it is the same thing
   * they just read in the nav. So the syllables are the nav's, with the tones
   * put back: the site says one name one way, and says it sayably — a person
   * who has to read a title aloud reads Qí Mén Dùn Jiǎ, and nobody reads
   * fourteen letters run together.
   *
   * It used to ride on the tail of `option`, behind an em dash, because an
   * option in a list gets one line and one line had to carry the errand and
   * the name at once. A card has two. Set apart, they fall into the order this
   * interface is held to everywhere else: the description leads, in the
   * reader's own language, and the name stands under it — beside the words and
   * never instead of them, since a method is a Chinese thing and this is the
   * one place on the page where that is what is being named.
   */
  readonly name: { readonly hanzi: string; readonly pinyin: string };
}

/**
 * The instruments, in the order the consultation offers them — and the order
 * is the span of what each board is about.
 *
 * **卜 first.** 奇門 and 六壬 are put at an instant and asked about a thing
 * under way, which is the shortest subject here and the one somebody arriving
 * with a question recognises without reading further. **Then 太乙**, whose
 * subject is a year: longer than the instant above it, shorter than the life
 * below, and nobody's. **Then 命**, three boards laid on one birth and ordered
 * from the widest frame to the tightest — the sky a life began under, the
 * seats it is counted in, what it is made of. Which is also why 八字 is last
 * rather than first: it is the substrate the other two are built from, and a
 * substrate reads as ground rather than as preface.
 *
 * `SECTIONS` in `navigation.ts` lists the same six the same way, and that is
 * one order rather than two lists that happen to agree: a reader meets these
 * arts in the header and should not have to learn the row again when they open
 * the consultation.
 */
export const INSTRUMENTS: readonly Instrument[] = [
  {
    id: 'qimen',
    api: 'qimen',
    needs: 'question',
    takesBirth: true,
    takesGender: true,
    strengths: true,
    plate: { width: 900, height: 1280 },
    option: 'form.instrument.qimen',
    asks: 'form.questionPlaceholder.qimen',
    name: { hanzi: '奇門遁甲', pinyin: 'Qí Mén Dùn Jiǎ' },
  },
  {
    id: 'liuren',
    api: 'liuren',
    needs: 'question',
    takesBirth: false,
    takesGender: false,
    strengths: false,
    plate: { width: 900, height: 1379 },
    option: 'form.instrument.liuren',
    asks: 'form.questionPlaceholder.liuren',
    name: { hanzi: '大六壬', pinyin: 'Dà Liù Rén' },
  },
  // Third, where it used to stand last. The list is ordered by the span of what
  // a board is about, and a year sits between the instant a question is put at
  // and the life the three below are laid on. What that supersedes is an
  // argument about errands — this one is nobody's, so it was kept out of the
  // way — which held while the order had nothing else to say.
  {
    id: 'taiyi',
    api: 'taiyi',
    needs: 'year',
    takesBirth: false,
    takesGender: false,
    strengths: false,
    plate: { width: 900, height: 1360 },
    option: 'form.instrument.taiyi',
    asks: 'form.matterPlaceholder',
    name: { hanzi: '太乙神數', pinyin: 'Tài Yǐ Shén Shù' },
  },
  {
    id: 'qizheng',
    api: 'qizheng',
    needs: 'birth',
    takesBirth: false,
    takesGender: false,
    strengths: false,
    plate: { width: 900, height: 1450 },
    option: 'form.instrument.qizheng',
    name: { hanzi: '七政四餘', pinyin: 'Qī Zhèng Sì Yú' },
  },
  // The sixth board to arrive, and it cost the table nothing: 紫微斗數 is 命
  // laid on a birth, so it is a row with the values 八字 already had. That the
  // widening was a row and not a value is what says the third kind was the
  // hard one.
  {
    id: 'ziwei',
    api: 'ziwei',
    needs: 'birth',
    takesBirth: false,
    takesGender: true,
    strengths: false,
    // Taller than it is wide, and that is the band of readings: a board of
    // this art names forty things and every one of them has to be sayable.
    plate: { width: 900, height: 1150 },
    option: 'form.instrument.ziwei',
    name: { hanzi: '紫微斗數', pinyin: 'Zǐ Wēi Dǒu Shù' },
  },
  {
    id: 'bazi',
    api: 'bazi',
    needs: 'birth',
    takesBirth: false,
    takesGender: true,
    strengths: false,
    option: 'form.instrument.bazi',
    name: { hanzi: '八字', pinyin: 'Bā Zì' },
  },
];

/** The one the consultation opens on, when an address names none or names one
 * that is not an instrument. */
export const DEFAULT_INSTRUMENT: InstrumentId = 'qimen';

/**
 * The instrument an address asked for, or the default.
 *
 * Read in the load and again nowhere: a query string is anybody's to write,
 * and an `instrument=nonsense` that reached the page as a lookup miss would
 * cast nothing and say nothing about why.
 */
export function readInstrument(value: string | null): InstrumentId {
  return INSTRUMENTS.some((instrument) => instrument.id === value)
    ? (value as InstrumentId)
    : DEFAULT_INSTRUMENT;
}

/** The descriptor for an identifier that has already been through `readInstrument`. */
export function instrumentOf(id: InstrumentId): Instrument {
  return INSTRUMENTS.find((instrument) => instrument.id === id) ?? INSTRUMENTS[0];
}
