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
  import {
    DIRECTIONS,
    GATE_IDS,
    PATTERN_IDS,
    PURPOSES,
    SPIRIT_IDS,
    STAR_IDS,
    STRENGTHS,
  } from '$lib/vocabulary';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import LocationSearch from '$lib/components/LocationSearch.svelte';
  import MomentTable from '$lib/components/MomentTable.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

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
  let panel: FormPanel | undefined = $state();

  /** Two dates, and nothing about them can be guessed: see `+page.ts`. */
  const needed = $derived(
    asked.from && asked.to ? undefined : ('form.needed.interval' as const),
  );

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

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await show();
    // The criteria withdraw once they have been answered, and the bar keeps
    // saying what was asked. A failure keeps them open: it is in them.
    if (!data.failure && data.scan) await panel?.close();
  }

  /**
   * The errand, which is a second view of the gate rather than a state of its
   * own.
   *
   * Derived from `looking.gate` and writing back to it, so there is exactly
   * one thing to be in: a preset that kept its own value could say "opening"
   * over a gate somebody had since changed by hand. It also teaches in both
   * directions — choose 開門 in the gate field and this says what it is for.
   *
   * It does not travel in the address. The address carries criteria; the
   * errand is a way of filling them in.
   */
  const purpose = $derived(
    PURPOSES.find((entry) => entry.gate === looking.gate)?.id ?? '',
  );

  function choosePurpose(id: string): void {
    looking.gate = PURPOSES.find((entry) => entry.id === id)?.gate ?? '';
  }

  /** A checkbox group binds to an array; this is what a checkbox does to one. */
  function toggle(list: string[], id: string, on: boolean): string[] {
    return on ? [...list, id] : list.filter((entry) => entry !== id);
  }

  /**
   * What was asked for, said in the bar the fields left behind.
   *
   * The interval alone would not do here. A scan is run again and again with
   * one criterion changed, and a closed panel that showed only two dates
   * would hide the very thing being changed. Read from `data.criteria` and
   * not from `looking`: the bar reports the question that was answered, not
   * the one being typed.
   */
  const said = $derived([
    data.criteria.gate && gloss('gate', data.criteria.gate),
    data.criteria.star && gloss('star', data.criteria.star),
    data.criteria.spirit && gloss('spirit', data.criteria.spirit),
    data.criteria.minStrength && gloss('strength', data.criteria.minStrength),
    ...data.criteria.towards.map((id: string) => gloss('palace', PALACE_OF[id] as string)),
    ...data.criteria.without.map((id: string) => `− ${gloss('pattern', id)}`),
  ].filter(Boolean));
</script>

<svelte:head><title>{t('nav.moments')}</title></svelte:head>

<h1>{t('nav.moments')}</h1>

<FormPanel
  {t}
  bind:this={panel}
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
      <LocationSearch {t} bind:selected={asked.place} />
    </div>

    <fieldset>
      <legend>{t('form.looking')}</legend>

      <label class="purpose">
        {t('form.purpose')}
        <select value={purpose} onchange={(event) => choosePurpose(event.currentTarget.value)}>
          <option value="">{t('form.any')}</option>
          {#each PURPOSES as entry}
            <option value={entry.id}>{gloss('purpose', entry.id)}</option>
          {/each}
        </select>
      </label>
      <p class="note">{t('form.purposeNote')}</p>

      <!-- The four together in one row: they are asked of the same palace,
           and where there is room for four they are read as one question. -->
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

    <SubmitButton {t} label="form.scan" {busy} {needed} />
  {/snippet}
  {#snippet summary()}
    <span>{data.interval.from || '—'} → {data.interval.to || '—'}</span>
    {#if data.interval.place}<span>· {data.interval.place.name}</span>{/if}
    {#each said as criterion}<span class="criterion">{criterion}</span>{/each}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if scan}
  <div class="result" class:stale={busy} aria-busy={busy}>
    <p class="count">
      {t('form.scanned', { runs: scan.scanned, matched: scan.moments.length })}
    </p>

    {#if scan.moments.length > 0}
      <div class="scroller">
        <MomentTable
          moments={scan.moments}
          {t}
          href={(start) => `/${t.locale}?${chartQuery(start, data.interval)}`}
        />
      </div>
    {:else}
      <p class="none">{t('cli.value.nothingAnswered')}</p>
    {/if}
  </div>
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
  .failure { color: var(--alarm); }
  /* As many per row as the panel has room for, one when it has none: the
     criteria are `select`s holding words of very uneven length, and a fixed
     pair of columns pushed the page sideways on a phone. */
  .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 0.9rem; }
  /* Fields hang from the top of the row, whatever grows below one of them. */
  .row > :global(*) { align-self: start; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  label :global(input), label :global(select) { color: var(--ink); }
  fieldset {
    border: 1px solid var(--rule);
    /* The border is inset by a rem on a page that may have three to spare. */
    padding: 0.9rem clamp(0.5rem, 3vw, 0.9rem);
    display: grid;
    gap: 0.7rem;
    /* A fieldset does not shrink below its widest child on its own. */
    min-inline-size: 0;
  }
  legend { font-size: 0.85em; color: var(--faint); padding: 0 0.35rem; }
  .group { margin: 0.3rem 0 0; font-size: 0.9em; color: var(--faint); }
  /* Above the fields it fills, and wide: these are sentences, not words —
     but a sentence in a `select` gains nothing from a line 70rem long. */
  .purpose { font-size: 0.95em; max-width: 34rem; }
  .checks { display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; }
  .check { display: flex; gap: 0.4rem; align-items: center; color: var(--ink); }
  /* Prose keeps a measure the eye can return from, whatever the panel does. */
  .note { margin: 0; color: var(--faint); font-size: 0.8em; max-width: 42rem; }
  .count { color: var(--faint); font-size: 0.9em; }
  .none { color: var(--faint); }
  /* Each criterion set off from the next, so the closed bar reads as a list
     of what was asked and not as a sentence. */
  .criterion {
    border: 1px solid var(--rule);
    border-radius: 999px;
    padding: 0.05rem 0.5rem;
    white-space: nowrap;
  }
  .result { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  @media (prefers-reduced-motion: reduce) {
    .result { transition: none; }
  }
</style>
