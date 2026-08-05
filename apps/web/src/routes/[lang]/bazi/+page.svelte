<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  // The fields are edited, so they are state; the address is what they were
  // last asked as, so arriving at one puts them back.
  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  // svelte-ignore state_referenced_locally
  let gender = $state(data.gender);
  $effect(() => {
    asked = { ...data.moment };
    gender = data.gender;
  });

  const result = $derived(data.result);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');

  let busy = $state(false);

  /** Reading is navigating: the address holds the moment, here and on the chart. */
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    busy = true;
    try {
      const query = momentQuery(asked, { gender });
      await goto(`${page.url.pathname}${query ? `?${query}` : ''}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    } finally {
      busy = false;
    }
  }

  const say = (pair: any): string =>
    `${t(`label.stem.${pair.stem.id}` as MessageKey)} · ${t(`label.branch.${pair.branch.id}` as MessageKey)}`;
</script>

<svelte:head><title>{t('cli.heading.pillars')}</title></svelte:head>

<h1>{t('cli.heading.pillars')}</h1>

<FormPanel {t} closable={result !== undefined} onsubmit={submit}>
  {#snippet fields()}
    <MomentForm
      {t}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
    />
    <label>
      <!-- Asked for, never assumed: only the direction of the cycles needs
           it, and the label says so rather than leaving it to be guessed. -->
      {t('form.gender')}
      <select bind:value={gender}>
        <option value="">{t('form.gender.unset')}</option>
        <option value="male">{t('form.gender.male')}</option>
        <option value="female">{t('form.gender.female')}</option>
      </select>
    </label>
    <button type="submit" disabled={busy}>{t('cli.heading.reading')}</button>
  {/snippet}
  {#snippet summary()}
    {data.moment.date || '—'}
    {data.moment.time}
    {data.moment.place ? `· ${data.moment.place.name}` : ''}
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
