<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { appearance } from '$lib/appearance.svelte';
  import { scanFields, scanQuery } from '$lib/interval';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import { step, type Unit, type Wall } from '$lib/step';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import MomentSteps from '$lib/components/MomentSteps.svelte';
  import PalaceTable from '$lib/components/PalaceTable.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  /**
   * The fields are edited, so they are state; the address is what they were
   * last asked as, so arriving at one puts them back.
   */
  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  $effect(() => {
    asked = { ...data.moment };
  });

  const chart = $derived(data.chart);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');

  /**
   * The instant the answer was actually computed for.
   *
   * An address that says nothing means now, and the server resolved that now
   * **in the place's own zone**. Stepping from the browser's clock instead
   * would jump by hours for a chart cast in Beijing and read in Rome.
   */
  const cast = $derived<Wall | undefined>(
    data.chart && { date: data.chart.moment.input.date, time: data.chart.moment.input.time },
  );

  // The picture answers for the moment the data answers for — pinned to the
  // instant, so that "now" is a new address every time and not one image
  // cached over a day of different charts.
  const plate = $derived(
    `/api/chart/plate?${momentQuery({ ...data.moment, ...cast }, { lang: t.locale, scheme: appearance.current })}`,
  );

  /**
   * Where each step stands, shown on the step that moves it.
   *
   * Cut from the instant the answer was cast for, not from the fields: the
   * fields say nothing when the chart is the present one, and a row of steps
   * that read as empty beside a chart of today would be lying about it.
   */
  const values = $derived(
    cast && {
      year: cast.date.slice(0, 4),
      month: cast.date.slice(5, 7),
      day: cast.date.slice(8, 10),
      // The present arrives from the engine to the second, and the seconds
      // are neither stepped nor read: what a step moves is the clock time.
      shichen: cast.time.slice(0, 5),
    },
  );

  /**
   * The scan this chart was reached from, if it was reached from one.
   *
   * A chart is a page one lands on; a scan is an interval and a set of
   * criteria somebody typed, and the browser's back button was the only way
   * back to it. It is not lost — the scan is entirely in its own address —
   * but it is recomputed, and a way back that is not on the page is a way
   * back nobody is told about.
   */
  const back = $derived(scanQuery(page.url));

  let busy = $state(false);
  let panel: FormPanel | undefined = $state();

  /**
   * The drawing that is on screen, as against the one that was asked for.
   *
   * A new address changes `src` before a pixel of the new picture exists, and
   * the browser holds the old one up in the meantime with nothing to say it
   * is stale. Until the two agree, the board is shown as on its way.
   */
  let drawn = $state('');

  /**
   * Asking is navigating, and the answer arrives as the page's own data.
   *
   * `replaceState`: a moment gets stepped a dozen times in a row, and a back
   * button that has to walk back through every one of them is a back button
   * nobody can use. Back leaves the chart, which is what a reader means by it.
   */
  async function show(next: MomentInput): Promise<void> {
    // The scan is carried through every step, so the way back outlives them.
    // Somebody who found an hour and then looked at the one before it has
    // not stopped coming from a scan.
    const query = momentQuery(next, scanFields(page.url));
    const target = `${page.url.pathname}${query ? `?${query}` : ''}`;
    busy = true;
    try {
      // Asking the present for the present again is not a navigation, and
      // SvelteKit would rightly do nothing with it. It is still a new chart.
      if (target === `${page.url.pathname}${page.url.search}`) await invalidateAll();
      else await goto(target, { replaceState: true, noScroll: true, keepFocus: true });
    } finally {
      busy = false;
    }
  }

  /**
   * Asking closes the fields, once they have answered.
   *
   * Only on the submit, and only when the answer is a chart: a failure leaves
   * the panel open, because what has to be corrected is in it.
   */
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await show(asked);
    if (!data.failure) await panel?.close();
  }

  /** The day, moved without reopening the fields. The hour stays where it is. */
  function jump(date: string): void {
    if (date) void show({ ...data.moment, date, time: cast?.time ?? data.moment.time });
  }

  function moved(unit: Unit, by: number): void {
    if (cast) void show({ ...data.moment, ...step(cast, unit, by) });
  }

  /** The present is what the address says by not saying a date. */
  function now(): void {
    void show({ ...data.moment, date: '', time: '' });
  }
