/**
 * What the drawing needs to know about a chart — and no more.
 *
 * These types are **redeclared here rather than imported from `core`**, which
 * looks like duplication and is not. The CLI lives in `core` and draws, so a
 * dependency the other way would close a cycle; and a drawing that could
 * reach into the engine would sooner or later compute something instead of
 * rendering what it was handed.
 *
 * They are deliberately looser than the engine's: every field the drawing
 * reads, nothing it does not. Structural typing then does the work — a real
 * `QimenChart` satisfies this without being converted — and `test/types.test.ts`
 * asserts that it still does.
 */

import type { DirectionId } from './geometry.js';

export interface PlateChart {
  ju: { yang: boolean; number: number };
  chief: { star: { hanzi: string }; palace: { number: number } };
  chiefGate: { gate: { hanzi: string }; palace: { number: number } };
  palaces: readonly PlatePalace[];
  patterns: readonly PlatePattern[];
  moment: {
    local: string;
    pillars: {
      year: { hanzi: string };
      month: { hanzi: string };
      day: { hanzi: string };
      hour: { hanzi: string };
    };
  };
}

export interface PlatePalace {
  palace: { number: number; hanzi: string; id: string; element: string; pinyin?: string | undefined };
  earth: Named;
  heaven: Named;
  star: Named;
  starStrength: Named;
  gate?: Named | undefined;
  gateStrength?: Named | undefined;
  spirit?: Named | undefined;
}

/**
 * Everything on a plate has both: the hanzi is the name, the identifier is
 * how a caller finds a label for it.
 */
export interface Named {
  hanzi: string;
  id: string;
  /**
   * How the name is said: `xiūmén`, tone marks and all.
   *
   * **Not in the palace, and under the board instead.** A register here is a
   * glyph with a word wrapped under it to at most two lines, and the third
   * line a reading would take is the register below it — six names to a palace
   * and nine palaces, at a drawing that is proportional throughout, so there
   * is no size at which the room appears. It is written in the band the
   * `readings` caption asks for, where the same list costs the same on every
   * chart. See `readings.ts`.
   *
   * Optional, as everything here is optional that the drawing can do without:
   * this package is handed charts and does not compute, so a caller on an
   * older engine draws a shorter band rather than failing, and nothing without
   * a reading is listed.
   */
  pinyin?: string | undefined;
  /**
   * The phase, where the thing named *is* one — a stem, a trigram. Absent on
   * a star or a gate, which have a phase only by way of the palace they rest
   * in, and are drawn in plain ink because of it.
   */
  element?: string | undefined;
}

export interface PlatePattern {
  id: string;
  hanzi: string;
  /**
   * How the name is said, written inside the band that lists it.
   *
   * Those lines are short and flush left, so `name reading · fortune · palace`
   * fits where it already stands and costs no line at all — which is why the
   * configurations say themselves aloud in place rather than again underneath.
   * The bare glyphs marking a palace stay bare and are glossed in the band,
   * which is the bargain already struck there for a fortune.
   */
  pinyin?: string | undefined;
  palace?: number | undefined;
  /**
   * The fortune the tradition transmits with the name — 吉, 凶, or both.
   *
   * Optional, as everything here is optional that the drawing can do without:
   * this package is handed charts and does not compute, so a caller on an
   * older engine draws the configurations without their fortunes rather than
   * failing. It is written in the band under the grid and never in a palace,
   * where the room for it does not exist and a bare glyph would be a name
   * with no gloss beside it.
   */
  valence?: { id: string; hanzi: string } | undefined;
  /** `gate`, `star` or `both`, for a configuration belonging to the whole board. */
  layer?: string | undefined;
}

/**
 * What to write in the palaces, keyed by the engine's identifiers.
 *
 * The package still has no catalog and still knows no language: the caller
 * hands it the words. What it decides is only the layout.
 *
 * Anything absent falls back to the hanzi, so a caller that passes nothing
 * gets the glyphs — which is what a reader who reads them wants, and what the
 * drawing did before there was any way to ask for anything else.
 */
export interface PlateLabels {
  palace?: Record<string, string>;
  star?: Record<string, string>;
  gate?: Record<string, string>;
  spirit?: Record<string, string>;
  stem?: Record<string, string>;
  pattern?: Record<string, string>;
  valence?: Record<string, string>;
  /** The word for a layer — the gates, the stars, both — as a place. */
  layer?: Record<string, string>;
}

