import type { MessageKey, Translator } from '@qimendunjia/i18n';
import type { Jianchu } from './almanac.js';
import type { Bazi } from './bazi/index.js';
import { palace, YUAN_HANZI, YUAN_PINYIN, type QimenChart } from './dunjia/index.js';
import { BRANCHES, type Ganzhi } from './ganzhi.js';
import type { LunarDate } from './lunar.js';
import {
  COURSE_NAMES,
  KETI,
  LIUREN_RULES,
  TRANSMISSION_NAMES,
  type Course,
  type LiurenBoard,
  type Transmission,
} from './liuren.js';
import { NIANMING_NAMES, type Nianming, type Placement, type Seat } from './nianming.js';
import type { Moment } from './pillars.js';
import type { ScanMatch } from './scan.js';
import type { SolarTerm } from './solar-terms.js';
import { sayGanzhi } from './labels.js';
import { fromJulianDay } from './time.js';

/**
 * The dense rendering, for a terminal and for an agent.
 *
 * Every name is printed as the hanzi it is, followed by a gloss in the
 * requested locale. Neither stands alone: the hanzi is the name, and a reader
 * who does not read Chinese still needs to know that 休門 is the gate of rest.
 * An agent gets both and can quote either.
 *
 * Nothing here decides anything. The engine reports arrangements and what the
 * tradition calls them, and these functions report that more legibly — in the
 * order the engine found them, never sorted by fortune, which would be this
 * layer inventing a ranking the engine refuses to have.
 */

/**
 * A name in its script and said aloud: `休門 xiūmén`.
 *
 * The hanzi *is* the name, and it stays: without it nothing here can be
 * checked against a book or a second implementation. The pinyin is beside it
 * because this output is read by someone who does not read Chinese, and for
 * them a glyph is a shape with no sound — they cannot say it, look it up, or
 * ask anyone about it. The transliteration is what turns the name into
 * something they can carry out of the terminal.
 *
 * It is not a locale and does not vary with one: 休門 is xiūmén to an Italian
 * reader and to an English one. Only the gloss beside it changes.
 */
function glyph(entity: { hanzi: string; pinyin: string }): string {
  return `${entity.hanzi} ${entity.pinyin}`;
}

/**
 * `Rest 休門 xiūmén` — the word first, the name after it.
 *
 * The word goes first and the name second, because most people reading this
 * cannot read the glyph, and a line they cannot read is a line they skip.
 */
function named(
  entity: { hanzi: string; pinyin: string },
  key: MessageKey,
  t: Translator,
): string {
  return `${t(key)} ${glyph(entity)}`;
}

/**
 * How many columns a string takes in a terminal.
 *
 * Hanzi occupy two and Latin letters one. Counting code points would misalign
 * every table on the page.
 */
function printedWidth(value: string): number {
  let printed = 0;
  for (const character of value) printed += /[⺀-鿿＀-｠]/.test(character) ? 2 : 1;
  return printed;
}

function pad(value: string, width: number): string {
  return value + ' '.repeat(Math.max(0, width - printedWidth(value)));
}

/**
 * Rows of cells laid out as a table, each column as wide as its own content.
 *
 * The widths used to be constants. That is a thing which works in exactly one
 * language: every one of them had been measured against English, and in
 * Italian — where `Ricchezza Indiretta` stands for `Indirect Wealth` — several
 * overflowed and welded two columns into one unreadable word. Some overflowed
 * in English too, once a cell held three concealed stems instead of two.
 *
 * A width read off the content cannot do that, in any locale, however long a
 * name the transliteration adds. The last cell of a row is never padded, so
 * no line carries trailing blanks.
 */
function columns(rows: readonly (readonly string[])[], gutter = 2): string[] {
  const widths: number[] = [];
  for (const row of rows) {
    for (const [index, cell] of row.entries()) {
      widths[index] = Math.max(widths[index] ?? 0, printedWidth(cell));
    }
  }

  return rows.map((row) =>
    row
      .map((cell, index) =>
        index === row.length - 1 ? cell : pad(cell, (widths[index] as number) + gutter),
      )
      .join(''),
  );
}

/** The same, indented two spaces, which is how every block here is set. */
function table(rows: readonly (readonly string[])[], gutter = 2): string[] {
  return columns(rows, gutter).map((line) => `  ${line}`);
}

