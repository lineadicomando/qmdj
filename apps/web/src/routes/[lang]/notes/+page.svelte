<script lang="ts">
  let { data } = $props();
  const t = $derived(data.t);
</script>

<svelte:head><title>{t('notes.title')}</title></svelte:head>

<article>
  <h1>{t('notes.title')}</h1>
  <p>{t('notes.interpretation')}</p>
  <p>{t('notes.method')}</p>
  <p>{t('notes.certainty')}</p>
  <p>{t('notes.script')}</p>
</article>

<style>
  article { max-width: 38rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
  p { margin: 1rem 0; }
</style>
