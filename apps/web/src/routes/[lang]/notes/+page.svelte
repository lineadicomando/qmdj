<script lang="ts">
  let { data } = $props();
  const t = $derived(data.t);
</script>

<svelte:head><title>{t('notes.title')}</title></svelte:head>

<article>
  <h1>{t('notes.title')}</h1>
</article>

<style>
  article { max-width: 38rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
</style>