function ganzhi(pair: Ganzhi, t: Translator): string {
  return `${sayGanzhi(pair, t)}  ${glyph(pair)}`;
}

function timeOf(julianDayUT: number, timezone: string): string {
  return fromJulianDay(julianDayUT, timezone).toFormat('yyyy-MM-dd HH:mm');
}

function term(solarTerm: SolarTerm, timezone: string, t: Translator): string {
  const gloss = named(solarTerm.term, `label.term.${solarTerm.term.id}` as MessageKey, t);
  return `${gloss} — ${timeOf(solarTerm.julianDayUT, timezone)}`;
}

function lunar(date: LunarDate, t: Translator): string {
  const leap = date.leap ? `${t('cli.value.leapMonth')} ` : '';
  return `${date.year} · ${leap}${date.month}/${date.day}`;
}

/**
 * The day's officer, said with its ganzhi.
 *
 * The pillar is printed beside it because the page's day is not always the
 * chart's: it turns on 120°E and on the date. A reader who sees the two agree
 * learns nothing and loses nothing; a reader who sees them differ has been
 * told why in the one place it could matter.
 */
export function formatAlmanac(page: Jianchu, t: Translator): string {
  return `  ${pad(t('cli.field.jianchu'), 20)}${officer(page, t)}`;
}

function officer(page: Jianchu, t: Translator): string {
  const name = `${page.officer.hanzi} ${page.officer.pinyin} ${t(`label.officer.${page.officer.id}` as MessageKey)}`;
  const doubled = page.doubled ? `  (${t('cli.value.jianchuDoubled')})` : '';
  return `${name}  · ${page.day.hanzi}${doubled}`;
}

/**
 * The instant, its pillars, and the calendrical facts they rest on.
 *
 * `almanac` is false in exactly one place and the reason is not tidiness: the
 * officer is a function of the month branch and the day branch, **both of
 * which the block below already prints**, so a model handed the two together
 * reads one datum twice and calls the second a corroboration of the first.
 * The layer belongs where nothing is being asked — a terminal, an agent's
 * answer, a page — and never inside a prompt's fence. See `PLAN.md` § 4
 * phase 15 and the test that keeps this true.
 */
