<!--
  A chart said in full: the ju, the nine palaces, the configurations.

  Everything the two places that show a chart have in common, which since the
  board came to the scan is everything either of them shows. It exists because
  they were about to hold two copies of it — and the copy that drifts is never
  the one being looked at.

  What it deliberately does *not* hold is the drawing. The picture is sized by
  the room its container has, and those two rooms are not alike: a page gives
  it the measure of the reading, a dialog gives it whichever of the window's
  two dimensions runs out first. So each caller draws its own board and hands
  this the words that go under it.
-->
<script lang="ts">
  import { glyph } from '$lib/glyph';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import PalaceTable from './PalaceTable.svelte';
  import PillarPlate from './PillarPlate.svelte';

  /**
   * The chart as data, not as a type.
   *
   * The client imports only types from `core`, and a value import would drag
   * the ephemerides and a native module into the browser bundle. What arrives
   * here has crossed HTTP as JSON in any case.
   */
  /**
   * `palaces` is whether the nine palaces are part of this, or the caller's.
   *
   * Six columns of two lines is the widest thing a chart has to show, and it
   * does not fit in a column beside a drawing — it scrolls sideways there
   * before it has shown one palace whole, which is a table nobody can read.
   * A caller laying the reading out in two columns takes the table off this
   * and puts it under both, at the width it needs. It is still one component's
   * worth of markup: `PalaceTable` was always its own, and what this exists to
   * keep in one place is the ju, the horses and the configurations.
   */
  /**
   * `wide` is whether this reading stands under a board of the page's width.
   *
   * It does in the two sections that give the drawing a page to itself, and
   * there the ju and the four pillars are the caption to that drawing: they
   * take its measure and centre on it, the way the drawing's own caption sits
   * centred above the grid. It does not in the scan's dialog, where the words
   * are a column beside the board and a heading centred in a column is a
   * heading that has lost its left edge.
   */
  let {
    chart,
    t,
    palaces = true,
    wide = false,
  }: { chart: any; t: Translator; palaces?: boolean; wide?: boolean } = $props();

  /** Largest to smallest, as every almanac and the drawing's caption have it. */
  const PILLARS = ['year', 'month', 'day', 'hour'] as const;

  /**
   * The chart's own four pairs, in the shape the squares are drawn from.
   *
   * A god and a stage are not among them and that is the whole of the
   * mapping: the engine hands a Qi Men chart four `Ganzhi`, and what the
   * other method reads off them stays in the other method's section.
   */
  const squares = $derived(
    PILLARS.map((position) => ({ position, ganzhi: chart.moment.pillars[position] })),
  );
</script>

<!--
  The ju and the four pillars, as one block with a measure of its own.

  What the chart was cast from, and under a board it is the board's caption:
  the drawing sets its own caption centred over the grid, and these two do the
  same under it. Which is what the box is for — the ju is centred on the
  pillars because the two are one thing, not because a line of text was
  centred on a page.
