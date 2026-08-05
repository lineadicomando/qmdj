<script lang="ts">
  import type { MessageKey } from '@qimendunjia/i18n';
  import { appearance } from '$lib/appearance.svelte';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import PalaceTable from '$lib/components/PalaceTable.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  let date = $state('');
  let time = $state('');
  let place = $state<any>(undefined);
  let trueSolarTime = $state(true);
  let dayBoundary = $state('zishi');

  let chart = $state<any>(undefined);
  let failure = $state('');
  let busy = $state(false);

  /**
   * The address is the chart.
   *
   * Every parameter goes in the query string, so a chart can be linked and
   * reopened. It is also exactly what the API takes, which is why there is no
   * second shape to keep in step.
   */
  function query(): string {
    const params = new URLSearchParams({ lang: t.locale });
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    if (place) params.set('locationId', String(place.id));
    if (!trueSolarTime) params.set('trueSolarTime', 'false');
    if (dayBoundary !== 'zishi') params.set('dayBoundary', dayBoundary);
    return params.toString();
  }

  async function cast(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    busy = true;
    failure = '';
    try {
      const response = await fetch(`/api/chart?${query()}`);
      const body = await response.json();
      if (!response.ok) {
        // The engine sent a code; translating it is what the catalog is for.
        failure = body.messageKey ? t(body.messageKey as MessageKey, body.params ?? {}) : body.message;
        chart = undefined;
        return;
      }
      chart = body.chart;
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>{t('cli.heading.chart')}</title></svelte:head>

<h1>{t('cli.heading.chart')}</h1>

<FormPanel {t} closable={chart !== undefined} onsubmit={cast}>
  {#snippet fields()}
    <MomentForm {t} bind:date bind:time bind:place bind:trueSolarTime bind:dayBoundary />
    <button type="submit" disabled={busy}>{t('cli.heading.chart')}</button>
  {/snippet}
  {#snippet summary()}
    {date || '—'} {time} {place ? `· ${place.name}` : ''}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if chart}
  <section class="result">
    <!-- The picture and the data together: a drawing carries the glyphs but
         not the warnings, so it is never shown on its own. -->
    <img
      src="/api/chart/plate?{query()}&scheme={appearance.current}"
      alt=""
      width="640"
      height="640"
    />

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
