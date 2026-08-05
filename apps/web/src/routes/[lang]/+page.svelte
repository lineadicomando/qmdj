<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import { step, type Unit, type Wall } from '$lib/step';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import MomentSteps from '$lib/components/MomentSteps.svelte';
  import PalaceTable from '$lib/components/PalaceTable.svelte';

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

  let busy = $state(false);

  /**
   * Asking is navigating, and the answer arrives as the page's own data.
   *
   * `replaceState`: a moment gets stepped a dozen times in a row, and a back
   * button that has to walk back through every one of them is a back button
   * nobody can use. Back leaves the chart, which is what a reader means by it.
   */
  async function show(next: MomentInput): Promise<void> {
    const query = momentQuery(next);
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

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    void show(asked);
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

<h1>{t('cli.heading.chart')}</h1>

<FormPanel {t} closable={chart !== undefined} onsubmit={submit}>
  {#snippet fields()}
    <MomentForm
      {t}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
    />
    <button type="submit" disabled={busy}>{t('cli.heading.chart')}</button>
  {/snippet}
  {#snippet summary()}
    <!-- The instant it was cast for, not the one that was asked: an empty
         form means now, and the reader should be told which now. -->
    {cast?.date ?? '—'}
    {cast?.time ?? ''}
    {data.moment.place ? `· ${data.moment.place.name}` : ''}
  {/snippet}
  {#snippet controls()}
    <MomentSteps {t} disabled={busy} onstep={moved} onnow={now} />
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if chart}
  <section class="result">
    <!-- The picture and the data together: a drawing carries the glyphs but
         not the warnings, so it is never shown on its own. -->
    <img src={plate} alt="" width="640" height="640" />

    <div>
      <p class="ju">
        {chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')}
        {chart.ju.number} · {t(`label.yuan.${chart.ju.yuan}` as MessageKey)}
      </p>
      <PalaceTable palaces={chart.palaces} {t} />

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
  button { justify-self: start; font: inherit; padding: 0.4rem 1.1rem; cursor: pointer; }
  .failure { color: var(--alarm); }
  /*
   * One column, and the drawing as large as the reading is wide.
   *
   * Beside the table it had to fit in a column of it, and every palace holds
   * five words, five names and a mark: at that size the board was read with
   * an effort nobody should be asked for. The table follows it instead —
   * a picture first, then the same thing said in full.
   */
  .result { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1fr); }
  img { display: block; width: 100%; max-width: 46rem; height: auto; }
  .ju { font-size: 1.1em; margin: 0 0 0.75rem; }
  .patterns { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.25rem; }
  .glyph { margin-left: 0.5rem; color: var(--faint); font-size: 0.85em; }
</style>
