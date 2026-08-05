<!--
  The panel of fields, which withdraws once it has done its job.

  A chart wants the whole width and the fields are read once; leaving them
  open pushes the thing the person came for below the fold. So the panel is a
  box of its own — ruled, tinted, clearly not part of the answer — and it
  folds away as soon as there is an answer to make room for.
-->
<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  interface Props {
    t: Translator;
    /**
     * What the panel holds, and what reopening it offers.
     *
     * Two sections ask for a moment and one asks for an interval, and
     * "Change the moment" over a pair of dates names the wrong thing. A
     * disclosure has to say what opening it gives you.
     */
    legend?: MessageKey;
    reopenLabel?: MessageKey;
    /**
     * Whether there is anything below for a closed panel to make room for.
     *
     * False before the first result: folding away would leave a strip hanging
     * over an empty page.
     */
    closable?: boolean;
    onsubmit: (event: SubmitEvent) => void;
    /** The fields, which withdraw. */
    fields: Snippet;
    /** What stays visible when it is closed. */
    summary?: Snippet;
    /**
     * What can still be done with the fields closed.
     *
     * Not every section has any: a moment of birth is one moment, and only a
     * chart of the present is worth moving.
     */
    controls?: Snippet;
  }

  let {
    t,
    legend = 'form.legend',
    reopenLabel = 'form.open',
    closable = false,
    onsubmit,
    fields,
    summary,
    controls,
  }: Props = $props();

  // Open unless there is already an answer, which there is when the address
  // carried one: someone who followed a link to a chart came for the chart,
  // not for the fields that produced it. The initial value is the whole
  // point — a panel that closed itself on every answer would fight whoever
  // was still editing.
  // svelte-ignore state_referenced_locally
  let open = $state(!closable);
  let panel: HTMLElement | undefined = $state();

  async function reopen(): Promise<void> {
    open = true;
    // Bring the fields back into view: a panel that reopens above the fold
    // looks to the reader as though the button did nothing.
    await tick();
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<section class="panel" class:closed={!open} bind:this={panel}>
  <div class="bar">
    {#if open}
      <h2>{t(legend)}</h2>
      {#if closable}
        <button type="button" onclick={() => (open = false)} aria-label={t('form.close')}>×</button>
      {/if}
    {:else}
      <div class="said">
        <button type="button" class="reopen" onclick={reopen}>{t(reopenLabel)}</button>
        {#if summary}<p class="summary">{@render summary()}</p>{/if}
      </div>
      {#if controls}{@render controls()}{/if}
    {/if}
  </div>

  {#if open}
    <form {onsubmit}>
      {@render fields()}
    </form>
  {/if}
</section>

<style>
  .panel {
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: var(--tint);
    padding: 1rem 1.1rem 1.2rem;
    margin-bottom: 2rem;
    max-width: 34rem;
  }
  .panel.closed { padding: 0.5rem 0.8rem; max-width: none; }
  .bar {
    display: flex;
    align-items: baseline;
    gap: 0.4rem 1rem;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .said { display: flex; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
  h2 { font-size: 0.9rem; font-weight: 400; color: var(--faint); margin: 0 0 0.2rem; }
  .bar button {
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    font: inherit;
    padding: 0 0.2rem;
  }
  .bar button:hover { color: var(--ink); background: none; }
  .reopen { text-decoration: underline; text-underline-offset: 0.2em; }
  .summary { margin: 0; color: var(--faint); font-size: 0.85em; }
  form { display: grid; gap: 0.9rem; margin-top: 0.6rem; }
</style>
