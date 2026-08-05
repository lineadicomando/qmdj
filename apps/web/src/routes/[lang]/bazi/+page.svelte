<script lang="ts">
  import type { MessageKey } from '@qimendunjia/i18n';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  let date = $state('');
  let time = $state('');
  let place = $state<any>(undefined);
  let gender = $state('');
  let trueSolarTime = $state(true);
  let dayBoundary = $state('zishi');

  let result = $state<any>(undefined);
  let failure = $state('');

  async function compute(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const params = new URLSearchParams({ lang: t.locale });
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    if (place) params.set('locationId', String(place.id));
    if (gender) params.set('gender', gender);
    if (!trueSolarTime) params.set('trueSolarTime', 'false');
    if (dayBoundary !== 'zishi') params.set('dayBoundary', dayBoundary);

    failure = '';
    const response = await fetch(`/api/bazi?${params}`);
    const body = await response.json();
    if (!response.ok) {
      failure = body.messageKey ? t(body.messageKey as MessageKey, body.params ?? {}) : body.message;
      result = undefined;
      return;
    }
    result = body;
  }

  const say = (pair: any): string =>
    `${t(`label.stem.${pair.stem.id}` as MessageKey)} · ${t(`label.branch.${pair.branch.id}` as MessageKey)}`;
</script>

<svelte:head><title>{t('cli.heading.pillars')}</title></svelte:head>

<h1>{t('cli.heading.pillars')}</h1>

<FormPanel {t} closable={result !== undefined} onsubmit={compute}>
  {#snippet fields()}
    <MomentForm {t} bind:date bind:time bind:place bind:trueSolarTime bind:dayBoundary />
    <label>
      <!-- Asked for, never assumed: only the direction of the cycles needs it. -->
      {t('cli.heading.luck')}
      <select bind:value={gender}>
        <option value="">—</option>
        <option value="male">male</option>
        <option value="female">female</option>
      </select>
    </label>
    <button type="submit">{t('cli.heading.reading')}</button>
  {/snippet}
  {#snippet summary()}
    {date || '—'} {time} {place ? `· ${place.name}` : ''}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if result}
  <p class="master">
    {t('cli.field.dayMaster')}: {t(`label.stem.${result.bazi.dayMaster.id}` as MessageKey)}
    <span class="glyph">{result.bazi.dayMaster.hanzi}</span>
  </p>

  <table>
    <thead>
      <tr>
        <th></th><th>{t('cli.column.year')}</th><th>{t('cli.column.god')}</th>
        <th>{t('cli.column.hidden')}</th><th>{t('cli.column.stage')}</th>
      </tr>
    </thead>
    <tbody>
      {#each result.bazi.pillars as pillar}
        <tr>
          <th scope="row">{t(`cli.column.${pillar.position}` as MessageKey)}</th>
          <td>
            <span>{say(pillar.ganzhi)}</span>
            <span class="glyph">{pillar.ganzhi.hanzi}</span>
          </td>
          <td>{#if pillar.stemGod}{t(`label.god.${pillar.stemGod.id}` as MessageKey)}{:else}—{/if}</td>
          <td>{pillar.hidden.map((h: any) => t(`label.stem.${h.stem.stem.id}` as MessageKey)).join(', ')}</td>
          <td>{t(`label.stage.${pillar.stage.id}` as MessageKey)}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if result.bazi.luck}
    <h2>{t('cli.heading.luck')}</h2>
    <ul class="cycles">
      {#each result.bazi.luck.cycles as cycle}
        <li><small>{cycle.startAge}</small> {say(cycle.ganzhi)}</li>
      {/each}
    </ul>
  {:else}
    <p class="note">{t('cli.error.genderRequired')}</p>
  {/if}
{/if}

<style>
  h1 { font-size: 1.25rem; font-weight: 500; margin: 0 0 1.2rem; }
  h2 { font-size: 1em; font-weight: 500; margin: 1.5rem 0 0.5rem; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  button { justify-self: start; font: inherit; padding: 0.4rem 1.1rem; cursor: pointer; }
  table { width: 100%; max-width: 46rem; border-collapse: collapse; }
  th, td {
    text-align: left;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid var(--rule);
    vertical-align: baseline;
    white-space: nowrap;
  }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  .glyph { display: block; color: var(--faint); font-size: 0.8em; }
  .master { margin: 0 0 1rem; }
  .cycles {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 0.3rem 1rem;
  }
  .cycles small { color: var(--faint); margin-right: 0.4rem; }
  .failure { color: var(--alarm); }
  .note { color: var(--faint); font-size: 0.85em; margin-top: 1rem; }
</style>
