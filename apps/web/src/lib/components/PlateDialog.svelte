<!--
  The board for one hour of a scan, over the scan that found it.

  A reader who has found four candidate hours wants to look at each of them
  and still have the list. Sending them to the chart section for that costs
  the list, and coming back costs the whole interval a second time — so the
  board comes to the list instead.

  A modal, and a native `<dialog>` rather than a box made to look like one:
  the focus trap, the return of focus to the row that opened it, Escape, the
  inert page behind and the top layer are all the element's own, and every
  one of them is a thing hand-rolled overlays get wrong. It earns the
  interruption by taking the whole screen for a drawing that wants it — a
  pane above the list had to stay small enough to leave the list somewhere to
  be, and was neither one thing nor the other.

  What it does not hold — the palaces in full, the stepper, the form — is one
  link away, and that link is the whole point of `form.openChart`.
-->
<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import { sayFailure, type Failure } from '$lib/moment';

  interface Props {
    t: Translator;
    /** The hour this is the board of, said in words: it names the dialog. */
    heading: string;
    /** The drawing. */
    plate: string;
    /** The same chart as data, for what a drawing cannot carry. */
    chart: string;
    /** The whole section, for what this cannot carry. */
    href: string;
    /**
     * Called once the dialog has closed, however it was closed.
     *
     * Escape, the backdrop and the button all go through the element's own
     * `close`, so there is one way out and the page hears about all three.
     */
    onclosed: () => void;
  }

  let { t, heading, plate, chart, href, onclosed }: Props = $props();

  /** One `id` per instance, since the heading is what names the dialog. */
  const named = $props.id();

  let dialog: HTMLDialogElement | undefined = $state();

  /**
   * Mounting is opening: the page renders this only when there is an hour to
   * show, so there is no second state to keep in step with that one.
   *
   * `showModal` and not the `open` attribute — the attribute gives a dialog
   * that is merely visible, with no top layer, no backdrop, no focus trap and
   * no Escape. It looks the same and behaves like a div.
   */
  $effect(() => {
    if (dialog && !dialog.open) dialog.showModal();
  });

  /**
   * A click on the backdrop is a click on the dialog itself.
   *
   * The element has no padding of its own and its one child fills it, so
   * anything landing on the element landed outside the box — which is what a
   * reader means by clicking away from it.
   */
  function fromBackdrop(event: MouseEvent): void {
    if (event.target === dialog) dialog?.close();
  }

  /**
   * The data beside the picture.
   *
   * The rule the chart section states and this obeys: a drawing carries the
   * glyphs but not the warnings, so it is never shown on its own. The scan's
   * own row already says where the gates and stars stand; what is missing
   * from it is the ju and the patterns, and that is what this fetches.
   *
   * Asked for from the browser, not from `load`: the drawing beside it is an
   * `<img>` the browser fetches anyway, so there is nothing to be gained by
   * having the server wait on the same answer — and picking an hour must not
   * run the page's `load`, which would rescan the interval.
   */
  const asked = $derived(read(chart));

  async function read(from: string): Promise<any> {
    const response = await fetch(from);
    const body = await response.json();
    if (!response.ok) throw new Error(sayFailure(t, body as Failure));
    return body.chart;
  }

  /**
   * The drawing that is on screen, as against the one that was asked for.
   *
   * The same reason as in the chart section: `src` changes before a pixel of
   * the new picture exists, and the browser holds the old board up in the
   * meantime with nothing to say it is last question's answer. It happens
   * here too, since choosing another hour redraws this without closing it.
   */
  let drawn = $state('');
</script>

<script lang="ts" module>
  /**
   * How large the board is asked to be, kept for the page and not the dialog.
   *
   * Module scope on purpose. A reader who enlarged the board once did not
   * decide it about *that hour*; they decided it about their eyes and their
   * screen, and picking the next hour closes and reopens this component. Held
   * inside it, the choice would have to be made again at every hour — which
   * is the reading gesture this whole section is built around.
   *
   * Not written to the browser either: the appearance is the one thing this
   * site stores, the note says so by name, and a second key would be a second
   * promise for something a reader restates with one click.
   */
  let large = $state(false);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  class:large
  aria-labelledby={named}
  onclose={onclosed}
  onclick={fromBackdrop}
