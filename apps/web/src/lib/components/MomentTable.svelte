<script lang="ts">
  import { glyph } from '$lib/glyph';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import { isPlainClick } from '$lib/navigation';

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
    keeping,
    onkeep,
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
     * The cell stays a link whatever this does with it — see `isPlainClick`.
     */
    onpick?: (start: string) => void;
    /**
     * Whether a palace of an hour is already among the ones set aside.
     *
     * A palace and not an hour, because that is what was chosen: the same
     * double hour can hold an answer to the southeast worth keeping and one
     * in the centre worth nothing.
     */
    keeping?: (start: string, palace: string) => boolean;
    /** Setting one aside, or taking it back. The column exists only with it. */
    onkeep?: (start: string, palace: string) => void;
  } = $props();

  const gloss = (prefix: string, id: string): string => t(`label.${prefix}.${id}` as MessageKey);

  /** Local at the place already, so it is only trimmed. */
  const hour = (iso: string): string => iso.slice(11, 16);

  /**
   * The hours, gathered under the day they fall on.
   *
   * The date used to be written into the first cell of the first hour of each
   * day and left out of the rest, which is right for a table read in one
   * glance and wrong for one scrolled: twenty rows down, the date that
   * qualifies them is off the top of the screen and the hours mean nothing.
   * A rowgroup per day gives it somewhere to stand — see the styles.
   *
   * Grouped by the *civil* date, and the heading names no day pillar for it.
   * Under the default day boundary the pillar turns at 23:00, so an hour of
   * 子時 at the foot of one civil day already belongs to the next day's
   * ganzhi: one name over the group would be wrong for the last row of most
   * of them. The pillar is a column of the chart, and the chart is a click
   * away.
   */
  const days = $derived(
    moments.reduce<{ date: string; moments: any[] }[]>((groups, moment) => {
      const date = moment.start.slice(0, 10);
      const last = groups.at(-1);
      if (last && last.date === date) last.moments.push(moment);
      else groups.push({ date, moments: [moment] });
      return groups;
    }, []),
  );

  /**
   * The day in the reader's language, weekday and all.
   *
   * This is the surface, which is where readable text is made; and a person
   * choosing a time for something wants to know it falls on a Sunday before
   * they want anything else about it. Read as UTC and formatted as UTC: the
   * string is a calendar date and has no instant in it to be shifted.
   */
  const dayFormat = $derived(
    new Intl.DateTimeFormat(t.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  );
  const dayName = (date: string): string => dayFormat.format(new Date(`${date}T00:00:00Z`));

  /**
   * Whether a row is the one whose board is open.
   *
   * On the minute, and not on the string: what the page holds is how this
   * section names an instant everywhere — `2026-09-01T04:10` — while a run's
   * own `start` carries the seconds the bisection found it at.
   */
  const isPicked = (start: string): boolean =>
    picked !== '' && start.slice(0, 16) === picked.slice(0, 16);

  /** A plain click stays on the page; every other kind means somewhere else. */
  function choose(event: MouseEvent, start: string): void {
    if (!onpick || !isPlainClick(event)) return;
    event.preventDefault();
    onpick(start);
  }

  /** How wide a day's heading has to reach. */
  const COLUMNS = $derived(onkeep ? 9 : 8);

  /**
   * The height of the column names, measured rather than declared.
   *
   * Two rows stick to the top of the frame and the second has to stand
   * exactly on the first. That offset is one line of text at 0.85em in
   * whichever language, plus padding and a rule — a rendered fact, not a
   * constant: a value written here would leave either a hairline of rows
   * showing between the two bars or a heading half hidden under them.
   * `ResizeObserver` and not one measurement, because the frame is resized,
   * the phone is turned, and the browser's own font size is a setting.
   *
   * The fallback in the stylesheet is what a page with no scripts uses, where
   * nothing measures anything and the two bars are all there is to get wrong.
   */
  let head: HTMLTableSectionElement | undefined = $state();
  let headHeight = $state(0);

  $effect(() => {
    if (!head) return;
    const observer = new ResizeObserver(() => {
      headHeight = head?.getBoundingClientRect().height ?? 0;
    });
    observer.observe(head);
    return () => observer.disconnect();
  });
</script>

<table style:--head={headHeight ? `${headHeight}px` : null}>
  <thead bind:this={head}>
    <tr>
      <th>{t('cli.column.from')}</th>
      <th>{t('cli.column.to')}</th>
      <th>{t('cli.column.hour')}</th>
      <th>{t('cli.column.palace')}</th>
      <th>{t('cli.column.gate')}</th>
      <th>{t('cli.column.star')}</th>
      <th>{t('cli.column.spirit')}</th>
      {#if onkeep}<th>{t('form.keep')}</th>{/if}
      <th><span class="hidden">{t('form.showPlate')}</span></th>
    </tr>
  </thead>
  {#each days as day (day.date)}
    <tbody>
      <tr class="day">
        <th colspan={COLUMNS} scope="rowgroup"><span>{dayName(day.date)}</span></th>
      </tr>
      {#each day.moments as moment (moment.start)}
        {#each moment.palaces as cell, palace (cell.palace.number)}
          <tr class:picked={isPicked(moment.start)}>
            {#if palace === 0}
              <th scope="row" rowspan={moment.palaces.length}>{hour(moment.start)}</th>
              <td rowspan={moment.palaces.length}>{hour(moment.end)}</td>
              <!-- The whole pillar in words: the name below is 壬子, and a word
                   that said only "Rat" would say less than the name it glosses. -->
              <td rowspan={moment.palaces.length}>
                <span>{gloss('stem', moment.hour.stem.id)} · {gloss('branch', moment.hour.branch.id)}</span>
                <span class="glyph">{glyph(moment.hour)}</span>
              </td>
            {/if}
            <td>
              <span>{cell.palace.number} {gloss('palace', cell.palace.id)}</span>
              <span class="glyph">{glyph(cell.palace)}</span>
            </td>
            <td>
              {#if cell.gate}
                <span>{gloss('gate', cell.gate.id)}</span>
                <span class="glyph">{glyph(cell.gate)}{#if cell.gateStrength}&nbsp;· {gloss('strength', cell.gateStrength.id)}{/if}</span>
              {:else}<span class="gloss">—</span>{/if}
            </td>
            <td>
              <span>{gloss('star', cell.star.id)}</span>
              <span class="glyph">{glyph(cell.star)} · {gloss('strength', cell.starStrength.id)}</span>
            </td>
            <td>
              {#if cell.spirit}
                <span>{gloss('spirit', cell.spirit.id)}</span>
                <span class="glyph">{glyph(cell.spirit)}</span>
              {:else}<span class="gloss">—</span>{/if}
            </td>
            <!-- A checkbox, because choosing some rows out of a table is what
                 a checkbox is: a toggling button would have said the same
                 thing in a control nobody has been taught to read that way.
                 The column is headed with a word, and each box names the hour
                 and the palace it stands for — the row is not its label. -->
            {#if onkeep}
              <td class="keep">
                <input
                  type="checkbox"
                  aria-label={t('form.keepMoment', {
                    hour: hour(moment.start),
                    palace: gloss('palace', cell.palace.id),
                  })}
                  checked={keeping?.(moment.start, cell.palace.id) ?? false}
                  onchange={() => onkeep?.(moment.start, cell.palace.id)}
                />
              </td>
            {/if}
            {#if palace === 0}
              <td rowspan={moment.palaces.length}>
                <a
                  href={href(moment.start)}
                  aria-current={isPicked(moment.start) ? 'true' : undefined}
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
  {/each}
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
  th span:first-child, td span:first-child { display: block; }
  .glyph { display: block; color: var(--faint); font-size: 0.8em; }
  .gloss { display: block; color: var(--faint); font-size: 0.8em; }
  a { color: var(--faint); font-size: 0.85em; }
  /* The box is the whole cell's worth: the page's fields carry a padding that
     is right for something typed into and turns a checkbox into a lozenge. */
  .keep input { padding: 0; margin: 0; }

  /*
   * Three things stay where they are while the rest scrolls under them.
   *
   * The column names, because eight columns of glossed names are told apart
   * by their heading and by nothing else — a star and a spirit both read as a
   * word and a glyph. The day, because it is what the hours are hours *of*.
   * And the hour itself, because the table is wider than a phone and the
   * reader who scrolls right to reach the spirit had lost which row they were
   * on by the time they got there.
   *
   * Every one of them needs a background of its own: a transparent cell that
   * stays put shows whatever passes underneath it. And a background is not
   * enough — with `border-collapse` the rules belong to the table rather than
   * to the cells, so a stuck row leaves its border behind and floats. The two
   * bars draw their own with an inset shadow instead.
   *
   * All of it depends on the frame around the table owning the scrolling in
   * both directions, which is why it is given a height. Sticky sticks to the
   * nearest scroll container, and `overflow-x: auto` makes one on *both*
   * axes: inside a frame that only ever scrolled sideways, nothing here would
   * ever have stuck to anything.
   */
  thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    background: var(--ground);
    border-bottom: 0;
    box-shadow: inset 0 -1px 0 var(--rule);
  }
  thead th:first-child { left: 0; z-index: 4; }

  .day th {
    position: sticky;
    top: var(--head, 2.1rem);
    z-index: 2;
    background: var(--ground);
    border-bottom: 0;
    box-shadow: inset 0 1px 0 var(--rule), inset 0 -1px 0 var(--rule);
    font-size: 0.9em;
    padding-top: 0.6rem;
    padding-bottom: 0.4rem;
  }
  /* The heading spans the table, so it would be off the left edge as soon as
     the reader moved sideways. The cell keeps its width; the words in it
     stay in view. */
  .day th span { display: inline-block; position: sticky; left: 0.5rem; }

  tbody th {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--ground);
  }

  /* The hour whose board is open, marked in the list it was chosen from.
     Tinted and ruled at the edge both: a tint alone is a colour, and a
     colour alone is not a message — hence `aria-current` on the link too. */
  .picked th, .picked td { background: var(--tint); }
  .picked th:first-child { box-shadow: inset 2px 0 0 var(--ink); }

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
