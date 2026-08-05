<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
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

  // The picture answers for the moment that was cast, not for the one being
  // typed: it is the same address the data came from.
  const plate = $derived(
    `/api/chart/plate?${momentQuery(data.moment, { lang: t.locale, scheme: appearance.current })}`,
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
    busy = true;
    try {
      await goto(`${page.url.pathname}${query ? `?${query}` : ''}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    } finally {
      busy = false;
    }
  }

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    void show(asked);
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
    {data.moment.date || '—'}
    {data.moment.time}
    {data.moment.place ? `· ${data.moment.place.name}` : ''}
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
  .result { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1fr); }
  @media (min-width: 62rem) { .result { grid-template-columns: 44% 1fr; } }
  img { width: 100%; height: auto; }
  .ju { font-size: 1.1em; margin: 0 0 0.75rem; }
  .patterns { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.25rem; }
  .glyph { margin-left: 0.5rem; color: var(--faint); font-size: 0.85em; }
</style>