>
  <div class="box">
    <div class="head">
      <h2 id={named}>{heading}</h2>
      <!-- What the press will do, rather than what the state is: a label that
           changes says it in the reader's own language, where `aria-pressed`
           over a fixed word would say it twice and in neither. -->
      <button type="button" class="size" onclick={() => (large = !large)}>
        {t(large ? 'form.reduce' : 'form.enlarge')}
      </button>
      <button type="button" onclick={() => dialog?.close()} aria-label={t('form.close')}>×</button>
    </div>

    <img
      src={plate}
      alt=""
      width="640"
      height="640"
      class:settling={drawn !== plate}
      onload={() => (drawn = plate)}
    />

    <div class="said">
      {#await asked}
        <p class="note">{t('form.working')}</p>
      {:then found}
        <p class="ju">
          {found.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')}
          {found.ju.number} · {t(`label.yuan.${found.ju.yuan}` as MessageKey)}
        </p>

        {#if found.patterns.length > 0}
          <ul class="patterns">
            {#each found.patterns as pattern}
              <li>
                {t(`label.pattern.${pattern.id}` as MessageKey)}
                {#if pattern.palace}— {pattern.palace}{/if}
                <span class="glyph">{pattern.hanzi}</span>
              </li>
            {/each}
          </ul>
        {/if}
      {:catch failure}
        <p class="failure" role="alert">{failure.message}</p>
      {/await}

      <a class="whole" {href}>{t('form.openChart')}</a>
    </div>
  </div>
</dialog>

<style>
  /*
   * As large as the screen allows, and no larger than the drawing needs.
   *
   * The board is the content and it is square: given the width of a desktop
   * it would stand taller than the window, so the height is what bounds it
   * and the width follows. Tall enough to scroll on a phone in landscape,
   * where the patterns go below the fold and the box carries them.
   */
  dialog {
    /* No padding: the backdrop test in `fromBackdrop` is that a click landed
       on the element and not on its child, and padding is element. */
    padding: 0;
    border: 1px solid var(--rule);
    border-radius: 8px;
    /* The top layer inherits custom properties, but the UA stylesheet sets
       the two that matter, so they are said again here. */
    background: var(--tint);
    color: var(--ink);
    max-inline-size: min(94vw, 34rem);
    max-block-size: 90vh;
    overflow: auto;
    overscroll-behavior: contain;
  }
  dialog::backdrop { background: rgb(0 0 0 / 0.55); }
  /*
   * The page behind does not scroll while it cannot be read.
   *
   * `showModal` makes what is behind inert to the pointer and the keyboard,
   * but not to the wheel: without this, scrolling over the backdrop moved the
   * list under a board that stayed put.
   */
  :global(html:has(dialog[open])) { overflow: hidden; }

  /*
   * Larger, which on a landscape screen means beside and not below.
   *
   * The board came out at 513 pixels on a window 900 tall, and the height was
   * not what stopped it: everything was in one column, so the drawing was
   * bounded by a reading measure while a third of the window went unused. The
   * height is the budget worth spending on a square, and the way to spend it
   * is to move the words alongside. Two hundred pixels of chart, which is the
   * difference between reading 值符 and recognising it.
   *
   * The two sizes are declared as the two budgets rather than as a number:
   * whichever of the window's dimensions runs out first is the one that
   * decides, and neither of them is knowable from here.
   */
  dialog.large { max-inline-size: 96vw; }

  .box { display: grid; gap: 0.7rem; padding: 0.8rem 0.9rem 1rem; }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    /* Two buttons at the right end and the heading at the left, whatever the
       box does with its columns below. */
    grid-column: 1 / -1;
  }
  h2 { font-size: 0.9rem; font-weight: 400; margin: 0; margin-inline-end: auto; }
  .said { display: grid; gap: 0.7rem; align-content: start; }
  /* Where there is room for a column of words beside a square. Below this the
     enlargement is the width of the window and nothing else, which on a phone
     the dialog already had. */
  @media (min-width: 56rem) {
    dialog.large .box { grid-template-columns: minmax(0, 1fr) minmax(13rem, 17rem); }
    dialog.large img {
      inline-size: min(calc(96vw - 21rem), calc(90vh - 5rem));
      block-size: auto;
      max-inline-size: 100%;
      justify-self: center;
    }
  }
  .head button {
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    font: inherit;
    padding: 0 0.2rem;
  }
  .head button:hover { color: var(--ink); background: none; }
  /* A word, not a glyph: nobody operates a control whose face they cannot
     read, and ⤢ is a face. Set as the links are, since that is what it is. */
  .size { font-size: 0.85em; text-decoration: underline; text-underline-offset: 0.2em; }
  /*
   * Where there is nothing left to give, nothing offers to give it.
   *
   * The reading measure that bounds the box is 34rem, and below a window of
   * about forty the 94vw beside it is already the smaller of the two: the
   * dialog is as wide as the screen allows before anybody asks. A control
   * that visibly does nothing teaches a reader that it is broken, which is
   * worse than not having one.
   */
  @media (max-width: 42rem) {
    .size { display: none; }
  }
  img { display: block; width: 100%; height: auto; transition: opacity 0.15s ease-out; }
  .settling { opacity: 0.35; }
  @media (prefers-reduced-motion: reduce) {
    img { transition: none; }
  }
  .ju { margin: 0; font-size: 0.95em; }
  .note, .failure { margin: 0; font-size: 0.85em; }
  .note { color: var(--faint); }
  .failure { color: var(--alarm); }
  .patterns { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.2rem; font-size: 0.85em; }
  .glyph { margin-left: 0.4rem; color: var(--faint); font-size: 0.9em; }
  .whole { color: var(--faint); font-size: 0.85em; justify-self: start; }
</style>
