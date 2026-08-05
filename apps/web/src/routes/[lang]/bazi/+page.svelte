<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import PillarPlate from '$lib/components/PillarPlate.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

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
  let panel: FormPanel | undefined = $state();

  /**
   * What the pillars are still waiting for.
   *
   * The date, and nothing else: the place refines the hour and the sex only
   * turns the luck cycles, so a reading without either is shorter rather than
   * wrong. Without a date there is no reading at all — see `+page.ts`.
   */
  const needed = $derived(asked.date ? undefined : ('form.needed.date' as const));

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
    // The fields withdraw once they have answered, and stay for a failure:
    // what has to be corrected is in them.
    if (!data.failure && data.result) await panel?.close();
  }

  const say = (pair: any): string =>
    `${t(`label.stem.${pair.stem.id}` as MessageKey)} · ${t(`label.branch.${pair.branch.id}` as MessageKey)}`;
</script>

<svelte:head><title>{t('cli.heading.pillars')}</title></svelte:head>

<h1>{t('cli.heading.pillars')}</h1>

<FormPanel {t} bind:this={panel} closable={result !== undefined} onsubmit={submit}>
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
    <SubmitButton {t} label="cli.heading.reading" {busy} {needed} />
  {/snippet}
  {#snippet summary()}
    {data.moment.date || '—'}
    {data.moment.time}
    {data.moment.place ? `· ${data.moment.place.name}` : ''}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if result}
  <!-- Spent while the next reading is on its way, rather than swapped without
       warning: see the chart, where the same rule holds. -->
  <div class="result" class:stale={busy} aria-busy={busy}>
    <p class="master">
      {t('cli.field.dayMaster')}: {t(`label.stem.${result.bazi.dayMaster.id}` as MessageKey)}
      <span class="glyph">{result.bazi.dayMaster.hanzi}</span>
    </p>

    <!-- The four pillars at a glance, then the same four read out in full. -->
    <PillarPlate pillars={result.bazi.pillars} {t} />

    <!-- Five columns that do not break: on a narrow screen it is the table
         that scrolls, not the page. -->
    <div class="scroller">
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
    </div>

    {#if result.bazi.luck}
      <h2>{t('cli.heading.luck')}</h2>
      <ul class="cycles">
        {#each result.bazi.luck.cycles as cycle}
          <li><small>{cycle.startAge}</small> {say(cycle.ganzhi)}</li>
        {/each}
      </ul>
    {:else}
      <!-- Not `cli.error.genderRequired`: that one names `--gender`, which is
           a flag nobody reading a web page has. -->
      <p class="note">{t('form.needed.gender')}</p>
    {/if}
  </div>
{/if}

<style>
  h1 { font-size: 1.25rem; font-weight: 500; margin: 0 0 1.2rem; }
  h2 { font-size: 1em; font-weight: 500; margin: 1.5rem 0 0.5rem; }
  /* The one field the pillars ask for beyond the moment. Bounded: a `select`
     of three words does not become clearer for being a panel wide. */
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 26rem; }
  label :global(select) { color: var(--ink); }
  .result { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  table { width: 100%; min-width: max-content; max-width: 46rem; border-collapse: collapse; }
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
  @media (prefers-reduced-motion: reduce) {
    .result { transition: none; }
  }
</style>