/**
 * The text around the grid, supplied whole.
 *
 * Where a caption names something the chart contains, the caller writes the
 * name as well as the word for it: this package holds no catalog and cannot
 * know whether the reader wants 天蓬 or "Canopy".
 */
export interface PlateCaptions {
  /** e.g. `yang dun 9`. Absent leaves the line out. */
  ju?: string;
  /** The four pillars, said however the caller wants. Defaults to the hanzi. */
  pillars?: string;
  /** e.g. `chief Canopy`. Written whole, name included. */
  chief?: string;
  /** e.g. `chief gate Rest`. */
  chiefGate?: string;
  /** What the drawing is not, said where it will be read. */
  note?: string;
  /**
   * The word for the band of configurations under the grid, e.g. «Patterns».
   *
   * Giving it is what draws the band, exactly as giving `compass` is what
   * draws the frame, and the grid comes down in size to make room — by as much
   * as the band carries and no more, since a chart with two configurations
   * should not pay for a chart with six.
   *
   * The band exists because a palace has room for a configuration's name and
   * for nothing else. Its fortune needs a word beside the glyph, and 伏吟 and
   * 反吟 have no palace at all: they are properties of the whole board, and
   * without a band the drawing simply never mentions them.
   */
  configurations?: string;
  /**
   * The word for the band of readings under all of it, e.g. «Said aloud».
   *
   * Giving it is what draws the band, as with the one above. It lists every
   * name on the board once — the palaces, the stems, the stars, the gates, the
   * spirits, and the branches of the compass where one was drawn — grouped by
   * register, each with the reading it is said by.
   *
   * A name carries its reading, and the drawing was the one surface in this
   * project that printed hanzi without it. To the reader it is built for a
   * glyph alone is a shape with no sound: unsayable, unsearchable, unaskable.
   * See `readings.ts` for why a band and not the palace itself.
   */
  readings?: string;
}

/**
 * The words for the eight directions, keyed as the engine keys them.
 *
 * Short ones: they are written in a band a twentieth of the drawing wide, and
 * "nord-ovest" set there would be either unreadable or wider than the palace
 * it stands over. `NO`, `SE`, `N` — the abbreviations a map uses, which are
 * not the same in every language, which is why this package does not invent
 * them either.
 *
 * Partial, so that a caller with nothing to say for a direction leaves that
 * one blank rather than writing an identifier at the reader.
 */
export type PlateDirections = Partial<Record<DirectionId, string>>;

/**
 * What the drawing needs of a Liu Ren board.
 *
 * Redeclared here for the reason everything in this file is: the package that
 * draws must not be able to reach the package that computes. A real
 * `LiurenBoard` satisfies this structurally, and `test/types.test.ts` proves
 * it still does.
 *
 * Looser than the engine's in one way worth noticing: `rule`, `keti` and
 * `position` are plain strings here where the engine has unions of nine,
 * fifteen and three. The drawing looks a label up by them and writes what it
 * finds; a value it has never heard of costs it a caption, not a picture.
 */
export interface PlateLiuren {
  yuejiang: { hanzi: string; branch: { hanzi: string; index: number } };
  day: { hanzi: string };
  hour: { hanzi: string; index: number };
  /**
   * The 天盤 by palace of the 地盤: `heaven[i]` stands over branch `i`.
   *
   * `element` is read for the ink, not for a calculation: a branch **is** its
   * phase, and the relation between what stands on a palace and the palace it
   * stands on is what the whole method turns on — 賊剋 asks which of the two
   * controls the other. Written in the phase's own colour that relation is
   * visible before a character is read. See `palette.ts` for the argument,
   * which the chart makes for its stems.
   */
  heaven: readonly { hanzi: string; id: string; index: number; element: string; pinyin?: string | undefined }[];
  /** The general over each palace of the 地盤, in the same order. */
  generals: readonly { hanzi: string; id: string; pinyin?: string | undefined }[];
  courses: readonly PlateCourse[];
  transmissions: readonly PlateTransmission[];
  rule: string;
  keti?: string | undefined;
  /** Set on a board drawn by a rule no reference implementation covers. */
  unverified?: true | undefined;
}

export interface PlateCourse {
  /** 一課 to 四課. They are written right to left, as the tradition writes them. */
  number: number;
  upper: { hanzi: string; id: string; element: string; pinyin?: string | undefined };
  /** A branch, or the day stem where the first lesson stands on it. */
  lower: { hanzi: string; id: string; element: string; pinyin?: string | undefined };
}

