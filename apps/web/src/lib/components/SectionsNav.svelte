<!--
  Where the reader can go — on one line while there is a line, folded behind a
  button once there is not.

  Seven sections and two of them a phrase apiece: at 390 pixels the header stood
  three rows and 162 pixels tall before a word of the page began, and folded it
  is 90 with the wordmark still in it. The fold is the only thing on this site
  hidden behind an interaction, which is why the three notes below are about
  what it refuses to do rather than what it does.

  **It pushes, it does not cover.** An overlay would want a focus trap, a
  scroll lock, a backdrop and a `z-index` argued out against the seal that goes
  fixed in the margin at 88rem — four mechanisms for a list of seven links.
  `PlateDialog` is a `<dialog>` because it takes the whole screen for a drawing
  that wants it; there is nothing here to interrupt.

  **The button carries its word.** `Icon.svelte` states the rule at the top of
  itself — a mark beside a word and never in place of one — and three bars
  alone are exactly the control only somebody who already knows it can use on
  purpose. `nav.sections` is the word, and it is the word the landmark was
  already named with, so nothing new was added to the catalogs.

  **Without a script the fold is simply not there.** `app.html` writes
  `data-js` on the document before the paint; until it does, the stylesheet
  keeps the list open and leaves the button undrawn, which is the header
  exactly as it stood before. A button that does nothing would have been worse
  than no button, and rendering the list open and closing it on mount would
  have been a flash of the whole list on every load.

  What the fold does *not* say is which section is being read: closed, it reads
  `Sections` and not the name of the current one. Each page carries its own
  `h1` — that is why the wordmark above can stay the same on all of them — and
  a reader who wants to know where they are is looking at it already.
-->
<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import type { Translator } from '@qimendunjia/i18n';
  import { SECTIONS, carriedSearch, href, isCurrent } from '$lib/navigation';
  import Icon from './Icon.svelte';

  let { t }: { t: Translator } = $props();

  let open = $state(false);
  let button: HTMLButtonElement | undefined = $state();

  /** One `id` per instance, since the button says which list it opens. */
  const named = $props.id();

  /**
   * A navigation closes it, and a click on a link inside is a navigation.
   *
   * The header is not remounted between sections — it lives in the layout —
   * so nothing else would ever put it back. `afterNavigate` and not an effect
   * on the path: what has to happen is «a section was reached», not «this
   * component was rendered», and an effect would also fire on the first paint
   * to close what is already closed.
   */
  afterNavigate(() => (open = false));

  /**
   * Escape closes it and hands the focus back.
   *
   * On the window rather than on the list, because a reader who has opened it
   * and then clicked away is still owed the way out — and it is a no-op while
   * the fold is closed, which is what keeps it from answering for the modal in
   * the moments section.
   */
  function dismiss(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !open) return;
    open = false;
    button?.focus();
  }
</script>

<svelte:window onkeydown={dismiss} />

<nav aria-label={t('nav.sections')}>
  <button
    bind:this={button}
    type="button"
    class="toggle"
    aria-expanded={open}
    aria-controls={named}
    onclick={() => (open = !open)}
  >
    <Icon name="menu" />
    {t('nav.sections')}
  </button>

  <ul id={named} class:open>
    {#each SECTIONS as section, index (section.slug)}
      {@const current = isCurrent(t.locale, section.slug, page.url.pathname)}
      <!-- Space, not a rule and not a dropdown: the break between what a
           reader does and what they look at is set in the one device this page
           has for it. It changes axis with the list and does not change kind —
           folded, the same space is measured downwards. -->
      <li class:opens={index > 0 && SECTIONS[index - 1].group !== section.group}>
        <a
          href={href(t.locale, section.slug, carriedSearch(page.url.search))}
          aria-current={current ? 'page' : undefined}
          class:current
        >
          {t(section.label)}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  /*
   * Folded first, and unfolded once there is room. Every rule below is written
   * for the narrow case; the query at the foot is the wide one.
   */

  /*
   * The nav takes the room that is left, rather than asking for the room it
   * wants.
   *
   * A flex item sized from its own content asks the bar for the whole list
   * laid end to end — 41.5rem of it — and the bar, which wraps, answers by
   * sending the two switches down to a line of their own. So between the fold
   * and the width where the seven fit on one line the header cost three rows:
   * two of sections and one of switches, the last of them for want of an inch.
   * A basis of zero reverses the question: the nav is offered what remains
   * once the switches are seated, and wraps the list inside it.
   */
  nav { flex: 1 1 0; }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    /* The global rule gives every button a border, a ground and a padding;
       this is a word in the header and not a control to be pressed into. */
    border: 0;
    background: none;
    padding: 0.1rem 0;
    color: var(--faint);
    font: inherit;
    cursor: pointer;
  }
  .toggle:hover, .toggle:focus-visible { color: var(--ink); background: none; }

  ul {
    display: none;
    flex-direction: column;
    gap: 0.4rem 1.4rem;
    list-style: none;
    margin: 0.35rem 0 0;
    padding: 0;
  }
  ul.open { display: flex; }

  /* Twice the gap the list already sets, which reads as a division where a
     wider gap of the same kind would read as an accident. Measured in the axis
     the list runs in, so it is the row gap that is doubled here and the column
     gap in the query below. */
  li.opens { margin-block-start: 0.8rem; }

  /*
   * A block as wide as its word, not as wide as the list.
   *
   * The mark on the current section is an underline, and an underline under a
   * full-width row is a rule between two rows: the same declaration means two
   * different things in the two axes. Fitted to the text it means the same
   * thing in both. The padding is what makes it a target for a thumb — some
   * forty pixels tall against the twenty-four WCAG asks — and it doubles as
   * the room the underline needs to clear the baseline.
   */
  nav a {
    display: block;
    width: fit-content;
    padding-block: 0.5rem 0.35rem;
    color: var(--faint);
    text-decoration: none;
  }
  nav a:hover { color: var(--ink); }
  nav a.current { color: var(--ink); border-bottom: 2px solid var(--ink); }

  /*
   * Wide enough, and the fold is not drawn at all.
   *
   * Measured rather than chosen. The seven Italian labels run to 41.5rem laid
   * end to end — Italian and not English, since `Scegliere il momento` is the
   * longest of the fourteen and the five instrument names are the same string
   * in both — so they stand on one row from a window of 53.4rem up, and on two
   * down to 32. Two rows is what this header was always willing to spend: the
   * note this replaced said as much, and said it when there were three
   * sections rather than seven.
   *
   * 36rem and not 32, which is where the third row would arrive. A threshold
   * set at the exact width where a row breaks unfolds onto rows that only just
   * fit, and the labels are the part of this a translation changes.
   */
  @media (min-width: 36rem) {
    .toggle { display: none; }
    ul { display: flex; flex-direction: row; flex-wrap: wrap; margin: 0; }
    li.opens { margin-block-start: 0; margin-inline-start: 1.6rem; }
    nav a { padding-block: 0 0.35rem; }
  }

  /*
   * No script, no press — so no fold either, and the header stands as it did.
   * Last of the three cases on purpose: it has to answer for both the widths
   * above it.
   */
  :global(html:not([data-js])) .toggle { display: none; }
  :global(html:not([data-js])) ul { display: flex; }

  /* A sheet has nowhere else to go. The rule used to live in the layout, and
     followed the element here: a scoped selector there no longer reaches a
     `<nav>` that is rendered in a component. */
  @media print {
    nav { display: none; }
  }
</style>
