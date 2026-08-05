import type { MessageKey, Translator } from '@qimendunjia/i18n';
import type { Bazi } from './bazi/index.js';
import type { QimenChart } from './dunjia/index.js';
import type { Ganzhi } from './ganzhi.js';
import type { LunarDate } from './lunar.js';
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
 * Nothing here interprets. The engine reports arrangements, and these
 * functions report them more legibly.
 */

/**
 * `Rest 休門` — the word first, the name after it.
 *
 * The hanzi *is* the name, and it stays: without it nothing here can be
 * checked against a book or a second implementation. But it goes second and
 * small, because most people reading this cannot read it, and a line they
 * cannot read is a line they skip.
 */
function named(hanzi: string, key: MessageKey, t: Translator): string {
  return `${t(key)} ${hanzi}`;
}

function pad(value: string, width: number): string {
  // Hanzi occupy two columns in a terminal; Latin letters one. Counting code
  // points would misalign every table on the page.
  let printed = 0;
  for (const character of value) printed += /[⺀-鿿＀-｠]/.test(character) ? 2 : 1;
  return value + ' '.repeat(Math.max(0, width - printed));
}

function ganzhi(pair: Ganzhi, t: Translator): string {
  return `${sayGanzhi(pair, t)}  ${pair.hanzi}`;
}

function timeOf(julianDayUT: number, timezone: string): string {
  return fromJulianDay(julianDayUT, timezone).toFormat('yyyy-MM-dd HH:mm');
}

function term(solarTerm: SolarTerm, timezone: string, t: Translator): string {
  const gloss = named(solarTerm.term.hanzi, `label.term.${solarTerm.term.id}` as MessageKey, t);
  return `${gloss} — ${timeOf(solarTerm.julianDayUT, timezone)}`;
}

function lunar(date: LunarDate, t: Translator): string {
  const leap = date.leap ? `${t('cli.value.leapMonth')} ` : '';
  return `${date.year} · ${leap}${date.month}/${date.day}`;
}

/** The instant, its pillars, and the calendrical facts they rest on. */
export function formatMoment(moment: Moment, t: Translator): string {
  const zone = moment.input.timezone;
  const lines = [
    `${t('cli.heading.moment')}`,
    `  ${pad(t('cli.field.local'), 20)}${moment.local}`,
    `  ${pad(t('cli.field.utc'), 20)}${moment.utc}`,
  ];

  if (moment.options.trueSolarTime) {
    const hours = Math.floor(moment.solar.hour);
    const minutes = Math.round((moment.solar.hour - hours) * 60);
    lines.push(
      `  ${pad(t('cli.field.solar'), 20)}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` +
        `  (${t('cli.field.correction')} ${t('cli.value.minutes', { value: moment.solar.correctionMinutes.toFixed(1) })})`,
    );
  }

  lines.push(
    `  ${pad(t('cli.field.term'), 20)}${term(moment.solarTerm, zone, t)}`,
    `  ${pad(t('cli.field.jie'), 20)}${term(moment.jie, zone, t)}`,
    `  ${pad(t('cli.field.lunar'), 20)}${lunar(moment.lunar, t)}`,
    '',
    `${t('cli.heading.pillars')}`,
    `  ${pad(t('cli.column.year'), 26)}${pad(t('cli.column.month'), 26)}${pad(t('cli.column.day'), 26)}${t('cli.column.hour')}`,
    `  ${pad(ganzhi(moment.pillars.year, t), 26)}${pad(ganzhi(moment.pillars.month, t), 26)}${pad(ganzhi(moment.pillars.day, t), 26)}${ganzhi(moment.pillars.hour, t)}`,
  );

  return lines.join('\n');
}