export interface PlateTransmission {
  position: string;
  branch: { hanzi: string; id: string; element: string; pinyin?: string | undefined };
  general: { hanzi: string; id: string; pinyin?: string | undefined };
  hiddenStem?: { hanzi: string; id: string; element: string; pinyin?: string | undefined } | undefined;
  /** 空亡 — the branch falls outside the day's decade and carries no stem. */
  empty: boolean;
}

/**
 * What to write around a Liu Ren board, keyed by the engine's identifiers.
 *
 * The package still holds no catalog and knows no language: a caller chooses
 * the words and this decides where they go. What a map is missing is written
 * as the hanzi alone, which is what the board did before there were words.
 */
export interface PlateLiurenLabels {
  /** The twelve generals — the names a reader cannot infer from the glyph. */
  general?: Record<string, string>;
  /** The twelve branches, for what has come to stand on a palace. */
  branch?: Record<string, string>;
  /** The ten stems, for what covers a transmission. */
  stem?: Record<string, string>;
  rule?: Record<string, string>;
  keti?: Record<string, string>;
  transmission?: Record<string, string>;
  /** A word for 空亡, written where a transmission has no stem under it. */
  empty?: string;
  /** The line said on a board whose rule nothing could check. */
  unverified?: string;
}

export interface PlateLiurenOptions {
  size?: number;
  scheme?: 'light' | 'dark' | 'auto';
  labels?: PlateLiurenLabels;
  /** A line over the board — the moment it was laid for, usually. */
  heading?: string;
  /**
   * The word for the band of readings under the ring, e.g. «Said aloud».
   *
   * Giving it draws the band, as on the chart, and for the same reason: the
   * ring prints the twelve branches twice over and the twelve generals beside
   * them, and a glyph with no sound is unsayable to the reader this is built
   * for. The list is the branches, the generals and whichever stems the board
   * turned up — near enough the same list at every hour, since what the hour
   * changes is where they stand.
   *
   * The rule and the 課體 are not in it: they are written in the middle of the
   * ring as words in the reader's own language, with no glyph to be said.
   */
  readings?: string;
}

export interface PlateOptions {
  /**
   * Side of the square, in pixels. Default 900.
   *
   * The drawing is proportional throughout, so this settles its intrinsic
   * size and nothing else: the same words wrap and the same words are shrunk
   * at every value. Asking for more does not buy a roomier palace.
   */
  size?: number;
  /**
   * `light`, `dark`, or `auto` — which emits both and lets the page choose.
   *
   * `auto` is the default because an SVG dropped into a page has no idea
   * which it will be read in, and a chart that turns invisible at night is a
   * chart nobody uses.
   */
  scheme?: 'light' | 'dark' | 'auto';
  /** Text around the grid. Left out entirely when absent. */
  captions?: PlateCaptions;
  /**
   * The frame of directions outside the grid: the twelve branches around the
   * board, and a word at each of the eight quarters.
   *
   * Drawn only when this is given, and the grid comes down in size to make
   * room for it. A chart is consulted for a direction as often as for an
   * hour, and the trigram in each palace already says which one — but it says
   * it to a reader who knows that 巽 is the southeast, and this says it to
   * everyone else, on the side of the board they would actually face.
   *
   * `{}` draws the branches and no words, which is a compass in Chinese and
   * a legitimate thing to want.
   */
  compass?: PlateDirections;
  /**
   * Words for what stands in the palaces. Without it the drawing carries
   * hanzi and no language at all.
   */
  labels?: PlateLabels;
}

/**
 * A 七政四餘 board, as much of one as a drawing needs.
 *
 * Looser than the engine's in the usual way, and in one place deliberately
 * looser than it looks: `element` is optional on a body because 太陽 and 太陰
 * have none — the five planets *are* the five phases and are inked as them,
 * where the Sun and the Moon stand outside that count and take the plain ink.
 * A drawing that required one would have had to invent two.
 */
export interface PlateQizheng {
  /** The seven, in the transmitted order 日月水金火木土. */
  governors: readonly PlatePlacement[];
  /** Three of the four, on every board this engine draws. See `remainders` in the labels. */
  remainders: readonly PlatePlacement[];
  minggong: {
    palace: { hanzi: string; index: number };
    ci: { hanzi: string; id: string; pinyin?: string | undefined };
  };
  /** The twelve 人事宮, each with the palace of the ring it fell on. */
  houses: readonly {
    house: { hanzi: string; id: string; pinyin?: string | undefined };
    palace: { index: number };
    ci: { hanzi: string; id: string; pinyin?: string | undefined };
  }[];
}

