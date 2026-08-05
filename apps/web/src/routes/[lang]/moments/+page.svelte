<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import {
    chartQuery,
    intervalQuery,
    type CriteriaInput,
    type IntervalInput,
  } from '$lib/interval';
  import { sayFailure } from '$lib/moment';
  import { DIRECTIONS, GATE_IDS, PATTERN_IDS, SPIRIT_IDS, STAR_IDS, STRENGTHS } from '$lib/vocabulary';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import LocationSearch from '$lib/components/LocationSearch.svelte';
  import MomentTable from '$lib/components/MomentTable.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  // svelte-ignore state_referenced_locally
  let asked = $state<IntervalInput>({ ...data.interval });
  // svelte-ignore state_referenced_locally
  let looking = $state<CriteriaInput>({ ...data.criteria });
  $effect(() => {
    asked = { ...data.interval };
    looking = { ...data.criteria };
  });

  const scan = $derived(data.scan);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');
  const gloss = (prefix: string, id: string): string => t(`label.${prefix}.${id}` as MessageKey);

  let busy = $state(false);

  async function show(): Promise<void> {
    busy = true;
    try {
      await goto(`${page.url.pathname}?${intervalQuery(asked, looking)}`, {
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
    void show();
  }

  /** A checkbox group binds to an array; this is what a checkbox does to one. */
  function toggle(list: string[], id: string, on: boolean): string[] {
    return on ? [...list, id] : list.filter((entry) => entry !== id);
  }
</script>

<svelte:head><title>{t('nav.moments')}</title></svelte:head>

<h1>{t('nav.moments')}</h1>

<FormPanel
  {t}
  legend="form.interval"
  reopenLabel="form.openInterval"
  closable={scan !== undefined}
  onsubmit={submit}
>
  {#snippet fields()}
    <div class="row">
      <label>
        {t('form.from')}
        <input type="date" bind:value={asked.from} required />
      </label>
      <label>
        {t('form.to')}
        <input type="date" bind:value={asked.to} required />
      </label>
    </div>

    <LocationSearch {t} bind:selected={asked.place} />

    <fieldset>
      <legend>{t('form.looking')}</legend>

      <div class="row">
        <label>
          {t('cli.column.gate')}
          <select bind:value={looking.gate}>
            <option value="">{t('form.any')}</option>
            {#each GATE_IDS as id}
              <option value={id}>{gloss('gate', id)}</option>
            {/each}
          </select>
        </label>
        <label>
          {t('cli.column.star')}
          <select bind:value={looking.star}>
            <option value="">{t('form.any')}</option>
            {#each STAR_IDS as id}
              <option value={id}>{gloss('star', id)}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="row">
        <label>
          {t('cli.column.spirit')}
          <select bind:value={looking.spirit}>
            <option value="">{t('form.any')}</option>
            {#each SPIRIT_IDS as id}
              <option value={id}>{gloss('spirit', id)}</option>
            {/each}
          </select>
        </label>
        <label>
          {t('form.minStrength')}
          <select bind:value={looking.minStrength}>
            <option value="">{t('form.any')}</option>
            {#each STRENGTHS as id}
              <option value={id}>{gloss('strength', id)}</option>
            {/each}
          </select>
        </label>
      </div>

      <!-- The direction is asked for in words, because it is a thing to
           choose. `se` is what travels in the address. -->
      <p class="group">{t('form.towards')}</p>
      <div class="checks">
        {#each DIRECTIONS as id}
          <label class="check">
            <input
              type="checkbox"
              checked={looking.towards.includes(id)}
              onchange={(event) =>
                (looking.towards = toggle(looking.towards, id, event.currentTarget.checked))}
            />
            {gloss('palace', PALACE_OF[id])}
          </label>
        {/each}
      </div>

      <p class="group">{t('form.without')}</p>
      <div class="checks">
        {#each PATTERN_IDS as id}
          <label class="check">
            <input
              type="checkbox"
              checked={looking.without.includes(id)}
              onchange={(event) =>
                (looking.without = toggle(looking.without, id, event.currentTarget.checked))}
            />
            {gloss('pattern', id)}
          </label>
        {/each}
      </div>

      <p class="note">{t('form.criteriaNote')}</p>
    </fieldset>

    <button type="submit" disabled={busy}>{t('form.scan')}</button>
  {/snippet}
  {#snippet summary()}
    {asked.from || '—'} → {asked.to || '—'}
    {asked.place ? `· ${asked.place.name}` : ''}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if scan}
  <p class="count">
    {t('form.scanned', { runs: scan.scanned, matched: scan.moments.length })}
  </p>

  {#if scan.moments.length > 0}
    <MomentTable
      moments={scan.moments}
      {t}
      href={(start) => `/${t.locale}?${chartQuery(start, data.interval)}`}
    />
  {:else}
    <p class="none">{t('cli.value.nothingAnswered')}</p>
  {/if}
{/if}

<script lang="ts" module>
  /**
   * Which palace faces where.
   *
   * The direction is what the reader chooses and `se` is what the address
   * carries, but the catalog has no word for a bare direction: the palace
   * names itself by one — `label.palace.xun` is "southeast" — so the gloss is
   * taken from there rather than duplicated under keys of its own.
   */
  const PALACE_OF: Record<string, string> = {
    n: 'kan',
    ne: 'gen',
    e: 'zhen',
    se: 'xun',
    s: 'li',
    sw: 'kun',
    w: 'dui',
    nw: 'qian',
  };
</script>

<style>
  h1 { font-size: 1.25rem; font-weight: 500; margin: 0 0 1.2rem; }
  button { justify-self: start; font: inherit; padding: 0.4rem 1.1rem; cursor: pointer; }
  .failure { color: var(--alarm); }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  label :global(input), label :global(select) { font: inherit; color: var(--ink); }
  fieldset { border: 1px solid var(--rule); padding: 0.9rem; display: grid; gap: 0.7rem; }
  legend { font-size: 0.85em; color: var(--faint); padding: 0 0.35rem; }
  .group { margin: 0.3rem 0 0; font-size: 0.9em; color: var(--faint); }
  .checks { display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; }
  .check { display: flex; gap: 0.4rem; align-items: center; color: var(--ink); }
  .note { margin: 0; color: var(--faint); font-size: 0.8em; }
  .count { color: var(--faint); font-size: 0.9em; }
  .none { color: var(--faint); }
</style>