/** The Qi Men chart: the ju, the chief, and the nine palaces. */
export function formatQimenChart(chart: QimenChart, t: Translator): string {
  const dun = chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun');
  const yuan = named(
    chart.ju.yuan === 'shang' ? '上元' : chart.ju.yuan === 'zhong' ? '中元' : '下元',
    `label.yuan.${chart.ju.yuan}` as MessageKey,
    t,
  );

  const lines = [
    `${t('cli.heading.chart')}`,
    `  ${pad(t('cli.field.ju'), 20)}${dun} ${chart.ju.number} · ${yuan}`,
    `  ${pad(t('cli.field.instrument'), 20)}${t(`label.stem.${chart.instrument.id}` as MessageKey)} ${chart.instrument.hanzi}`,
    `  ${pad(t('cli.field.chief'), 20)}${named(chart.chief.star.hanzi, `label.star.${chart.chief.star.id}` as MessageKey, t)} → ${named(chart.chief.palace.hanzi, `label.palace.${chart.chief.palace.id}` as MessageKey, t)}`,
    `  ${pad(t('cli.field.chiefGate'), 20)}${named(chart.chiefGate.gate.hanzi, `label.gate.${chart.chiefGate.gate.id}` as MessageKey, t)} → ${named(chart.chiefGate.palace.hanzi, `label.palace.${chart.chiefGate.palace.id}` as MessageKey, t)}`,
    '',
    `${t('cli.heading.palaces')}`,
    `  ${pad(t('cli.column.palace'), 18)}${pad(t('cli.column.earth'), 16)}${pad(t('cli.column.heaven'), 16)}${pad(t('cli.column.star'), 20)}${pad(t('cli.column.gate'), 20)}${t('cli.column.spirit')}`,
  ];

  for (const cell of chart.palaces) {
    const stem = (named_: { id: string; hanzi: string }): string =>
      `${t(`label.stem.${named_.id}` as MessageKey)} ${named_.hanzi}`;
    const strong = (state: { id: string } | undefined): string =>
      state ? ` ${t(`label.strength.${state.id}` as MessageKey)}` : '';

    lines.push(
      `  ${pad(`${cell.palace.number} ${t(`label.palace.${cell.palace.id}` as MessageKey)} ${cell.palace.hanzi}`, 18)}` +
        `${pad(stem(cell.earth), 16)}${pad(stem(cell.heaven), 16)}` +
        `${pad(`${t(`label.star.${cell.star.id}` as MessageKey)}${strong(cell.starStrength)}`, 20)}` +
        `${pad(cell.gate ? `${t(`label.gate.${cell.gate.id}` as MessageKey)}${strong(cell.gateStrength)}` : '—', 20)}` +
        `${cell.spirit ? t(`label.spirit.${cell.spirit.id}` as MessageKey) : '—'}`,
    );
  }

  if (chart.patterns.length > 0) {
    lines.push('', `${t('cli.heading.patterns')}`);
    for (const pattern of chart.patterns) {
      const where = pattern.palace
        ? ` — ${palaceOf(chart, pattern.palace, t)}`
        : pattern.layer
          ? ` — ${t(`label.layer.${pattern.layer}` as MessageKey)}`
          : '';
      lines.push(
        `  ${pad(t(`label.pattern.${pattern.id}` as MessageKey), 30)}${pattern.hanzi}${where}`,
      );
    }
  }

  lines.push(
    '',
    `  ${t('cli.column.season')} ${t(`label.element.${chart.season}` as MessageKey)}`,
    `  ${t('cli.note.methodOnly')}`,
  );
  return lines.join('\n');
}

/** `4 巽 southeast`, for naming where a configuration fell. */
function palaceOf(chart: QimenChart, number: number, t: Translator): string {
  const cell = chart.palaces.find((candidate) => candidate.palace.number === number);
  if (!cell) return String(number);
  return `${cell.palace.number} ${t(`label.palace.${cell.palace.id}` as MessageKey)}`;
}