-->
<div class="cast" class:wide>
<p class="ju">
  {chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')}
  {chart.ju.number} · {t(`label.yuan.${chart.ju.yuan}` as MessageKey)}
  <!-- Under zhirun the ju's term deserves saying: it can be one the Sun has
       not reached yet, or a repeated one — the intercalation. -->
  {#if chart.options.method === 'zhirun'}
    · <span class="glyph">{chart.ju.leap ? '閏' : ''}{chart.ju.term.hanzi} {chart.ju.leap ? 'rùn' : ''}{chart.ju.term.pinyin ?? ''}</span>
    {chart.ju.leap
      ? t('cli.value.leapTerm', { term: t(`label.term.${chart.ju.term.id}` as MessageKey) })
      : t(`label.term.${chart.ju.term.id}` as MessageKey)}
  {/if}
</p>

<!--
  The four pillars of the instant.

  Not an addition to the chart: they are what it was cast from. The ju is
  counted from the term and the hour, the chief and the gate from the day,
  both post horses from a branch below — so a board read without them is a
  board whose every number has to be taken on trust. The drawing has carried
  them in its caption since it had one; the page had them only in the picture,
  which is `alt=""`, uncopyable, and unreadable to a screen reader.

  Drawn and not listed, everywhere the board is. Four tinted cells are taken
  in at a glance where a line of four pairs has to be read, and it is the form
  every calculator that shows this board shows them in — which is where the
  reader has met them. The plate asks the room it was given how many columns
  it can have, so the same four fit the page under a board and the column of
  the scan's dialog beside one.

  The pair and nothing beside it. What a pillar conceals, which god it is and
  where it stands in the twelve stages are the Four Pillars' questions, and
  they are answered in that section — putting them here would let a reader
  take a whole second method for part of the chart. The link under the board
  leads there, with this same instant in its address.
-->
<PillarPlate pillars={squares} {t} {wide} />

<!--
  The almanac's line for the day, under the pillars it belongs beside.

  A line and never a panel: the 曆注 are not part of this board and are not
  being asked anything — they are the page dunjia was always read against, and
  a reader comparing the two is doing what the tradition did. Its ganzhi is
  printed because the page's day need not be the chart's: it turns on 120°E
  and on the date, where the pillars turn on the zone and the hour.
-->
{#if chart.moment.almanac}
  {@const page = chart.moment.almanac}
  <p class="almanac">
    <span class="glyph">{page.officer.hanzi} {page.officer.pinyin}</span>
    {t(`label.officer.${page.officer.id}` as MessageKey)}
    · <span class="glyph">{page.day.hanzi}</span>
    {#if page.doubled}
      <span class="doubled">({t('cli.value.jianchuDoubled')})</span>
    {/if}
      · <span class="glyph">{page.lodge.hanzi}{page.lodge.planet.hanzi} {page.lodge.pinyin}</span>
      {t(`label.lodge.${page.lodge.id}` as MessageKey)}
      · <span class="glyph">{page.god.hanzi} {page.god.pinyin}</span>
      {t(`label.daygod.${page.god.id}` as MessageKey)}
      <span class="glyph">{page.god.valence.hanzi}</span>
    {#if page.monthGods}
    <span class="gods">
      {t('cli.field.monthGods')}:
      {#each page.monthGods as god}
        <span class="glyph" class:onday={god.onDay}>{god.hanzi}</span>&nbsp;{god.seat
          ? god.seat.kind === 'stem'
            ? t(`label.stem.${god.seat.stem.id}` as MessageKey)
            : t(`label.palace.${god.seat.trigram.id}` as MessageKey)
          : '—'}{' '}
      {/each}
    </span>
    {/if}
    <!-- Only the 神煞 the day carries. The list is mostly absences — 天赦 falls
         a few times a year — and printing every «no» would bury the one «yes».
         What each is *for* is 宜忌 and is not here. -->
    {#if page.shensha?.some((g: any) => g.onDay)}
      <span class="gods">
        {t('cli.field.shensha')}:
        {#each page.shensha.filter((g: any) => g.onDay) as god}
          <span class="glyph">{god.hanzi}</span>&nbsp;{t(
            `label.shensha.${god.id}` as MessageKey,
          )}&nbsp;<span class="glyph">{god.valence.hanzi}</span>{' '}
        {/each}
      </span>
    {/if}
    <span class="gods">
      {page.year.hanzi} —
      {#each page.yearGods as god}
        <span class="glyph">{god.hanzi}</span>&nbsp;{god.seat.kind === 'branch'
          ? t(`label.branch.${god.seat.branch.id}` as MessageKey)
          : god.seat.kind === 'stem'
            ? t(`label.stem.${god.seat.stem.id}` as MessageKey)
            : god.seat.kind === 'trigram'
              ? t(`label.palace.${god.seat.trigram.id}` as MessageKey)
              : god.seat.branches
                  .map((b: any) => t(`label.branch.${b.id}` as MessageKey))
                  .join(', ')}{' '}
      {/each}
    </span>
  </p>
{/if}
</div>

<!--
  Both post horses, never one of them.

  日馬 and 時馬 are two things the tradition names apart, and showing whichever
  one the software preferred would be a school chosen in a line of markup.
  Which of them bears on a question is the reader's, as the errand of a gate is.

  Guarded, and the guard is not superstition. A chart is cached `private` for a
  day, and the dialog reads one over `fetch`: a reader who was here yesterday
  holds yesterday's JSON, and the first thing a field added to the engine meets
  is a chart cast before it existed. Without this the whole reading throws and
  the dialog sits on «working» for ever — which is exactly what it did, once,
  against a response left over from before the field was built.
-->
<ul class="horses">
  {#each chart.horses ?? [] as horse}
    <li>
      {t(`label.horse.${horse.from}` as MessageKey)}:
      {t(`label.branch.${horse.branch.id}` as MessageKey)}
      <span class="glyph">{glyph(horse.branch)}</span>
      — {horse.palace}
    </li>
  {/each}
</ul>

<!-- Six columns of two lines each: on a narrow screen the table scrolls
     inside its frame rather than taking the page with it. -->
{#if palaces}
  <div class="scroller"><PalaceTable palaces={chart.palaces} {t} /></div>
{/if}

{#if chart.patterns.length > 0}
  <h2>{t('cli.heading.patterns')}</h2>
  <ul class="patterns">
    {#each chart.patterns as pattern}
      <li>
        {t(`label.pattern.${pattern.id}` as MessageKey)}
        {#if pattern.palace}— {pattern.palace}{/if}
        <span class="glyph">{glyph(pattern)}</span>
        <!--
          Written in words and in no colour. The fortune is an attribute of the
          arrangement, and green against red would turn a list of configurations
          into a verdict on the hour holding them, which is the one thing this
          is not.
        -->
        <span class="valence">
          {t(`label.valence.${pattern.valence.id}` as MessageKey)}
          <span class="glyph">{glyph(pattern.valence)}</span>
        </span>
      </li>
    {/each}
  </ul>
{/if}

<style>
  /*
   * Sized in `em` throughout, so the caller decides how loud this is.
   *
   * The same words are a page's answer and a column beside a drawing in a
   * dialog, and the second wants them a shade smaller. One `font-size` on the
   * element that holds this moves all of it together.
   */
  .ju { font-size: 1.1em; margin: 0 0 0.35rem; }
  /*
   * The almanac's line, set under the pillars and quieter than them.
   *
   * Smaller and dimmer because it is not the chart: it is the page the chart
   * was read beside, and a reader who mistook it for a field of the board
   * would be taking a whole second layer for part of this one.
   */
  .almanac { font-size: 0.85em; color: var(--faint); margin: 0.5rem 0 0; }
  .wide .almanac { text-align: center; }
  .almanac .doubled { opacity: 0.75; }
  /* The bearings go on their own line: they answer a different question from
     the day above them, and the one dunjia shares with this layer. */
  .almanac .gods { display: block; margin-block-start: 0.15rem; }
  /* A virtue the day actually carries is the news; where each merely sits is
     the frame. The mark is weight and not colour, so it survives print. */
  .almanac .onday { font-weight: 600; }
  /*
   * The caption's measure, mirrored from the drawing's own rule.
   *
   * The board is `min(100%, 100svh * 8 / 7)` wide on both pages that draw it
   * at full width, so this is the same figure and the two align edge to edge.
   * Written twice on purpose and marked in both places: the alternative is a
   * custom property set by two pages and read here, which hides the coupling
   * instead of naming it.
   */
  .wide {
    inline-size: min(100%, calc(100svh * 8 / 7));
    margin-inline: auto;
  }
  .wide .ju { text-align: center; }
  /*
   * On paper the board is 17cm and not a fraction of a window: the caption
   * follows it there too, or it hangs off both sides of the drawing.
   *
   * And it stays with what it captions. A page break fell between the ju and
   * the four pillars, which left a line centred at the foot of one sheet over
   * a plate at the head of the next — a caption to nothing, twice.
   */
  @media print {
    .wide { inline-size: min(100%, 17cm); break-inside: avoid; }
  }
  /* Under the ju and above the board: they qualify the whole chart, as the ju
     does, and neither belongs to any one palace of it. */
  .horses {
    list-style: none;
    padding: 0;
    margin: 0 0 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 1rem;
    font-size: 0.9em;
    color: var(--faint);
  }
  h2 { font-size: 1em; font-weight: 500; margin: 1.5rem 0 0.5rem; }
  .patterns { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.25rem; }
  .glyph { margin-left: 0.5rem; color: var(--faint); font-size: 0.85em; }
  .valence { margin-left: 0.75rem; color: var(--faint); font-size: 0.9em; }
  .valence .glyph { margin-left: 0.25rem; }
</style>
