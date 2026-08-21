<!--
  The button that asks, and says what state the asking is in.

  Three states and not four: something is still missing, or the form is ready,
  or the answer is on its way. "Inactive" and "pressable" are the same state
  seen twice.

  None of the three is told by colour alone. A tint is invisible to a screen
  reader, and to enough of the people who can see it that a form which relies
  on it has no fallback; so weight carries the difference — filled when ready,
  outlined and dashed while something is missing — and the reason is written
  out beside it either way.

  It also stays pressable while something is missing. A dead button that will
  not say what it is waiting for leaves the reader with nowhere to go, whereas
  a form that is sent incomplete answers with the same sentence the button was
  already showing.
-->
<script lang="ts">
  import type { MessageKey, Translator } from '@shipan/i18n';

  interface Props {
    t: Translator;
    /** What the button asks for — the name of the answer, not "submit". */
    label: MessageKey;
    /** The answer is on its way. */
    busy?: boolean;
    /**
     * What the form is still waiting for, as a sentence.
     *
     * Undefined means ready. Not every form has such a state: a Qi Men chart
     * of no date is the chart of now, so nothing there can be missing.
     */
    needed?: MessageKey;
    /**
     * There is already an answer in hand, and this is no longer the thing to
     * press.
     *
     * The fourth state, and it exists in one place: where a form has produced
     * something and what to do with that something is the button beside this
     * one. Filled, it would go on claiming an attention it has spent.
     */
    quiet?: boolean;
  }

  let { t, label, busy = false, needed, quiet = false }: Props = $props();

  const id = $props.id();
</script>

<div class="ask">
  <button
    type="submit"
    class:ready={!needed && !quiet}
    class:quiet
    disabled={busy}
    aria-busy={busy}
    aria-describedby={needed ? id : undefined}
  >
    {busy ? t('form.working') : t(label)}
  </button>
  {#if needed}<p class="needed" {id}>{t(needed)}</p>{/if}
</div>

<style>
  .ask { display: grid; gap: 0.35rem; justify-items: start; }
  button {
    font: inherit;
    padding: 0.45rem 1.2rem;
    cursor: pointer;
    border: 1px dashed var(--rule);
    color: var(--faint);
    background: var(--ground);
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  /* Filled: the one thing on the panel that is meant to be pressed. */
  .ready {
    border: 1px solid var(--ink);
    background: var(--ink);
    color: var(--ground);
  }
  .ready:hover { background: var(--faint); border-color: var(--faint); }
  /* Spent, not disabled: still pressable, and still the way to ask again. */
  .quiet {
    border-style: solid;
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
  }
  .quiet:hover { color: var(--ink); border-color: var(--edge); }
  button:disabled { cursor: progress; opacity: 0.65; }
  .needed { margin: 0; font-size: 0.8em; color: var(--faint); }
</style>
