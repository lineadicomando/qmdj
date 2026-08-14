<!--
  What there is to do with an answer, on the bar the fields leave behind.

  One component for the sections that have anything: the chart, the board, and
  the consultation. Kept together and kept in one place because a pair of
  buttons duplicated across three pages is three things to hold in step, and
  because where they *are* is part of what they are — top right of the bar,
  the same corner in every section, so that finding them once is finding them
  everywhere.

  Each carries a mark and its word. The mark is what makes the pair findable
  at a glance; the word is what makes it usable by somebody who has not
  learned the mark yet. See `Icon.svelte` for why neither travels alone.
-->
<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import CopyText from './CopyText.svelte';
  import PrintButton from './PrintButton.svelte';

  interface Props {
    t: Translator;
    /** What the copy button offers, and where it fetches from. */
    copyLabel?: MessageKey;
    copyUrl?: string;
    /** Appended in the browser, because a question must not travel. */
    copySuffix?: string;
    /** Whether copying is the one thing anybody came to press. */
    lead?: boolean;
    print?: boolean;
  }

  let { t, copyLabel, copyUrl, copySuffix, lead = false, print = true }: Props = $props();
</script>

<div class="takeaway">
  {#if copyLabel && copyUrl}
    <CopyText {t} label={copyLabel} url={copyUrl} suffix={copySuffix} {lead} />
  {/if}
  {#if print}<PrintButton {t} />{/if}
</div>

<style>
  .takeaway {
    display: flex;
    align-items: baseline;
    gap: 0.2rem 0.8rem;
    flex-wrap: wrap;
    /* Pushed to the far end of the bar it is handed to, which is the corner
       it keeps in every section. */
    margin-inline-start: auto;
  }
  /* The pair does not print itself: a sheet with a print button on it is a
     sheet that was made by pressing one. */
  @media print {
    .takeaway { display: none; }
  }
</style>