</script>

<svelte:head><title>{t('cli.heading.chart')}</title></svelte:head>

{#if back}
  <a class="back" href="/{t.locale}/moments?{back}">← {t('form.backToScan')}</a>
{/if}

<h1>{t('cli.heading.chart')}</h1>

<FormPanel {t} bind:this={panel} closable={chart !== undefined} onsubmit={submit}>
  {#snippet fields()}
    <MomentForm
      {t}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
    />
    <!-- Nothing here can be missing: a chart of no date is the chart of now. -->
    <SubmitButton {t} label="cli.heading.chart" {busy} />
  {/snippet}
  {#snippet summary()}
    <!--
      The day stays a field with the panel shut.

      It is the one thing asked for here that the steps beside it cannot
      reach in a reasonable number of presses — a chart of a date next spring
      is one gesture away rather than four dozen — and it is also the answer
      to which moment this is. The instant it was cast for, not the one that
      was asked: an empty form means now, and the reader should be told which
      now.
    -->
    <input
      type="date"
      class="day"
      value={cast?.date ?? ''}
      aria-label={t('form.jumpDate')}
      disabled={busy}
      onchange={(event) => jump(event.currentTarget.value)}
    />
    {#if data.moment.place}<span>· {data.moment.place.name}</span>{/if}
  {/snippet}
  {#snippet controls()}
    <MomentSteps {t} disabled={busy} {values} onstep={moved} onnow={now} />
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if chart}
  <!--
    While the next chart is being cast, the one on screen is last question's
    answer: it is shown as spent rather than swapped without warning. A press
    that changed nothing visible for half a second is a press people make
    twice.
  -->
  <section class="result" class:stale={busy} aria-busy={busy}>
    <!-- The picture and the data together: a drawing carries the glyphs but
         not the warnings, so it is never shown on its own. -->
    <img
      src={plate}
      alt=""
      width="640"
      height="640"
      class:settling={drawn !== plate}
      onload={() => (drawn = plate)}
    />

    <div>
      <p class="ju">
        {chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')}
        {chart.ju.number} · {t(`label.yuan.${chart.ju.yuan}` as MessageKey)}
      </p>
      <!-- Six columns of two lines each: on a narrow screen the table scrolls
           inside its frame rather than taking the page with it. -->
      <div class="scroller"><PalaceTable palaces={chart.palaces} {t} /></div>

      {#if chart.patterns.length > 0}
        <h2>{t('cli.heading.patterns')}</h2>
        <ul class="patterns">
          {#each chart.patterns as pattern}
            <li>
              {t(`label.pattern.${pattern.id}` as MessageKey)}
              {#if pattern.palace}— {pattern.palace}{/if}
              <span class="glyph">{pattern.hanzi}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>
{/if}

<style>
  h1 { font-size: 1.25rem; font-weight: 500; margin: 0 0 1.2rem; }
  h2 { font-size: 1em; font-weight: 500; margin: 1.5rem 0 0.5rem; }
  /* Above the heading, where a way out of a page is looked for. */
  .back { display: inline-block; color: var(--faint); font-size: 0.85em; margin-bottom: 0.6rem; }
  .failure { color: var(--alarm); }
  /* In the closed bar, beside text rather than under a label of its own. */
  .day { font-size: 0.9rem; padding: 0.15rem 0.35rem; color: var(--ink); }
  /*
   * One column, and the drawing as large as the reading is wide.
   *
   * Beside the table it had to fit in a column of it, and every palace holds
   * five words, five names and a mark: at that size the board was read with
   * an effort nobody should be asked for. The table follows it instead —
   * a picture first, then the same thing said in full.
   */
  .result { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1fr); }
  .result, img { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  .settling { opacity: 0.35; }
  img { display: block; width: 100%; max-width: 46rem; height: auto; }
  @media (prefers-reduced-motion: reduce) {
    .result, img { transition: none; }
  }
  .ju { font-size: 1.1em; margin: 0 0 0.75rem; }
  .patterns { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.25rem; }
  .glyph { margin-left: 0.5rem; color: var(--faint); font-size: 0.85em; }
</style>
