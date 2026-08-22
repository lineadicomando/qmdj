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
  import type { Translator } from '@shipan/i18n';
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
          <!-- Whole where the reader is, cut everywhere else. The name is the
               second mark on the current section and the underline is the
               first: one says which board this is, the other where it stands
               in the row, and a reader coming to the bar from the page below
               reads the name before they look for a rule under it. Five of the
               six have a long form; `full` is absent on 八字, which is two
               characters, and the label answers for that case too. -->
          {t(current && section.full ? section.full : section.label)}
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
   * Measured rather than chosen, and measured again once the names were cut.
   * Italian and not English throughout: `Scegliere il momento` is the longest
   * label of all, and the six instrument names are the same string in both.
   *
   * The eight labels run to 43.2rem laid end to end with every name cut, and
   * to 47.3rem at the widest — the 太乙 section, where the longest of the long
   * forms is worn — against 49.4rem when all six stood at full length. So the
   * list holds one row from a window of about 59rem up in the widest case and
   * 55 in the narrowest, where before the cut it wanted 61. Two rows is what
   * this header was always willing to spend: the note this replaced said as
   * much, and said it when there were three sections rather than eight.
   *
   * The widest case moved when 太乙 was given a long form of its own, and it
   * moved by a quarter of a rem: `Tai Yi Shen Shu` is one letter longer than
   * `Zi Wei Dou Shu`, which had been the longest. Five sections wear a long
   * form now where four did, and that changes nothing here — one is worn at a
   * time, so the count of them was never what this width was measured against.
   *
   * **No state of the list is wider than the row that stood here before**,
   * because a long form is worn by one section at a time: where 七政四餘 and
   * 紫微斗數 used to stand full beside each other, whichever of them is being
   * read now stands beside the other one cut.
   *
   * 36rem and not 32, which is where the third row used to arrive: at 36.1rem
   * the old labels stood in three rows and these stand in two, so the fold now
   * opens onto a list with room rather than onto rows that only just fit. That
   * margin is the part of this a translation spends. What the two forms cost
   * in exchange is a row that can rewrap on navigation, near the width where
   * it breaks; the alternative is holding the long form's room open under the
   * short one, which buys a still row at the price of a gap beside five labels
   * out of six.
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