export interface PlatePlacement {
  body: { hanzi: string; id: string; element?: string | undefined; pinyin?: string | undefined };
  /** The 宿 it fell in, and how far past that 宿's 距星 it stands. */
  lodge: { hanzi: string; id: string; pinyin?: string | undefined };
  lodgeDegree: number;
  /** The palace of the ring. `index` seats it; the drawing writes its own branch. */
  palace: { hanzi: string; index: number };
  /** 順 or 逆, as an identifier the caller has a word for. */
  motion: string;
}

export interface PlateQizhengLabels {
  /** The eleven, which the ring writes in glyphs and the block above glosses. */
  body?: Record<string, string>;
  /** The twelve 人事宮, written under the palace each fell on. */
  house?: Record<string, string>;
  /** The twelve 次. In the band of readings only: the ring has no room for a word. */
  ci?: Record<string, string>;
  /** The twenty-eight 宿, in the band only: the rows over the ring hold a degree there. */
  lodge?: Record<string, string>;
  /** 順 and 逆. */
  motion?: Record<string, string>;
  /** A word for what the middle of the ring holds, e.g. «palace of the life». */
  minggong?: string;
  /** The line saying the board carries three remainders and why not four. */
  remainders?: string;
  /** The line saying the 宿 begin at their determinative stars and not at a table. */
  frame?: string;
}

export interface PlateQizhengOptions {
  size?: number;
  scheme?: 'light' | 'dark' | 'auto';
  labels?: PlateQizhengLabels;
  /** A line over the board — the moment it was laid for, usually. */
  heading?: string;
  /**
   * The word for the band of readings under the ring, e.g. «Said aloud».
   *
   * Worth more here than on either other board. The 宿 are single characters
   * that turn up nowhere else a reader is likely to have met them, and the
   * twelve 次 are two-character names — 娵訾, 鶉尾 — that even a reader of
   * Chinese may never have had to say. Without the band the ring is a field
   * of shapes.
   */
  readings?: string;
}

/**
 * A 太乙 board, as the drawing needs it.
 *
 * The numbers here are **this board's own**, not the Luoshu's: 卷二 of
 * 《太乙金鏡式經》 shifts every palace one seat so that 一 reaches 乾, so
 * `number` 1 is the north-west and 9 is the south-east. The drawing never
 * derives a position from a number — it is told the direction — precisely so
 * that a figure which looks like a Qi Men chart cannot quietly be laid out
 * like one.
 *
 * The 局, the 計神, the 合神 and the 八門直使 are **not** here, and the board
 * carries all four: this figure is the placements and the two counts, and the
 * bookkeeping the year rests on belongs to the transcript beside it, which
 * prints every one of them. They were declared and never read, which made the
 * shape a promise the drawing did not keep — and required them of any board
 * handed to it for fields no line of the drawing consults.
 */
/**
 * A 紫微斗數 board, as the drawing needs it.
 *
 * Looser than the engine's in the two places `PlateQizheng` is looser than
 * its own, and for the same reason: a field the picture never reads is a
 * field the picture must not require. `changsheng`, `boshi` and `majorLimit`
 * are absent whenever no sex was given, and the drawing prints what it is
 * handed.
 */
export interface PlateZiwei {
  /** The twelve, 命宮 first, in the order 卷二 numbers them. */
  palaces: readonly PlateZiweiPalace[];
  bureau: Named;
  /** The branch the 身宮 fell on, for the centre. */
  bodyBranch: Named;
  lifeMaster: Named;
  bodyMaster: Named;
  /** The stem-branch of the 命宮, whose 納音 cut the bureau. */
  minggongPillar: Named;
  nayin: Named;
  yearPillar: Named;
  hourBranch: Named;
  lunar: { year: number; month: number; leap: boolean; day: number };
}

export interface PlateZiweiPalace {
  house: Named;
  /**
   * The ground the seat stands on. The drawing places the cell by this, and
   * tints it by the phase — 卷二 calls a palace its phase's 鄉, its country,
   * and tells the reader to weigh a star against the country it fell in.
   */
  branch: Named & { element: string };
  stem: Named;
  stars: readonly PlateZiweiSeat[];
  /** True where the 身宮 fell. */
  body: boolean;
  changsheng?: Named | null | undefined;
  boshi?: Named | null | undefined;
  majorLimit?: { from: number; to: number } | null | undefined;
}

