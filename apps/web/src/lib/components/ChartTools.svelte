<!--
  What to do with the chart besides look at it.

  One control so far, and it is the plain one: the chart as words, in the form
  the terminal prints, for a notebook or a message. It stands apart from the
  prompt below it on purpose — that one is an offer to hand this to a model,
  and somebody who wants nothing to do with a model would find the plain text
  buried inside it.
-->
<script lang="ts">
  import { Copier, fetchText } from '$lib/copy.svelte';
  import type { Translator } from '@qimendunjia/i18n';

  interface Props {
    t: Translator;
    /** The chart's query string, which the endpoints read exactly as the page does. */
    query: string;
  }

  let { t, query }: Props = $props();

  const copier = new Copier();
</script>

<div class="tools">
  <!-- `aria-live` on the button itself: the confirmation is the button
       changing its word, and whoever cannot see it has to be told. -->
  <button
    type="button"
    onclick={() => copier.run(() => fetchText(`/api/chart/text?${query}`))}
    disabled={copier.busy}
    aria-live="polite"
  >
    {copier.busy ? t('form.copying') : copier.copied ? t('form.copied') : t('form.copyChart')}
  </button>
</div>

{#if copier.failed}<p class="failure" role="alert">{t('form.copyUnread')}</p>{/if}

{#if copier.fallback}
  <p class="note">{t('form.copyFailed')}</p>
  <textarea readonly rows="8" aria-label={t('form.copyFallback')}>{copier.fallback}</textarea>
{/if}

<style>
  .tools { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
  /* Lighter than anything that asks for a calculation: these are found, not
     noticed, and nobody arrived here to press one. */
  button {
    font: inherit;
    font-size: 0.8rem;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    border: 1px solid var(--rule);
    background: none;
    color: var(--faint);
  }
  button:hover:not(:disabled) { color: var(--ink); border-color: var(--edge); }
  button:disabled { cursor: progress; opacity: 0.6; }
  .failure { color: var(--alarm); margin: 0.5rem 0 0; font-size: 0.85rem; }
  .note { margin: 0.5rem 0 0; font-size: 0.8rem; color: var(--faint); max-width: 62ch; }
  textarea {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--tint);
    color: var(--ink);
    border: 1px solid var(--rule);
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
  }
</style>
