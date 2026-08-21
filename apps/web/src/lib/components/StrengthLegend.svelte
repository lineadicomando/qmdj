<!--
  What the shapes on the board mean.

  The drawing writes the state of a star and of a gate as a ramp — ▲ 旺 down
  to ▼ 死, five steps from full to spent — because the words for them are too
  long to sit in a palace. A ramp says the *ordering* at a glance and in no
  language, which is what the rest of the cell is; it says the *meaning* to
  nobody. The palaces under the board spell each state out in words, but
  nothing there connects the word in the table to the shape in the picture.

  This is that connection, and it belongs beside the drawing rather than
  inside it: a legend drawn into the SVG would cost the board room on every
  chart, and the page can say it in the reader's own language, selectably and
  aloud. Whoever saves the picture and carries it off keeps the marks without
  the key — the same bargain the palace table already makes.

  It takes `t` and nothing else: the five states are the five states on every
  chart, so there is nothing here for a chart to decide.
-->
<script lang="ts">
  import { glyph } from '$lib/glyph';
  import { STRENGTH_KEY } from '$lib/vocabulary';
  import type { MessageKey, Translator } from '@shipan/i18n';

  let { t }: { t: Translator } = $props();
</script>

<div class="legend">
  <p>{t('form.strengthLegend')}</p>
  <!-- A list, because it is five of one thing: read aloud it announces itself
       as one rather than arriving as a run of words with marks in it. -->
  <ul>
    {#each STRENGTH_KEY as state (state.id)}
      <li>
        <span class="mark">{state.mark}</span>
        {t(`label.strength.${state.id}` as MessageKey)}
        <!-- The name and its reading, as everywhere else: a glyph alone is a
             shape with no sound to the reader this is built for. -->
        <span class="glyph">{glyph(state)}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  /*
   * Sized in `rem` and not in `em`.
   *
   * The same five entries stand under a page's board and under a dialog's,
   * and the dialog sets everything around it a shade smaller. A legend that
   * shrank with its room would be smallest exactly where the marks are
   * hardest to tell apart — ○ from ▽ at seven pixels is a coin toss.
   */
  .legend {
    font-size: 0.8rem;
    color: var(--faint);
    margin: 0.6rem auto 0;
    display: grid;
    justify-items: center;
    gap: 0.2rem;
  }
  p { margin: 0; }
  /* One row where there is room, wrapping where there is not: the entries are
     short and the order is what they are read for, so they stay in a line. */
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.15rem 1rem;
  }
  /* Set a shade larger than the words around it. The marks are the content
     here, and a hollow triangle at the text's own size is a smudge. */
  .mark { font-size: 1.15em; line-height: 1; }
  /* A shade under the word, as the name is under the word everywhere here.
     No quieter than that: the whole legend is already set faint. */
  .glyph { font-size: 0.9em; }

  /* On paper it stays with its board: a key printed on the page after the
     marks it explains is a key found by whoever had already given up. */
  @media print {
    .legend { break-inside: avoid; break-before: avoid; }
  }
</style>
