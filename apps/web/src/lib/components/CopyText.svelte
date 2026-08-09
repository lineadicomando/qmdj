<!--
  A button that puts something of the server's making into the clipboard.

  Three of them exist — the chart as words, a prompt for a question, a prompt
  for a chart of a birth — and they differ only in an address and a label. The
  three ways of not working are the same for all of them, so they are handled
  once, here: the request can fail, the clipboard can refuse, and both have to
  be said rather than left to be discovered by pasting.

  `suffix` is the one thing the browser adds to what the server built. It is
  the question, and it is appended here because a question is somebody's own
  and a query string is written into every log along the way.
-->
<script lang="ts">
  import { Copier, fetchText } from '$lib/copy.svelte';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  interface Props {
    t: Translator;
    /** What the button offers, before it has been pressed. */
    label: MessageKey;
    url: string;
    /** Added to what came back, on its own line. */
    suffix?: string;
    /** Whether this is the one thing on the block anybody came to press. */
    lead?: boolean;
  }

  let { t, label, url, suffix, lead = false }: Props = $props();

  const copier = new Copier();

  async function produce(): Promise<string> {
    const text = await fetchText(url);
    return suffix ? `${text}${suffix}\n` : text;
  }
</script>

<div class="copy">
  <!-- `aria-live` on the button itself: the confirmation is the button
       changing its word, and whoever cannot see it has to be told. -->
  <button
    type="button"
    class:lead
    onclick={() => copier.run(produce)}
    disabled={copier.busy}
    aria-live="polite"
  >
    {copier.busy ? t('form.copying') : copier.copied ? t('form.copied') : t(label)}
  </button>

  {#if copier.failed}<p class="failure" role="alert">{t('form.copyUnread')}</p>{/if}

  {#if copier.fallback}
    <p class="note">{t('form.copyFailed')}</p>
    <textarea readonly rows="8" aria-label={t('form.copyFallback')}>{copier.fallback}</textarea>
  {/if}
</div>

<style>
  .copy { display: grid; justify-items: start; gap: 0.4rem; }
  /* Lighter than anything that asks for a calculation: found, not noticed. */
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
  .lead { color: var(--ink); border-color: var(--edge); }
  .failure { color: var(--alarm); margin: 0; font-size: 0.85rem; }
  .note { margin: 0; font-size: 0.8rem; color: var(--faint); max-width: 62ch; }
  textarea {
    width: 100%;
    padding: 0.5rem;
    background: var(--tint);
    color: var(--ink);
    border: 1px solid var(--rule);
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
  }
</style>