export interface PlateZiweiSeat {
  /**
   * The star, with the phase or phases the book gives it.
   *
   * An array because three of them have two — 天同屬水金, 貪狼屬水木,
   * 七殺屬火金 — and thirteen have none stated. The drawing inks a name in
   * its phase only where there is exactly one to ink it in.
   */
  star: Named & { starClass: string; elements: readonly string[]; zhengyao: boolean };
  /** The grade the book gives this star on this branch, where it gives one. */
  brightness?: Named | null | undefined;
  transform?: Named | null | undefined;
}

export interface PlateZiweiLabels {
  /**
   * Every star under the word for it. The drawing glosses the eighteen 正曜
   * and leaves the rest to the band, so it reads only some of these — but it
   * is handed all of them, because which it can afford is its own arithmetic
   * and not the caller's.
   */
  star?: Record<string, string>;
  /**
   * The twelve seats under the word for each. Read only by the band: the
   * corner of a cell has room for the glyph and no more, and a seat is the one
   * name on this board a reader meets twelve times.
   */
  house?: Record<string, string>;
  bureau?: string;
  lifeMaster?: string;
  bodyMaster?: string;
}

export interface PlateZiweiOptions {
  size?: number;
  scheme?: 'light' | 'dark' | 'auto';
  labels?: PlateZiweiLabels;
  heading?: string;
  /** The heading over the band where the names are said aloud. */
  readings?: string;
}

export interface PlateTaiyi {
  year: number;
  sui: { hanzi: string };
  /** 太乙 itself, in one of the eight. It never enters the centre. */
  taiyi: { palace: PlateTaiyiPalace; year: number };
  /** 文昌, the lower eye, which is the host's. */
  wenchang: PlateTaiyiGod;
  /** 始擊, the upper eye, which is the guest's. */
  shiji: PlateTaiyiGod;
  host: PlateTaiyiSide;
  guest: PlateTaiyiSide;
  /** The sixteen, in ring order from 子. The drawing seats them by that order. */
  gods: readonly PlateTaiyiGod[];
  patterns: readonly {
    hanzi: string;
    id: string;
    valence: { hanzi: string };
    subject: string;
    palace?: number | undefined;
    kind?: string | undefined;
  }[];
}

export interface PlateTaiyiPalace {
  /** 太乙's own numbering, 1 to 9. */
  number: number;
  hanzi: string;
  id: string;
  /**
   * The compass direction, which is what the palace *is*.
   *
   * Read for the record rather than for the layout: the drawing seats the
   * eight from the gods of the ring, so nothing on the sheet is placed by a
   * number that a reader might take for the Luoshu's.
   */
  direction: string | null;
}

export interface PlateTaiyiGod {
  hanzi: string;
  id: string;
  /** How the name is said, for the band under the grid. */
  pinyin?: string | undefined;
  element: string;
  /** The palace it stands at, absent for the eight 間神. */
  palace?: number | undefined;
}

export interface PlateTaiyiSide {
  count: number;
  general: PlateTaiyiPalace;
  /** Absent where the count reduced to the centre, which is on no ring. */
  assistant?: PlateTaiyiPalace | undefined;
}

export interface PlateTaiyiLabels {
  /** The sixteen, glossed in the cell each of them sits in. */
  god?: Record<string, string>;
  /**
   * The five that stand *in* the palaces, glossed under the glyph.
   *
   * Keyed by the part each of them plays rather than by its glyph, because
   * that is what the caller has a word for: 主將 is the host's great general
   * and the listing over the grid already calls it that. The drawing holds no
   * catalog, so the glyphs are its own and the words are the caller's, as they
   * are for the sixteen.
   */
  standing?: {
    taiyi?: string;
    hostGeneral?: string;
    hostAssistant?: string;
    guestGeneral?: string;
    guestAssistant?: string;
  };
  /** The conditions, under the grid. */
  pattern?: Record<string, string>;
  /** Words for the parts: the two eyes, the two counts, the generals. */
  wenchang?: string;
  shiji?: string;
  hostCount?: string;
  guestCount?: string;
  general?: string;
  assistant?: string;
  /**
   * The line saying these palace numbers are not a Qi Men chart's.
   *
   * The one standing line the picture carries. What this board was checked
   * against — the text itself, nothing that runs — used to stand beside it and
   * is said where the section says what it is made of instead: it is a fact
   * about the whole of this figure, not a caption to one drawing of it, and
   * the transcript still carries it wherever the drawing cannot follow.
   */
  palaces?: string;
}

export interface PlateTaiyiOptions {
  size?: number;
  scheme?: 'light' | 'dark' | 'auto';
  labels?: PlateTaiyiLabels;
  heading?: string;
  /** The heading over the band where the sixteen are said aloud. */
  readings?: string;
}
