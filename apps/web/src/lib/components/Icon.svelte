<!--
  A mark beside a word, and never in place of one.

  The three buttons this draws for are the ones a reader looks for rather than
  reads — copy, copied, print — and a mark is what makes them findable at a
  glance once known. It does not make them legible: a control whose face is a
  shape is a control only somebody who already knows it can use on purpose,
  which is the same rule `CLAUDE.md` states for a glyph, and a `title` does not
  rescue it because nobody hovers what they cannot recognise.

  So every one of these travels with its word, and this is `aria-hidden`: to a
  screen reader the button is its label and this is nothing at all.
-->
<script lang="ts">
  let { name }: { name: 'copy' | 'copied' | 'print' } = $props();
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
  {:else}
    <path d="M4.5 6.5v-5h7v5" />
    <rect x="1.5" y="6.5" width="13" height="5.5" rx="1.3" />
    <path d="M4.5 10h7v4.5h-7z" />
  {/if}
</svg>

<style>
  svg {
    /* On the baseline of the word beside it, not hanging under it. */
    vertical-align: -0.12em;
    flex: none;
  }
</style>
