<!--
  What happens when a board is handed to a model.

  The second written page, and the one whose subject is not the engine but what
  leaves it. `docs/readings.md` is where the argument lives; this is what a
  reader who has just pressed a button that fills their clipboard is owed —
  what the prompt commissions, what it forbids, and what never left their
  browser at all.
-->
<script lang="ts">
  import WrittenNotes from '$lib/components/WrittenNotes.svelte';
  import { READINGS } from '$lib/notes';

  let { data } = $props();
  const t = $derived(data.t);
</script>

<svelte:head><title>{t('notes.readings.title')}</title></svelte:head>

<article>
  <h1>{t('notes.readings.title')}</h1>
  <p class="lead">{t('notes.readings.lead')}</p>
  <p class="lead">{t('notes.readings.computed')}</p>

  <WrittenNotes {t} entries={READINGS} />
</article>

<style>
  article { max-width: 44rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
  .lead { margin: 1rem 0; max-width: 40rem; }
</style>
