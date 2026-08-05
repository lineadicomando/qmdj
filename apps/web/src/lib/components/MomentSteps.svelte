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

  Each step is named by its word, in the reader's language. These are controls
  and not output: a button whose face is a glyph asks the reader to already
  know what it does, and the person this is for is learning the subject, not
  reciting it. 時辰 keeps its hanzi beside the word because it is the one unit
  here that names something Chinese — a day, a month and a year are the civil
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
    disabled?: boolean;
  }

  let { t, onstep, onnow, disabled = false }: Props = $props();

  const UNITS: readonly { unit: Unit; hanzi?: string }[] = [
    { unit: 'shichen', hanzi: '時辰' },
    { unit: 'day' },
    { unit: 'month' },
    { unit: 'year' },
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
      <span class="name">
        {t(`step.${unit}` as MessageKey)}
        {#if hanzi}<span class="glyph" aria-hidden="true">{hanzi}</span>{/if}
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
    gap: 0.15rem 0.9rem;
    font-size: 0.85em;
  }
  .unit {
    display: inline-flex;
    align-items: baseline;
    gap: 0.15rem;
  }
  .name { color: var(--faint); white-space: nowrap; }
  .glyph { font-size: 0.9em; opacity: 0.75; }
  button {
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    font: inherit;
    /* Wide enough to hit on a touch screen, where these are the whole point. */
    min-width: 1.9em;
    padding: 0.2rem 0.2rem;
    line-height: 1.2;
    border-radius: 4px;
  }
  /* `--ground` and not `--tint`: the closed panel is already tinted, so the
     usual hover would be invisible exactly where these buttons live. */
  button:hover:not(:disabled), button:focus-visible { color: var(--ink); background: var(--ground); }
  button:disabled { cursor: default; opacity: 0.5; }
  .now { color: var(--ink); min-width: 0; padding-inline: 0.5rem; }
</style>
