<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  /**
   * The answer to *when*, and to *which way*.
   *
   * Takes the rows, not the scan: the same table serves an interval, a day,
   * or whatever a run is compared against next.
   *
   * The direction is a column and not a footnote. An interval does not hold a
   * good hour, it holds an hour in which something stands to the southeast,
   * and a table of times alone would have thrown away the half of this
   * tradition that no other art has.
   */
  let {
    moments,
    t,
    href,
    picked = '',
    onpick,
  }: {
    moments: readonly any[];
    t: Translator;
    /** Where the whole board for a row lives. */
    href: (start: string) => string;
    /** The row whose board is on screen, by its `start`. */
    picked?: string;
    /**
     * Choosing a row without leaving the page.
     *
     * The cell stays a link whatever this does with it. `href` is the whole
     * section and remains what a middle click, a new tab, a saved bookmark
     * and a page without scripts all get; only a plain click is taken over.
     * A button here would have thrown those away to gain nothing.
     */
    onpick?: (start: string) => void;
  } = $props();

  const gloss = (prefix: string, id: string): string => t(`label.${prefix}.${id}` as MessageKey);

  /** `2026-09-01 08:41` — local at the place already, so it is only trimmed. */
  const clock = (iso: string): string => `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
  const hour = (iso: string): string => iso.slice(11, 16);

  /** The date is written once a day: a column repeating it reads as noise. */
  function opensADay(index: number): boolean {
    return index === 0 || moments[index - 1].start.slice(0, 10) !== moments[index].start.slice(0, 10);
  }

  /**
   * A plain click stays on the page; every other kind means somewhere else.
   *
   * A modifier, or any button but the first, is how a person says "open this
   * apart from what I am reading". Preventing those would be taking away the
   * one thing they asked for.
   */
  function choose(event: MouseEvent, start: string): void {
    if (!onpick) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onpick(start);
  }
</script>

<table>
  <thead>
    <tr>
      <th>{t('cli.column.from')}</th>
      <th>{t('cli.column.to')}</th>
      <th>{t('cli.column.hour')}</th>
      <th>{t('cli.column.palace')}</th>
      <th>{t('cli.column.gate')}</th>
      <th>{t('cli.column.star')}</th>
      <th>{t('cli.column.spirit')}</th>
      <th><span class="hidden">{t('form.showPlate')}</span></th>
    </tr>
  </thead>
  <tbody>
    {#each moments as moment, index (moment.start)}
      {#each moment.palaces as cell, palace (cell.palace.number)}
        <tr class:day={palace === 0 && opensADay(index)} class:picked={moment.start === picked}>
          {#if palace === 0}
            <th scope="row" rowspan={moment.palaces.length}>
              {opensADay(index) ? clock(moment.start) : hour(moment.start)}
            </th>
            <td rowspan={moment.palaces.length}>{hour(moment.end)}</td>
            <!-- The whole pillar in words: the name below is 壬子, and a word
                 that said only "Rat" would say less than the name it glosses. -->
            <td rowspan={moment.palaces.length}>
              <span>{gloss('stem', moment.hour.stem.id)} · {gloss('branch', moment.hour.branch.id)}</span>
              <span class="glyph">{moment.hour.hanzi}</span>
            </td>
          {/if}
          <td>
            <span>{cell.palace.number} {gloss('palace', cell.palace.id)}</span>
            <span class="glyph">{cell.palace.hanzi}</span>
          </td>
          <td>
            {#if cell.gate}
              <span>{gloss('gate', cell.gate.id)}</span>
              <span class="glyph">{cell.gate.hanzi}{#if cell.gateStrength}&nbsp;· {gloss('strength', cell.gateStrength.id)}{/if}</span>
            {:else}<span class="gloss">—</span>{/if}
          </td>
          <td>
            <span>{gloss('star', cell.star.id)}</span>
            <span class="glyph">{cell.star.hanzi} · {gloss('strength', cell.starStrength.id)}</span>
          </td>
          <td>
            {#if cell.spirit}
              <span>{gloss('spirit', cell.spirit.id)}</span>
              <span class="glyph">{cell.spirit.hanzi}</span>
            {:else}<span class="gloss">—</span>{/if}
          </td>
          {#if palace === 0}
            <td rowspan={moment.palaces.length}>
              <a
                href={href(moment.start)}
                aria-current={moment.start === picked ? 'true' : undefined}
                onclick={(event) => choose(event, moment.start)}
              >
                {t(onpick ? 'form.showPlate' : 'form.openChart')}
              </a>
            </td>
          {/if}
        </tr>
      {/each}
    {/each}
  </tbody>
</table>

<style>
  /*
   * As wide as it needs, never narrower.
   *
   * Squeezed into a phone the columns did fit, by breaking "Legno yin · Capra"
   * over three lines apiece and turning eight rows into a page of confetti.
   * Inside a scrolling frame the table keeps the width its content asks for
   * and the reader moves along it; where there is room, it fills it.
   */
  table { width: 100%; min-width: max-content; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid var(--rule); vertical-align: baseline; }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  tbody th { font-weight: 400; white-space: nowrap; }
  /* A heavier rule where the day turns, so a week can be read down. */
  .day th, .day td { border-top: 1px solid var(--rule); }
  /* The hour whose board is open, marked in the list it was chosen from.
     Tinted and ruled at the edge both: a tint alone is a colour, and a
     colour alone is not a message — hence `aria-current` on the link too. */
  .picked th, .picked td { background: var(--tint); }
  .picked th:first-child { box-shadow: inset 2px 0 0 var(--ink); }
  th span:first-child, td span:first-child { display: block; }
  .glyph { display: block; color: var(--faint); font-size: 0.8em; }
  .gloss { display: block; color: var(--faint); font-size: 0.8em; }
  a { color: var(--faint); font-size: 0.85em; }
  /*
   * The column that has a heading only for whoever cannot see it has one.
   *
   * Clipped where it stands, and deliberately not taken out of the flow:
   * `position: absolute` with nothing positioned above it resolves against
   * the page itself, so this landed at the far right of a table that is
   * wider than a phone — and dragged the whole document sideways with it,
   * past the frame whose scrolling was supposed to contain the table. In
   * flow it costs one pixel inside a cell already as wide as the link below
   * it, and the page stays where it is.
   */
  .hidden { display: block; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style>
