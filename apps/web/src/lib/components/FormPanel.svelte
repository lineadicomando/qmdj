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
     *
     * `null` where the fields already say it. On the consultation the panel
     * holds one thing the reader composes, under a label of its own, on a
     * page whose first line says what the whole of it is for — a heading over
     * that is a third way of saying the same thing, and it stands where the
     * question ought to be.
     */
    legend?: MessageKey | null;
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
  // not for the fields that produced it.
  // svelte-ignore state_referenced_locally
  let open = $state(!closable);
  let panel: HTMLElement | undefined = $state();
  let reopenButton: HTMLButtonElement | undefined = $state();

  /**
   * Withdrawing once the question has been asked.
   *
   * Called by the page on a submit that answered, and on nothing else. The
   * distinction is the whole of it: a panel that closed itself on every
   * *answer* would fight whoever was still editing, since stepping the moment
   * is an answer too. Closing on the *submit* follows the one gesture that
   * says the fields are done with.
   *
   * A submit that failed leaves it open, because what needs correcting is
   * inside — and the reader is not asked to reopen a panel to find out why
   * the page went red.
   *
   * Nothing is lost by closing: the fields are refilled from the address, so
   * reopening finds them exactly as they were sent.
   */
  export async function close(): Promise<void> {
    if (!closable || !open) return;

    open = false;
    await tick();
    // The fields are unmounted with the panel, and the focus was on the
    // button that submitted them: left alone it falls to the body, where a
    // screen reader loses its place and the keyboard starts again from the
    // top of the page. It moves to what replaced the fields — which is not
    // taking a focus from anywhere, since only a submit gets this far.
    reopenButton?.focus();
  }

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
      {#if legend}<h2>{t(legend)}</h2>{/if}
      {#if closable}
        <button type="button" onclick={() => (open = false)} aria-label={t('form.close')}>×</button>
      {/if}
    {:else}
      <div class="said">
        <button type="button" class="reopen" bind:this={reopenButton} onclick={reopen}>
          {t(reopenLabel)}
        </button>
        {#if summary}<div class="summary">{@render summary()}</div>{/if}
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
  /*
   * The panel is as wide as what it sits on, open or shut.
   *
   * It used to stop at 34rem while open and run the full width once closed,
   * which made the same box two different objects depending on its state —
   * and left the fields in a column while the answer under them used
   * everything. The width is the page's to decide; how the fields fill it is
   * theirs, and each of them lays out in as many columns as it is given room
   * for.
   */
  .panel {
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: var(--tint);
    padding: 1rem 1.1rem 1.2rem;
    margin-bottom: 2rem;
  }
  .panel.closed { padding: 0.5rem 0.8rem; }
  .bar {
    display: flex;
    align-items: baseline;
    gap: 0.4rem 1rem;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .said { display: flex; align-items: center; gap: 0.5rem 1rem; flex-wrap: wrap; }
  h2 { font-size: 0.9rem; font-weight: 400; color: var(--faint); margin: 0 0 0.2rem; }
  /* The × keeps the far end whether or not there is a heading to be spaced
     away from: `space-between` sends an only child to the near one. */
  .bar > button { margin-inline-start: auto; }
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
  .summary {
    margin: 0;
    color: var(--faint);
    font-size: 0.85em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  form { display: grid; gap: 0.9rem; margin-top: 0.6rem; }

  /*
   * On a narrow screen the panel is most of the page: the rule and the inset
   * that separate it from the answer cost more width than they are worth.
   */
  @media (max-width: 30rem) {
    .panel { padding: 0.8rem 0.7rem 0.9rem; margin-bottom: 1.4rem; }
    .panel.closed { padding: 0.5rem 0.6rem; }
  }

  /*
   * A form is not part of a document.
   *
   * Whatever is in here was a way of asking, and the sheet holds the answer:
   * fields, steppers and the buttons on the closed bar all print as furniture
   * around the one thing somebody wanted on paper. Anything the panel said
   * that belongs on the sheet — which instant, which place, which question —
   * is said again by the answer itself, and the pages see to that.
   */
  @media print {
    .panel { display: none; }
  }
</style>
