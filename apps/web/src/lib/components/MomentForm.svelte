<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import type { Location } from '$lib/moment';
  import LocationSearch from './LocationSearch.svelte';

  import { METHODS } from '$lib/vocabulary';

  let {
    t,
    date = $bindable(''),
    time = $bindable(''),
    place = $bindable<Location | undefined>(undefined),
    trueSolarTime = $bindable(true),
    dayBoundary = $bindable('zishi'),
    method = $bindable<string | undefined>(undefined),
  }: {
    t: Translator;
    date?: string;
    time?: string;
    place?: Location | undefined;
    trueSolarTime?: boolean;
    dayBoundary?: string;
    /** Bound only where a ju is cast: the pillars have no method to choose. */
    method?: string | undefined;
  } = $props();
</script>

  <!-- The three things asked of every moment, side by side where there is
       room for three and stacked where there is not. -->
  <div class="row">
    <label>
      {t('cli.column.day')}
      <!-- ISO whatever the locale: a shared address must mean one thing. -->
      <input type="date" bind:value={date} />
    </label>
    <label>
      {t('cli.column.hour')}
      <input type="time" bind:value={time} />
    </label>
    <LocationSearch {t} bind:selected={place} />
  </div>

  <details>
    <!-- A label, not the note: what a disclosure is called has to say what
         opening it offers. The note is information, and it belongs inside
         with the options it is about. -->
    <summary>{t('form.options')}</summary>
    <label class="check">
      <input type="checkbox" bind:checked={trueSolarTime} />
      {t('form.trueSolarTime')}
    </label>
    <label>
      {t('form.dayBoundary')}
      <!-- The values are the engine's and do not change; what is shown says
           which hour each one is, for a reader who has never met 子時. -->
      <select bind:value={dayBoundary}>
        <option value="zishi">{t('form.dayBoundary.zishi')}</option>
        <option value="midnight">{t('form.dayBoundary.midnight')}</option>
      </select>
    </label>
    {#if method !== undefined}
      <label>
        {t('form.method')}
        <!-- The word leads and the method's own name follows with its hanzi:
             the thing named is Chinese, the choice must be readable without. -->
        <select bind:value={method}>
          {#each METHODS as id}
            <option value={id}>{t(`form.method.${id}` as MessageKey)}</option>
          {/each}
        </select>
      </label>
      <p class="note">{t('cli.note.method', { method: method ?? 'chaibu' })}</p>
    {/if}
  </details>

<style>
  /*
   * As many columns as there is room for, and no breakpoint anywhere.
   *
   * `auto-fit` asks the row how much room it was given rather than asking the
   * screen how wide it is: the same three fields come out in three columns on
   * a page, in two on a tablet and in one on a phone, and the panel they sit
   * in is free to be any width without this having to know.
   */
  /*
   * The bound is on the row and not on the column, and it has to be.
   *
   * The three of them shared whatever the panel had, so on a wide page a field
   * for a date came out twenty rems long — a box the width of a sentence
   * holding eight characters, which reads as a mistake and is one. But capping
   * the *track* caps it on a phone too, and there a field narrower than the
   * screen is the mistake in the other direction. Capping the row leaves the
   * columns at `1fr`: they still divide whatever they are given, and what they
   * are given stops at a width three fields can honestly use.
   *
   * `min-inline-size: 0` is not hygiene here, it is what makes the cap safe.
   * `auto-fit` counts its repetitions against the available space, and where
   * that space is indefinite — which is exactly what sizing this row as an
   * item of the form's own grid asks for — it counts them against the
   * `max-width` instead. So the row's minimum became three whole columns, and
   * on a phone it carried the fields off the right of the screen. At zero the
   * minimum is the container's, and `auto-fit` settles on the one column that
   * fits.
   */
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: 0.9rem;
    max-width: 46rem;
    min-inline-size: 0;
  }
  /* Each field keeps its own height and hangs from the top of the row: a
     chosen place makes the row taller, and stretching would push the fields
     beside it down along with it. */
  .row > :global(*) { align-self: start; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  label :global(input), label :global(select) { color: var(--ink); }
  .check { display: flex; gap: 0.45rem; align-items: center; }
  summary { cursor: pointer; color: var(--faint); font-size: 0.85em; }
  details { display: grid; gap: 0.6rem; }
  /* The options are read, not filled in: a line of prose stays a line the eye
     can come back from, however wide the panel is. */
  details label:not(.check) { max-width: 26rem; }
  .note { margin: 0; color: var(--faint); font-size: 0.8em; max-width: 42rem; }
</style>
