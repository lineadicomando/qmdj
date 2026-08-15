<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import BaziReading from '$lib/components/BaziReading.svelte';
  import CalendarAndAlmanac from '$lib/components/CalendarAndAlmanac.svelte';
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
</script>

<svelte:head><title>{t('cli.heading.pillars')}</title></svelte:head>

<!-- Named, not shown: the nav says which section this is — see `.offscreen`. -->
<h1 class="offscreen">{t('cli.heading.pillars')}</h1>

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
    <!-- The four pillars at a glance, then the same four read out in full. -->
    <PillarPlate pillars={result.bazi.pillars} {t} />
    <BaziReading bazi={result.bazi} {t} />

    <!--
      The calendar the pillars were cast from, and here the case is stronger
      than on the chart: there the term decides the ju, here the 節 decides one
      of the four columns above it. A birth three hours from 立秋 stood on a
      boundary, and until this line the page gave no sign of it.

      Without the almanac, and that is the component's own rule rather than an
      exception to it — see `CalendarAndAlmanac`. 曆注 weighs a day as the
      occasion of an undertaking; a birth is not one, and beside pillars read
      as a person the page would be read as a remark about the person.

      On the axis the reading is on, and that is why it is wrapped rather than
      set here as a sibling: it is the last thing under the plate, and one
      block of the three left at the margin is the one the eye reads as
      dropped. The component carries no measure of its own — it is laid out by
      whatever holds it, on the chart at the full width of the page — so the
      measure is the caller's to give.
    -->
    <div class="words">
      <CalendarAndAlmanac moment={result.moment} {t} almanac={false} />
    </div>
  </div>
{/if}

<style>
  /* What is read *off* the pillars is dressed in `BaziReading`, which is where
     that markup went: a style left behind here would be one nobody could find
     from the thing it styles. */
  /* The one field the pillars ask for beyond the moment. Bounded: a `select`
     of three words does not become clearer for being a panel wide. */
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 26rem; }
  label :global(select) { color: var(--ink); }
  /* The reading's own measure, named again here because the calendar under it
     is a component and takes the width it is handed. `BaziReading` holds the
     other copy; they are one axis and have to move together. */
  .words { max-width: 46rem; margin-inline: auto; }
  .result { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  .failure { color: var(--alarm); }
  @media (prefers-reduced-motion: reduce) {
    .result { transition: none; }
  }
</style>
