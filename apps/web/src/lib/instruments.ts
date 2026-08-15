import type { MessageKey } from '@qimendunjia/i18n';

/**
 * The instruments a consultation can be laid on, and everything that turns
 * with the choice.
 *
 * A consultation takes **one** instrument, chosen before the press and at no
 * point after it — see `CLAUDE.md` and `PLAN.md` § 4 phase 14 for why that is
 * the rule and not a preference. What this file adds is the other half of it:
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
 * **A row is a board, and the fourth board was a row.** `PLAN.md` § 4 phase 18
 * gave the consultation the instruments of 命 as well, and `needs` is the field
 * that arrived with them: a question, cast at the instant of asking, or a
 * birth, cast at the birth. It was left undeclared while both rows would have
 * held the same value, because a column with one value across every row
 * carries no information and no test can hold it to anything.
 */
export type InstrumentId = 'qimen' | 'liuren' | 'qizheng' | 'bazi';

export interface Instrument {
  readonly id: InstrumentId;
  /**
   * The endpoint under `/api`, which is also the key the board comes back
   * under.
   *
   * One field and not two, because it is a convention rather than a
   * coincidence: every board endpoint returns its board named after itself —
   * `/api/chart` a `chart`, `/api/liuren` a `liuren`, and `/api/qizheng` and
   * `/api/bazi` likewise. It also addresses `/plate` and `/prompt` beneath it.
   *
   * The one thing it does not settle is the moment: a chart carries its own
   * inside it, where the other boards are handed it alongside. The
   * consultation reads `body.moment` and accepts its absence, which is why
   * that is not a field here.
   */
  readonly api: string;
  /**
   * What the reader is asked for, which is the whole of the difference between
   * the two kinds.
   *
   * `question` — a board of 卜. The reader writes what they are asking and the
   * board is cast at the instant of the press: the question comes before the
   * casting or it is a caption on a board that was already there. The date and
   * the time sit under the options and empty, and empty is the press.
   *
   * `birth` — a board of 命. Nothing is asked of it. The date, the time and
   * the place *are* the input, so they stand in the open and a date is
   * required: a birth left empty would be the present, which is nobody's.
   */
  readonly needs: 'question' | 'birth';
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
   */
  readonly option: MessageKey;
}

/** The instruments, in the order the consultation offers them. */
export const INSTRUMENTS: readonly Instrument[] = [
  {
    id: 'qimen',
    api: 'chart',
    needs: 'question',
    takesBirth: true,
    takesGender: true,
    strengths: true,
    plate: { width: 900, height: 1280 },
    option: 'form.instrument.qimen',
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
  },
  {
    id: 'bazi',
    api: 'bazi',
    needs: 'birth',
    takesBirth: false,
    takesGender: true,
    strengths: false,
    option: 'form.instrument.bazi',
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
