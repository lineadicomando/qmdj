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

  It holds **the whole reading**, and it used to offer a link to the chart
  section for the rest of it. The link was answering with a page load for
  something already in hand: `/api/chart` comes back with the nine palaces
  whether or not anybody reads them, and this asked for it anyway to get the
  ju and the configurations. So the palaces are shown, and the round trip out
  to the chart section and back is gone — along with the way back it needed at
  the far end, and with the scan's parameters that used to ride in a chart's
  address to make that way back possible.

  Nothing shareable was lost with it: the open hour is `at` in the scan's own
  address, written by `pick`, and that is what somebody sends.

  What is genuinely gone is the stepper. From a scan there is no longer a way
  to the hour *next to* this one — which from a scan is nearly always in the
  list already, or absent because it answered no criterion.
-->
<script lang="ts">
  import type { Translator } from '@qimendunjia/i18n';
  import { sayFailure, type Failure } from '$lib/moment';
  import ChartReading from './ChartReading.svelte';
  import PalaceTable from './PalaceTable.svelte';
  import StrengthLegend from './StrengthLegend.svelte';

  interface Props {
    t: Translator;
    /** The hour this is the board of, said in words: it names the dialog. */
    heading: string;
    /** The drawing. */
    plate: string;
    /** The same chart as data, for everything a drawing cannot carry. */
    chart: string;
    /**
     * Called once the dialog has closed, however it was closed.
     *
     * Escape, the backdrop and the button all go through the element's own
     * `close`, so there is one way out and the page hears about all three.
     */
    onclosed: () => void;
  }

  let { t, heading, plate, chart, onclosed }: Props = $props();

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
   * own row says where the gates and stars stand in the *matched* palace;
   * this is the whole chart, which is what the answer already contained.
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
   *
   * **Open enlarged.** It began the other way round, when this held a drawing
   * and two lines and the small box was the whole of it. It now holds the
   * chart entire, and small that is one column: the board, then a long scroll
   * to reach the palaces. Enlarged on a wide window it is the board beside
   * the words, which is what somebody comparing hours is looking at. Below
   * 56rem the flag changes nothing anyway — there is no room for a second
   * column, and the button that sets it is not even drawn under 42rem.
   */
  let large = $state(true);
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
    <!-- Outside what scrolls, so the title and the way out of the dialog are
         still there at the foot of a long chart. -->
    <div class="head">
      <h2 id={named}>{heading}</h2>
      <!-- The window controls of every other window on the screen: corners
           opening outwards to enlarge, closing inwards to reduce, beside the
           × that closes. What the press will do, rather than what the state
           is — so the icon and the name it carries change together, where
           `aria-pressed` over a fixed one would say it twice and in neither.

           The name travels in `aria-label` and in `title`: the face is a
           picture, and a picture has to say what it is to a screen reader and
           to whoever hovers it before pressing. Drawn rather than typed —
           ⤢ is missing from most text faces and comes out a box. -->
      <button
        type="button"
        class="size"
        onclick={() => (large = !large)}
        aria-label={t(large ? 'form.reduce' : 'form.enlarge')}
        title={t(large ? 'form.reduce' : 'form.enlarge')}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          {#if large}
            <path d="M6.5 2.5v4h-4M9.5 2.5v4h4M9.5 13.5v-4h4M6.5 13.5v-4h-4" />
          {:else}
            <path d="M2.5 6.5v-4h4M13.5 6.5v-4h-4M13.5 9.5v4h-4M2.5 9.5v4h4" />
          {/if}
        </svg>
      </button>
      <button type="button" onclick={() => dialog?.close()} aria-label={t('form.close')}>×</button>
    </div>

    <!-- The one thing that scrolls. See the note on `.body` below. -->
    <div class="body">
      <!--
        The board and the key to its marks, as one item of the grid.

        Not two: enlarged, `.body` is two columns, and a legend placed on its
        own would be laid out beside the board with the reading pushed under
        both — a key to the marks in the next column over from them.
      -->
      <div class="board">
        <!-- A middling chart's shape, to reserve the box with. See the chart
             section, where the same attributes carry the same caveat. -->
        <img
          src={plate}
          alt=""
          width="900"
          height="1035"
          class:settling={drawn !== plate}
          onload={() => (drawn = plate)}
        />
        <StrengthLegend {t} />
      </div>

      {#await asked}
        <p class="note">{t('form.working')}</p>
      {:then found}
        <div class="said"><ChartReading chart={found} {t} palaces={false} /></div>
        <!--
          Under the board and across the whole dialog, never beside it. See
          the note on the two columns below.

          Two elements and not one, and the nesting is load-bearing. `.scroller`
          sets `overflow-x`, which makes the computed `overflow-y` a scroller
          too — and a scroll container contributes nothing to the size of the
          grid row it sits in, so as a grid item it came out exactly zero tall
          with a whole chart inside it. The grid gets a plain block; the block
          gets the frame that scrolls.
        -->
        <div class="palaces">
          <div class="scroller"><PalaceTable palaces={found.palaces} {t} /></div>
        </div>
      {:catch failure}
        <p class="failure" role="alert">{failure.message}</p>
      {/await}
    </div>
  </div>
</dialog>

<style>
  /*
   * As large as the screen allows, and no larger than the drawing needs.
   *
   * The board is the content and it is square — the picture around it is not,
   * since the list of configurations hangs below — so given the width of a
   * desktop it would stand taller than the window, and the height is what
   * bounds it while the width follows. Tall enough to scroll on a phone in
   * landscape, where the patterns go below the fold and the box carries them.
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
    /*
     * Not the scroll container any more — `.body` is.
     *
     * While this held the whole chart's worth of scrolling, the heading and
     * the way out of the dialog went up and off the top with everything else,
     * and a modal whose × cannot be reached is a modal nobody can leave
     * except by guessing at Escape. The box below splits into a head that
     * stays and a body that moves.
     */
    overflow: hidden;
    overscroll-behavior: contain;
    /*
     * So the box can fill it: a grid child stretches, and `fromBackdrop`
     * depends on the box leaving nothing of the element uncovered.
     *
     * `minmax(0, 1fr)` and not the implicit `auto`. An auto row is as tall as
     * its content and the `max-block-size` above only *clips* it — the box
     * kept its full height, the body inside it was never given a bound to
     * scroll within, and the chart simply ran off the bottom of the dialog
     * with no way to reach it. The same trap as the row below, one level up.
     */
    display: grid;
    grid-template-rows: minmax(0, 1fr);
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

  /* A head that stays and a body that scrolls. `minmax(0, 1fr)` and not
     `1fr`: a grid row's default minimum is its content, and a row that will
     not shrink below a whole chart never scrolls — it overflows the dialog. */
  .box {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0.7rem;
    padding: 0.8rem 0.9rem 1rem;
    min-inline-size: 0;
  }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  h2 { font-size: 0.9rem; font-weight: 400; margin: 0; margin-inline-end: auto; }
  .body {
    overflow: auto;
    overscroll-behavior: contain;
    min-block-size: 0;
    display: grid;
    gap: 0.9rem;
    align-content: start;
  }
  /* A shade quieter than the chart section's, which is a page's answer where
     this is a column beside a picture. Everything in `ChartReading` is sized
     in `em`, so one declaration moves all of it. */
  .said, .palaces { font-size: 0.95rem; }
  /*
   * `0` and not the `auto` a grid item gets by default.
   *
   * A grid item will not shrink below its own min-content, and this one's is
   * the whole table — so on a narrow window the column grew to the table's
   * width and the *dialog* scrolled sideways, carrying the board and the
   * heading off to the left. Which is the exact thing `.scroller` exists to
   * prevent, one level further out. Given leave to shrink, the item takes the
   * width it is offered and the frame inside it does the scrolling.
   */
  .palaces { min-inline-size: 0; }
  /*
   * Where there is room for a column of words beside a square. Below this the
   * enlargement is the width of the window and nothing else, which on a phone
   * the dialog already had.
   *
   * The words go beside the board. The nine palaces do not, and it was tried:
   * six columns of two lines, each now carrying a gloss, a glyph and a
   * reading, want something past fifty rems, and the column beside a board is
   * twenty-four at its widest. What a reader got was a table cut down the
   * middle with its right half behind a sideways scroll they had no reason to
   * look for — half a chart, silently.
   *
   * So the table spans both columns and hangs under the board, where the width
   * it needs is the width the dialog already has.
   */
  @media (min-width: 56rem) {
    dialog.large .body { grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem); }
    dialog.large .palaces { grid-column: 1 / -1; }
    /* The item of the grid is the board and its legend together, so what used
       to be the picture's own placement is the pair's. */
    dialog.large .board { align-self: start; }
    dialog.large .board img {
      /* The height budget buys eight sevenths of itself in width: what has to
         fit is everything down to the foot of the board, which is the
         caption's eighth plus the grid's three quarters — see the same sum in
         the chart section. The list of configurations hangs below that and
         scrolls with `.body`, which is what `.body` scrolls for. */
      inline-size: min(calc(96vw - 28rem), calc((90vh - 5rem) * 8 / 7));
      block-size: auto;
      max-inline-size: 100%;
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
  /* Centred against the heading rather than sat on its baseline: a button
     holding a drawing and no text has no baseline worth aligning to. */
  .size { display: inline-flex; align-self: center; }
  /* The stroke follows the colour of the button, so the hover carries it. */
  .size svg { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
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
  /* The picture centred in whatever room the pair is given, and allowed to
     shrink below its own nine hundred pixels — see `.palaces` above for why a
     grid item that may not shrink takes the dialog sideways with it. */
  .board { display: grid; justify-items: center; min-inline-size: 0; }
  img { display: block; width: 100%; height: auto; transition: opacity 0.15s ease-out; }
  .settling { opacity: 0.35; }
  @media (prefers-reduced-motion: reduce) {
    img { transition: none; }
  }
  .note, .failure { margin: 0; font-size: 0.85em; }
  .note { color: var(--faint); }
  .failure { color: var(--alarm); }
</style>
