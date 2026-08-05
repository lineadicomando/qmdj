<!--
  Stepping the moment without reopening the form.

  The chart people spend time with is the one of the present, and what they do
  with it is move it: the next double hour, the same hour tomorrow, this hour
  a year ago. Reopening the panel and typing a date for each of those makes
  the movement not worth making, so the steps live beside the answer instead
  of inside the form.

  The double hour is here because a 時家 chart changes with it and with
  nothing smaller: day, month and year at a fixed clock time all leave the
  chart in the same 時辰.

  Each step shows the value it stands at, with its name under it. The value
  alone would be a row of bare numbers, and nothing would say what the `+`
  next to a 5 adds; the name alone was what this said before, and it left the
  reader to hold the date in their head while stepping it. Both, and the row
  reads as the moment it is stepping — which is why they run from the year
  down to the hour, the order a date is written in.

  The names are in the reader's language: these are controls and not output,
  and a button whose face is a glyph asks the reader to already know what it
  does. 時辰 keeps its hanzi beside the word because it is the one unit here
  that names something Chinese — a day, a month and a year are the civil
  calendar's, and each already has a word in every language this speaks.
-->
<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import type { Unit } from '$lib/step';

  interface Props {
    t: Translator;
    onstep: (unit: Unit, by: number) => void;
    /** Back to the present, which the address says by saying nothing. */
    onnow: () => void;
    /**
     * Where each unit stands, as it is written.
     *
     * The value, not a rendering of it: `2026`, `08`, `14:30`. Absent before
     * there is a moment to be at, and then the names stand alone.
     */
    values?: Partial<Record<Unit, string>>;
    disabled?: boolean;
  }

  let { t, onstep, onnow, values, disabled = false }: Props = $props();

  const UNITS: readonly { unit: Unit; hanzi?: string }[] = [
    { unit: 'year' },
    { unit: 'month' },
    { unit: 'day' },
    { unit: 'shichen', hanzi: '時辰' },
  ];
</script>

<div class="steps">
  {#each UNITS as { unit, hanzi } (unit)}
    <span class="unit">
      <button
        type="button"
        {disabled}
        aria-label={t(`step.${unit}.back` as MessageKey)}
        title={t(`step.${unit}.back` as MessageKey)}
        onclick={() => onstep(unit, -1)}>−</button
      >
      <span class="at">
        {#if values?.[unit]}<span class="value">{values[unit]}</span>{/if}
        <span class="name">
          {t(`step.${unit}` as MessageKey)}
          {#if hanzi}<span class="glyph" aria-hidden="true">{hanzi}</span>{/if}
        </span>
      </span>
      <button
        type="button"
        {disabled}
        aria-label={t(`step.${unit}.forward` as MessageKey)}
        title={t(`step.${unit}.forward` as MessageKey)}
        onclick={() => onstep(unit, 1)}>+</button
      >
    </span>
  {/each}

  <button type="button" class="now" {disabled} title={t('step.now.title')} onclick={onnow}>
    {t('step.now')}
  </button>
</div>

<style>
  .steps {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem 0.8rem;
    font-size: 0.85em;
  }
  .unit { display: inline-flex; align-items: center; gap: 0.1rem; }
  /* The value leads and the name explains it, so they stack rather than run
     on: a name beside a number would read as part of it. */
  .at {
    display: grid;
    justify-items: center;
    line-height: 1.15;
    /* The row must not shift sideways as the numbers under it change. */
    min-width: 3.4em;
    padding-inline: 0.15rem;
  }
  .value { color: var(--ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .name { color: var(--faint); font-size: 0.78em; white-space: nowrap; }
  .glyph { opacity: 0.75; }
  button {
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    font: inherit;
    /* A target a thumb can find, where these are the whole point. */
    min-width: 2.5rem;
    min-height: 2.25rem;
    padding: 0.2rem;
    line-height: 1.2;
    border-radius: 4px;
  }
  /* `--ground` and not `--tint`: the closed panel is already tinted, so the
     usual hover would be invisible exactly where these buttons live. */
  button:hover:not(:disabled), button:focus-visible { color: var(--ink); background: var(--ground); }
  button:disabled { cursor: default; opacity: 0.5; }
  .now { color: var(--ink); min-width: 0; padding-inline: 0.6rem; }
</style>
