<!--
  A written page of the notes: entries somebody keeps, each showing the day it
  was last held against the engine.

  The two written pages differ in one thing only — whether an entry names who
  asks for it — so they are one component and a flag rather than two files that
  would drift apart in their spacing and agree in nothing else. A refusal is
  worth stating together with who wants it, because a reader who came looking
  for the thing that is missing should meet themselves in the entry; a rule
  about handing a board to a model is nobody's request.

  **The date is the point of the whole arrangement.** It is shown, not filed:
  a paragraph carrying the day it was last checked is a weaker claim than one
  that does not, and weaker is what a written page should be beside the two
  derived ones. See `docs/notes.md`.
-->
<script lang="ts">
  import type { Translator } from '@shipan/i18n';
  import type { WrittenEntry } from '$lib/notes';

  interface Props {
    t: Translator;
    entries: readonly WrittenEntry[];
  }

  let { t, entries }: Props = $props();

  /**
   * The day, in the reader's own calendar conventions.
   *
   * `dateStyle: 'long'` rather than a bare ISO string: the date is addressed
   * to a person weighing how stale a paragraph is, and `2026-08-22` is a
   * format for a machine. `T00:00` keeps it on the day it says — a bare
   * `new Date('2026-08-22')` is midnight UTC, which is the day before in every
   * zone west of Greenwich.
   */
  const said = (iso: string): string =>
    new Intl.DateTimeFormat(t.locale, { dateStyle: 'long' }).format(new Date(`${iso}T00:00`));
</script>

{#each entries as entry (entry.id)}
  <section>
    <h2>{t(entry.title)}</h2>
    {#if entry.asks}
      <p class="asked">
        <span class="label">{t('notes.askedBy')}</span>
        {t(entry.asks)}
      </p>
    {/if}
    <p>{t(entry.body)}</p>
    <p class="checked">{t('notes.checked', { date: said(entry.checked) })}</p>
  </section>
{/each}

<style>
  section { margin-top: 2.2rem; max-width: 40rem; }
  h2 { margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 500; }
  p { margin: 0.6rem 0; }
  .asked { color: var(--faint); font-size: 0.9rem; }
  .label { text-transform: lowercase; }
  /*
   * Quiet, and under the paragraph it qualifies rather than beside the
   * heading: it is not what the entry is about, it is how much of it to
   * believe today.
   */
  .checked { color: var(--faint); font-size: 0.8rem; }

  @media print {
    section { break-inside: avoid; }
    .asked, .checked { color: var(--ink); }
  }
</style>