/** The Four Pillars, read out: concealed stems, gods, images and stages. */
export function formatBazi(bazi: Bazi, t: Translator): string {
  const lines = [
    `${t('cli.heading.reading')}`,
    `  ${pad(t('cli.field.dayMaster'), 20)}${t(`label.stem.${bazi.dayMaster.id}` as MessageKey)}  ${bazi.dayMaster.hanzi}`,
    `  ${pad(t('cli.field.empty'), 20)}${bazi.emptyBranches.map((b) => t(`label.branch.${b.id}` as MessageKey)).join(', ')}`,
    '',
    `  ${pad('', 8)}${pad(t('cli.column.year'), 26)}${pad(t('cli.column.god'), 22)}${pad(t('cli.column.hidden'), 14)}${t('cli.column.stage')}`,
  ];

  for (const pillar of bazi.pillars) {
    const god = pillar.stemGod ? t(`label.god.${pillar.stemGod.id}` as MessageKey) : '—';
    lines.push(
      `  ${pad(t(`cli.column.${pillar.position}` as MessageKey), 8)}` +
        `${pad(`${sayGanzhi(pillar.ganzhi, t)}  ${pillar.ganzhi.hanzi}`, 26)}` +
        `${pad(god, 22)}` +
        `${pad(pillar.hidden.map((h) => t(`label.stem.${h.stem.stem.id}` as MessageKey).replace(/^\S+ /, '')).join(', '), 14)}` +
        `${t(`label.stage.${pillar.stage.id}` as MessageKey)}`,
    );
  }

  if (bazi.luck) {
    const direction = bazi.luck.forward ? t('cli.value.forward') : t('cli.value.backward');
    lines.push(
      '',
      `${t('cli.heading.luck')} — ${direction}, ${bazi.luck.start.years}y ${bazi.luck.start.months}m ${bazi.luck.start.days}d`,
      ...bazi.luck.cycles.map(
        (cycle) => `  ${String(cycle.startAge).padStart(3)}  ${sayGanzhi(cycle.ganzhi, t)}  ${cycle.ganzhi.hanzi}`,
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
  const lines = [t('cli.heading.terms', { year })];
  for (const entry of terms) {
    lines.push(
      `  ${pad(t(`label.term.${entry.term.id}` as MessageKey), 26)}` +
        `${pad(timeOf(entry.julianDayUT, timezone), 18)}${entry.term.hanzi}`,
    );
  }
  return lines.join('\n');
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
  const clock = (iso: string): string => `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;

  const lines = [
    `  ${pad(t('cli.column.from'), 18)}${pad(t('cli.column.to'), 18)}${pad(t('cli.column.hour'), 30)}` +
      `${pad(t('cli.column.ju'), 12)}${pad(t('cli.column.palace'), 22)}${pad(t('cli.column.gate'), 24)}` +
      `${pad(t('cli.column.star'), 26)}${t('cli.column.spirit')}`,
  ];

  for (const { run, palaces } of matches) {
    const dun = run.chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun');
    const strong = (state: { id: string } | undefined): string =>
      state ? ` ${t(`label.strength.${state.id}` as MessageKey)}` : '';

    for (const [index, cell] of palaces.entries()) {
      // The hour is written once for the run and left blank under itself:
      // repeating it down the column turns three palaces of one hour into
      // what reads as three hours.
      const opens = index === 0 ? clock(run.start) : '';
      const closes = index === 0 ? clock(run.end) : '';
      // The pillar in words and then as the pair it is, as every other table
      // here sets it: 甲寅 alone is a line most readers of this skip.
      const hour = index === 0 ? ganzhi(run.chart.moment.pillars.hour, t) : '';
      const ju = index === 0 ? `${dun} ${run.chart.ju.number}` : '';

      lines.push(
        `  ${pad(opens, 18)}${pad(closes, 18)}${pad(hour, 30)}${pad(ju, 12)}` +
          `${pad(`${cell.palace.number} ${t(`label.palace.${cell.palace.id}` as MessageKey)} ${cell.palace.hanzi}`, 22)}` +
          `${pad(cell.gate ? `${t(`label.gate.${cell.gate.id}` as MessageKey)}${strong(cell.gateStrength)}` : '—', 24)}` +
          `${pad(`${t(`label.star.${cell.star.id}` as MessageKey)}${strong(cell.starStrength)}`, 26)}` +
          `${cell.spirit ? t(`label.spirit.${cell.spirit.id}` as MessageKey) : '—'}`,
      );
    }
  }

  return lines.join('\n');
}
