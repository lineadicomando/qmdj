<!--
  A mark beside a word, and never in place of one.

  The buttons this draws for are the ones a reader looks for rather than reads
  — copy, copied, print, and the one that unfolds the header's sections — and
  a mark is what makes them findable at a glance once known. It does not make
  them legible: a control whose face is a shape is a control only somebody who
  already knows it can use on purpose, which is the same rule `CLAUDE.md`
  states for a glyph, and a `title` does not rescue it because nobody hovers
  what they cannot recognise.

  So every one of these travels with its word, and this is `aria-hidden`: to a
  screen reader the button is its label and this is nothing at all.

  **One stands alone, and the exception is stated rather than taken.** `up` is
  the return from a table to the picture above it, and it sits in a button
  with no text — the way the colour-scheme toggle in the header does. What
  makes that admissible is not the shape being obvious; it is that the control
  is chrome rather than content. Nothing is being *decided* from it, the row
  it sits in already names the seat in the reader's language, and the button
  carries that name as its accessible label. A mark replacing a word a reader
  has to weigh would still be the thing `CLAUDE.md` refuses.
-->
<script lang="ts">
  let { name }: { name: 'copy' | 'copied' | 'print' | 'menu' | 'up' } = $props();
</script>

<svg
  viewBox="0 0 16 16"
  width="1em"
  height="1em"
  fill="none"
  stroke="currentColor"
  stroke-width="1.3"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#if name === 'copy'}
    <rect x="5.5" y="5.5" width="8" height="9" rx="1.3" />
    <path d="M10.5 5.5V3A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v6A1.5 1.5 0 0 0 4 10.5h1.5" />
  {:else if name === 'copied'}
    <path d="M2.5 8.5 6 12l7.5-8" />
  {:else if name === 'up'}
    <!-- Up, because the board is above the table and that is the whole of
         what this does. -->
    <path d="M8 13.5V3.5M3.5 8 8 3.5 12.5 8" />
  {:else if name === 'print'}
    <path d="M4.5 6.5v-5h7v5" />
    <rect x="1.5" y="6.5" width="13" height="5.5" rx="1.3" />
    <path d="M4.5 10h7v4.5h-7z" />
  {:else}
    <!-- Three rules the width of the box, which is the shape every browser,
         phone and application has taught the same thing to mean. It is here
         to be recognised, not to be read: the word travels beside it. -->
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
  {/if}
</svg>

<style>
  svg {
    /* On the baseline of the word beside it, not hanging under it. */
    vertical-align: -0.12em;
    flex: none;
  }
</style>
