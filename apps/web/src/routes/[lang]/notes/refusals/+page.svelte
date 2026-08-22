<!--
  What is deliberately not computed, one entry each.

  Written and not derived, which is the honest side of the line here: none of
  this moves when a board lands. A refusal is one of the few things in this
  project that can be written once and stay true — which is what makes it the
  right tenant of a page somebody has to keep.

  It is `docs/refusals.md` condensed and not copied. That file argues each
  refusal for a reader of the repository, with the sources it declines and the
  code that enforces it; this says what is refused, who wants it, and why it is
  not here, to somebody who has just met a board and is looking for the thing
  that is missing from it.
-->
<script lang="ts">
  import WrittenNotes from '$lib/components/WrittenNotes.svelte';
  import { REFUSALS } from '$lib/notes';

  let { data } = $props();
  const t = $derived(data.t);
</script>

<svelte:head><title>{t('notes.refusals.title')}</title></svelte:head>

<article>
  <h1>{t('notes.refusals.title')}</h1>
  <p class="lead">{t('notes.refusals.lead')}</p>
  <!-- The distinction the whole page rests on: an attribute of a configuration
       travels, an answer to somebody's situation does not. -->
  <p class="lead">{t('notes.refusals.carries')}</p>

  <WrittenNotes {t} entries={REFUSALS} />
</article>

<style>
  article { max-width: 44rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
  .lead { margin: 1rem 0; max-width: 40rem; }
</style>