export function formatMoment(
  moment: Moment,
  t: Translator,
  { almanac = true }: { almanac?: boolean } = {},
): string {
  const zone = moment.input.timezone;
  const fields: string[][] = [
    [t('cli.field.local'), moment.local],
    [t('cli.field.utc'), moment.utc],
  ];

  if (moment.options.trueSolarTime) {
    // One count of minutes, rounded once: rounded apart, the seconds past
    // 59.5 printed as `:60` beside an hour that had not moved. The wrap is
    // for the last half-minute of the day, which rounds to the top of the
    // next one; the date it lands on is `dayShift`'s to report, not this line's.
    const minutesOfDay = Math.round(moment.solar.hour * 60) % 1440;
    const hours = Math.floor(minutesOfDay / 60);
    const minutes = minutesOfDay % 60;
    fields.push([
      t('cli.field.solar'),
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` +
        `  (${t('cli.field.correction')} ${t('cli.value.minutes', { value: moment.solar.correctionMinutes.toFixed(1) })})`,
    ]);
  }

  fields.push(
    [t('cli.field.term'), term(moment.solarTerm, zone, t)],
    [t('cli.field.jie'), term(moment.jie, zone, t)],
    [t('cli.field.lunar'), lunar(moment.lunar, t)],
  );
  if (almanac) fields.push([t('cli.field.jianchu'), officer(moment.jianchu, t)]);

  // One pillar to a line rather than four across the page. Said in words and
  // then in glyphs and then aloud, a pillar is some forty columns wide, and
  // four of those is a table nothing can show without folding it in half.
  const pillars = (['year', 'month', 'day', 'hour'] as const).map((position) => [
    t(`cli.column.${position}` as MessageKey),
    sayGanzhi(moment.pillars[position], t),
    glyph(moment.pillars[position]),
  ]);

  return [
    `${t('cli.heading.moment')}`,
    ...table(fields, 4),
    '',
    `${t('cli.heading.pillars')}`,
    ...table(pillars),
  ].join('\n');
}

/** The Qi Men chart: the ju, the chief, and the nine palaces. */
export function formatQimenChart(chart: QimenChart, t: Translator): string {
  const dun = chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun');
  const yuan = named(
    { hanzi: YUAN_HANZI[chart.ju.yuan], pinyin: YUAN_PINYIN[chart.ju.yuan] },
    `label.yuan.${chart.ju.yuan}` as MessageKey,
    t,
  );

  // Under zhirun the ju's term is worth a word of its own: it can be a term
  // the Sun has not reached yet (超神), or a repeated one (閏). Under chaibu
  // it is always the term in force, which the moment above already shows.
  const served =
    chart.options.method === 'zhirun'
      ? ` · ${chart.ju.leap ? '閏' : ''}${chart.ju.term.hanzi} ${chart.ju.leap ? 'rùn' : ''}${chart.ju.term.pinyin} ${
          chart.ju.leap
            ? t('cli.value.leapTerm', {
                term: t(`label.term.${chart.ju.term.id}` as MessageKey),
              })
            : t(`label.term.${chart.ju.term.id}` as MessageKey)
        }`
      : '';

  const lines = [
    `${t('cli.heading.chart')}`,
    ...table(
      [
        [t('cli.field.ju'), `${dun} ${chart.ju.number} · ${yuan}${served}`],
        [
          t('cli.field.instrument'),
          named(chart.instrument, `label.stem.${chart.instrument.id}` as MessageKey, t),
        ],
        [
          t('cli.field.chief'),
          `${named(chart.chief.star, `label.star.${chart.chief.star.id}` as MessageKey, t)} → ` +
            `${named(chart.chief.palace, `label.palace.${chart.chief.palace.id}` as MessageKey, t)}`,
        ],
        [
          t('cli.field.chiefGate'),
          `${named(chart.chiefGate.gate, `label.gate.${chart.chiefGate.gate.id}` as MessageKey, t)} → ` +
            `${named(chart.chiefGate.palace, `label.palace.${chart.chiefGate.palace.id}` as MessageKey, t)}`,
        ],
      ],
      4,
    ),
  ];

  const strong = (state: { id: string } | undefined): string =>
    state ? t(`label.strength.${state.id}` as MessageKey) : '—';
  // How it stands to the ground it is on, after how it stands to the season.
  // The two are different questions of the same thing and are told apart by
  // the glyph, which names the second and never the first.
  const stands = (relation: { id: string; hanzi: string; pinyin: string } | undefined): string =>
    relation ? ` · ${named(relation, `label.relation.${relation.id}` as MessageKey, t)}` : '';

  /**
   * The palace, named in full for the first table and in short for the others.
   *
   * The direction is what a reader needs to find the palace on the board, and
   * they need it once. Under the two tables that follow it, the first of which
   * has just given it three lines above, it is nine repetitions of a word
   * nobody is reading — and nine columns the tables cannot spare.
   */
  const where = (cell: (typeof chart.palaces)[number], full: boolean): string =>
    full
      ? `${cell.palace.number} ${named(cell.palace, `label.palace.${cell.palace.id}` as MessageKey, t)}`
      : `${cell.palace.number} ${glyph(cell.palace)}`;

  /**
   * Three tables and not one, because a palace answers three questions.
   *
   * What lies in it — the two plates of stems, which the ju and the hour fix.
   * What stands in it — the star, the gate and the spirit, which move. And how
   * those stand, to the season and to the ground they came to rest on.
   *
   * It used to be one table of six columns, which was already the widest thing
   * this prints and became unreadable once every name carried its reading as
   * well as its glyph: a hundred and seventy-six columns, which no terminal
   * shows and every terminal folds in half. Three tables of three or four are
   * each under a hundred, and the seam between them falls where the reading
   * has a seam anyway.
   */
  lines.push(
    '',
    `${t('cli.heading.palaces')}`,
    ...table([
      [t('cli.column.palace'), t('cli.column.earth'), t('cli.column.heaven')],
      ...chart.palaces.map((cell) => [
        where(cell, true),
        named(cell.earth, `label.stem.${cell.earth.id}` as MessageKey, t),
        named(cell.heaven, `label.stem.${cell.heaven.id}` as MessageKey, t),
      ]),
    ]),
    // Under the table and not in it: a fourth column empty on eight rows of
    // nine would cost every reader width to tell one of them something.
    ...lodging(chart, t),
    '',
    `${t('cli.heading.standing')}`,
    ...table([
      [t('cli.column.palace'), t('cli.column.star'), t('cli.column.gate'), t('cli.column.spirit')],
      ...chart.palaces.map((cell) => [
        where(cell, false),
        named(cell.star, `label.star.${cell.star.id}` as MessageKey, t),
        cell.gate ? named(cell.gate, `label.gate.${cell.gate.id}` as MessageKey, t) : '—',
        cell.spirit
          ? named(cell.spirit, `label.spirit.${cell.spirit.id}` as MessageKey, t)
          : '—',
      ]),
    ]),
    '',
    `${t('cli.heading.weighed')}`,
    ...table([
      [t('cli.column.palace'), t('cli.column.star'), t('cli.column.gate')],
      ...chart.palaces.map((cell) => [
        where(cell, false),
        `${strong(cell.starStrength)}${stands(cell.starRelation)}`,
        cell.gate ? `${strong(cell.gateStrength)}${stands(cell.gateRelation)}` : '—',
      ]),
    ]),
  );

  if (chart.patterns.length > 0) {
    lines.push(
      '',
      `${t('cli.heading.patterns')}`,
      ...table(
        chart.patterns.map((pattern) => {
          const where = pattern.palace
            ? `— ${palaceOf(chart, pattern.palace, t)}`
            : pattern.layer
              ? `— ${t(`label.layer.${pattern.layer}` as MessageKey)}`
              : '';
          return [
            t(`label.pattern.${pattern.id}` as MessageKey),
            glyph(pattern),
            named(pattern.valence, `label.valence.${pattern.valence.id}` as MessageKey, t),
            where,
          ];
        }),
      ),
    );
  }

  lines.push(
    '',
    `  ${t('cli.column.season')} ${t(`label.element.${chart.season}` as MessageKey)}`,
  );

  // Both horses, always, and each said with the pillar it was reckoned from.
  // Naming only one of them would be choosing a school in a line of output.
  for (const horse of chart.horses) {
    lines.push(
      `  ${t('cli.field.horse', {
        from: t(`label.horse.${horse.from}` as MessageKey),
        branch: named(horse.branch, `label.branch.${horse.branch.id}` as MessageKey, t),
        palace: `${horse.palace} ${named(palace(horse.palace), `label.palace.${palace(horse.palace).id}` as MessageKey, t)}`,
      })}`,
    );
  }

  lines.push(`  ${t('cli.note.method', { method: chart.options.method })}`);
  // Said only when it is not the default, and only under the method it bears
  // on: a line about the futou beside a zhirun chart would read as a choice
  // where the method has already made one.
  if (chart.options.method === 'chaibu' && chart.options.yuan === 'futou') {
    lines.push(`  ${t('cli.note.yuanFutou')}`);
  }
  return lines.join('\n');
}

/** `4 巽 southeast`, for naming where a configuration fell. */
/**
 * Where the centre lodges, and with what (寄宮).
 *
 * A line rather than a column, and printed under the plates it is about. The
 * centre has no direction, no gate and no spirit, so its stem is read at a
 * palace that has all three — and a chart that showed the host's own stem and
 * nothing else left the reader to know that from somewhere other than the
 * chart.
 */
function lodging(chart: QimenChart, t: Translator): string[] {
  const host = chart.palaces.find((cell) => cell.lodged);
  if (!host?.lodged) return [];

  return [
    `  ${t('cli.field.lodged', {
      palace: `${host.palace.number} ${named(host.palace, `label.palace.${host.palace.id}` as MessageKey, t)}`,
      stem: named(host.lodged, `label.stem.${host.lodged.id}` as MessageKey, t),
    })}`,
  ];
}

/**
 * 年命 — where a birth stands in the chart above it.
 *
 * Printed under the chart and never instead of it: what this adds is two
 * pairs and the palaces they fall in, and everything that weighs those
 * palaces — the star, the gate, the spirit, the strengths — the reader has
 * three tables up. Nothing is repeated here, and nothing is concluded: the
 * 演義 weighs a 本命 by 生旺 or 囚死, and that is a reading, which needs a
 * question this does not have.
 */
/**
 * The Liu Ren board, for a terminal and for an agent.
 *
 * The plate is printed as three rows against the twelve palaces of the earth,
 * because that is what it is: the earth never moves, and what a reader needs
 * to see is what has come to stand over each of its branches and which general
 * rides there. The four lessons and the three transmissions follow, then the
 * rule that drew them and the shape it turned out to be.
 *
 * Nothing is ranked and nothing is chosen. Which transmission a reader takes
 * for their matter is theirs, and this prints them in the order the board
 * produced them.
 */
export function formatLiuren(board: LiurenBoard, t: Translator): string {
  const lines = [t('cli.heading.liuren')];

  lines.push(
    ...table(
      [
        [
          t('cli.field.yuejiang'),
          `${named(board.yuejiang, `label.yuejiang.${board.yuejiang.id}` as MessageKey, t)} · ` +
            `${glyph(board.yuejiang.branch)} — ${named(board.yuejiang.term, `label.term.${board.yuejiang.term.id}` as MessageKey, t)}`,
        ],
        [
          t('cli.field.half'),
          t(board.half === 'day' ? 'cli.value.dayHalf' : 'cli.value.nightHalf'),
        ],
      ],
      4,
    ),
  );

  // Three rows over the same twelve columns: the ground, what stands on it,
  // and who rides there. Aligned by `columns`, which counts a hanzi as the two
  // terminal cells it occupies.
  lines.push(
    '',
    `  ${t('cli.field.plate')}`,
    ...table(
      [
        ['地', ...BRANCHES.map((branch) => branch.hanzi)],
        ['天', ...board.heaven.map((branch) => branch.hanzi)],
        ['將', ...board.generals.map((general) => general.hanzi)],
      ],
      1,
    ).map((line) => `  ${line}`),
  );

  lines.push(
    '',
    `  ${t('cli.field.courses')}`,
    ...table(board.courses.map((course) => courseRow(course, t)), 3).map((line) => `  ${line}`),
  );

  lines.push(
    '',
    `  ${t('cli.field.transmissions')}`,
    ...table(
      board.transmissions.map((transmission) => transmissionRow(transmission, t)),
      3,
    ).map((line) => `  ${line}`),
  );

  const rule = LIUREN_RULES[board.rule];
  const drawnBy = named(rule, `label.liurenRule.${board.rule}` as MessageKey, t);
  const rows: string[][] = [[t('cli.field.drawnBy'), drawnBy]];
  if (board.keti) {
    // 八專, 別責 and 涉害 name the shape with the same words as the rule that
    // found it. Said once rather than twice — as the drawing says it once.
    const keti = named(KETI[board.keti], `label.keti.${board.keti}` as MessageKey, t);
    if (keti !== drawnBy) rows.push([t('cli.field.keti'), keti]);
  }
  lines.push('', ...table(rows, 4));

  // Said where it applies and not in a footnote: a board drawn by 返吟 rests on
  // a rule no reference implementation covers.
  if (board.unverified) lines.push('', `  ${t('cli.value.liurenUnverified')}`);

  return lines.join('\n');
}

function courseRow(course: Course, t: Translator): string[] {
  const name = COURSE_NAMES[course.number - 1] as { hanzi: string; pinyin: string };
  return [
    named(name, `label.course.${course.number}` as MessageKey, t),
    glyph(course.upper),
    '/',
    glyph(course.lower),
  ];
}

function transmissionRow(transmission: Transmission, t: Translator): string[] {
  return [
    named(
      TRANSMISSION_NAMES[transmission.position],
      `label.transmission.${transmission.position}` as MessageKey,
      t,
    ),
    glyph(transmission.branch),
    named(
      transmission.general,
      `label.general.${transmission.general.id}` as MessageKey,
      t,
    ),
    // The decade covers ten branches and the board has twelve, so two of them
    // carry no stem. That absence is the 空亡 and is reported as one.
    transmission.hiddenStem ? glyph(transmission.hiddenStem) : t('cli.value.emptyBranch'),
  ];
}

export function formatNianming(nianming: Nianming, t: Translator): string {
  const lines = [`${t('cli.heading.nianming')}`, ...placed(nianming.benming, 'benming', t)];

  if (nianming.xingnian && nianming.years !== undefined) {
    lines.push(
      '',
      ...placed(nianming.xingnian, 'xingnian', t),
      ...table(
        [
          [
            t('cli.field.years'),
            t(`cli.value.${nianming.options.count}` as MessageKey, { count: nianming.years }),
          ],
        ],
        4,
      ).map((line) => `  ${line}`),
    );
  }
  return lines.join('\n');
}

function placed(placement: Placement, which: 'benming' | 'xingnian', t: Translator): string[] {
  const rows: string[][] = [
    [t('cli.field.pair'), ganzhi(placement.ganzhi, t)],
    [t('cli.field.earthSeat'), seat(placement.earth, t)],
    [t('cli.field.heavenSeat'), seat(placement.heaven, t)],
    [
      t('cli.field.mooring'),
      `${placement.mooring.number} ${named(placement.mooring, `label.palace.${placement.mooring.id}` as MessageKey, t)}`,
    ],
    [
      t('cli.field.image'),
      `${glyph(placement.nayin)} · ${named(placement.nayinRelation, `label.relation.${placement.nayinRelation.id}` as MessageKey, t)}`,
    ],
  ];

  return [
    `  ${named(NIANMING_NAMES[which], `label.nianming.${which}` as MessageKey, t)}`,
    ...table(rows, 4).map((line) => `  ${line}`),
    // Said under the rows it explains, because it is about how the pair was
    // looked up and not about where it landed.
    ...(placement.concealed
      ? [
          `      ${t('cli.value.concealedUnder', {
            stem: named(placement.stem, `label.stem.${placement.stem.id}` as MessageKey, t),
          })}`,
        ]
      : []),
  ];
}

function seat(where: Seat, t: Translator): string {
  const here = `${where.palace.number} ${named(where.palace, `label.palace.${where.palace.id}` as MessageKey, t)}`;
  if (!where.host) return here;
  return `${here} · ${t('cli.value.readAt', {
    palace: `${where.host.number} ${named(where.host, `label.palace.${where.host.id}` as MessageKey, t)}`,
  })}`;
}

function palaceOf(chart: QimenChart, number: number, t: Translator): string {
  const cell = chart.palaces.find((candidate) => candidate.palace.number === number);
  if (!cell) return String(number);
  return `${cell.palace.number} ${t(`label.palace.${cell.palace.id}` as MessageKey)}`;
}

/** The Four Pillars, read out: concealed stems, gods, images and stages. */
export function formatBazi(bazi: Bazi, t: Translator): string {
  const lines = [
    `${t('cli.heading.reading')}`,
    ...table(
      [
        [
          t('cli.field.dayMaster'),
          named(bazi.dayMaster, `label.stem.${bazi.dayMaster.id}` as MessageKey, t),
        ],
        [
          t('cli.field.empty'),
          bazi.emptyBranches
            .map((branch) => named(branch, `label.branch.${branch.id}` as MessageKey, t))
            .join(', '),
        ],
      ],
      4,
    ),
    '',
    // The pair alone, without the words for it: the block of pillars above
    // has just said all four in full, and repeating that here bought a
    // column forty wide to hold what the reader had read one line earlier.
    ...table([
      [
        '',
        t('cli.column.pillar'),
        t('cli.column.god'),
        t('cli.column.hidden'),
        t('cli.column.stage'),
      ],
      ...bazi.pillars.map((pillar) => [
        t(`cli.column.${pillar.position}` as MessageKey),
        glyph(pillar.ganzhi),
        pillar.stemGod
          ? named(pillar.stemGod, `label.god.${pillar.stemGod.id}` as MessageKey, t)
          : '—',
        // The phase of each concealed stem, read off its identifier. It used
        // to be read off the *translated* name of the stem by cutting away
        // the first word — which is the polarity in English and the phase in
        // Italian, so the Italian column reported `yin, yin` and never once
        // said what was hidden there.
        pillar.hidden
          .map((hidden) => t(`label.element.${hidden.stem.stem.element}` as MessageKey))
          .join(', '),
        named(pillar.stage, `label.stage.${pillar.stage.id}` as MessageKey, t),
      ]),
    ]),
  ];

  if (bazi.luck) {
    const direction = bazi.luck.forward ? t('cli.value.forward') : t('cli.value.backward');
    lines.push(
      '',
      `${t('cli.heading.luck')} — ${direction}, ${t('cli.value.luckStart', bazi.luck.start)}`,
      ...table(
        bazi.luck.cycles.map((cycle) => [
          String(cycle.startAge).padStart(3),
          sayGanzhi(cycle.ganzhi, t),
          glyph(cycle.ganzhi),
        ]),
      ),
    );
  }

  return lines.join('\n');
}

/** The twenty-four terms of a year, as read at a place. */
export function formatSolarTerms(
  terms: SolarTerm[],
  year: number,
  timezone: string,
  t: Translator,
): string {
  return [
    t('cli.heading.terms', { year }),
    ...table(
      terms.map((entry) => [
        t(`label.term.${entry.term.id}` as MessageKey),
        timeOf(entry.julianDayUT, timezone),
        glyph(entry.term),
      ]),
    ),
  ].join('\n');
}

/** Whatever the calculation wants the caller to know, translated. */
export function formatWarnings(moment: Moment, t: Translator): string {
  if (moment.warnings.length === 0) return '';
  const lines = [t('cli.heading.warnings')];
  for (const warning of moment.warnings) {
    lines.push(`  ${t(`core.warning.${warning.code}` as MessageKey, warning.params)}`);
  }
  return lines.join('\n');
}

/**
 * A scan, read out: when each chart holds and which palaces answered.
 *
 * The palace leads the line and not the hour, because the answer to *when* is
 * half an answer. A chart is consulted for a direction as much as for a time,
 * and a reader handed times alone has been given the part of this tradition
 * that every other art already has.
 */
export function formatScan(matches: readonly ScanMatch[], t: Translator): string {
  if (matches.length === 0) return `  ${t('cli.value.nothingAnswered')}`;

  // Already local clock time at the place, and already ISO: the date and the
  // hour are read off it rather than converted through a zone a second time.
  // Split at the `T`, never at a fixed offset — an ISO year runs to six
  // digits and a sign either side of our era, and a slice measured against
  // four would show such a date with its clock cut mid-year.
  const clock = (iso: string): string => {
    const at = iso.indexOf('T');
    return `${iso.slice(0, at)} ${iso.slice(at + 1, at + 6)}`;
  };

  const rows: string[][] = [
    [
      t('cli.column.from'),
      t('cli.column.to'),
      t('cli.column.hour'),
      t('cli.column.ju'),
      t('cli.column.palace'),
      t('cli.column.gate'),
      t('cli.column.star'),
      t('cli.column.spirit'),
    ],
  ];

  for (const { run, palaces } of matches) {
    const dun = run.chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun');
    const strong = (state: { id: string } | undefined): string =>
      state ? ` ${t(`label.strength.${state.id}` as MessageKey)}` : '';

    for (const [index, cell] of palaces.entries()) {
      // The hour is written once for the run and left blank under itself:
      // repeating it down the column turns three palaces of one hour into
      // what reads as three hours.
      const first = index === 0;
      rows.push([
        first ? clock(run.start) : '',
        first ? clock(run.end) : '',
        // The pillar in words and then as the pair it is, as every other table
        // here sets it: 甲寅 alone is a line most readers of this skip.
        first ? ganzhi(run.chart.moment.pillars.hour, t) : '',
        first ? `${dun} ${run.chart.ju.number}` : '',
        `${cell.palace.number} ${named(cell.palace, `label.palace.${cell.palace.id}` as MessageKey, t)}`,
        // Gloss and strength, without the glyph and the reading the chart's
        // own tables now carry. Not an oversight and not the rule bending:
        // this row already holds four named things behind four that identify
        // the run, and naming all four in full takes it past two hundred
        // columns. Closing it wants the two-level layout the chart got, which
        // is a change to how a scan reads and not to what it says.
        cell.gate
          ? `${t(`label.gate.${cell.gate.id}` as MessageKey)}${strong(cell.gateStrength)}`
          : '—',
        `${t(`label.star.${cell.star.id}` as MessageKey)}${strong(cell.starStrength)}`,
        cell.spirit ? t(`label.spirit.${cell.spirit.id}` as MessageKey) : '—',
      ]);
    }
  }

  return table(rows).join('\n');
}
