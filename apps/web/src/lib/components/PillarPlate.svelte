<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  /**
   * The four pillars drawn the way the Qi Men board is: one square each,
   * tinted by the phase of its stem, read top to bottom.
   *
   * It says nothing the table below does not, and that is the point — four
   * squares are taken in at a glance where a table has to be read row by
   * row. The table stays because it is what carries the detail, and what a
   * screen reader can follow.
   *
   * Takes the pillars, not the whole reading: the same squares serve a birth
   * chart, a luck cycle, or whatever is compared against one.
   */
  /**
   * The shape, declared here rather than imported.
   *
   * `BaziPillar` is what the Four Pillars section hands over and it fits; a
   * Qi Men chart hands over the same four pairs with none of the rest, since
   * a god and a stage are the *other* method's readings of them. Structural,
   * so both pass without either being converted into the other.
   */
  interface Square {
    position: string;
    ganzhi: {
      stem: { id: string; hanzi: string; pinyin?: string; element: string };
      branch: { id: string; hanzi: string; pinyin?: string };
    };
    stemGod?: { id: string } | null;
    stage?: { id: string };
  }

  /**
   * `wide` is whether these four stand under a board of the page's width.
   *
   * Where they do — the chart section and the consultation — they take that
   * width themselves and are dressed to rhyme with the drawing above: the
   * name leads and the word follows under it, as in a palace, in the ink the
   * board writes its names in. Two grids one above the other, at one measure,
   * reading the same way round.
   *
   * Where they do not — the column of the scan's dialog — they stay the
   * caption they were: small, word first, two columns of two.
   */
  let {
    pillars,
    t,
    wide = false,
  }: { pillars: readonly Square[]; t: Translator; wide?: boolean } = $props();

  /**
   * Whether these squares are the Four Pillars' or a chart's.
   *
   * The stage is the tell, and it is the right one: the twelve stages, the
   * ten gods and the day master are all read off a chart of a birth by the
   * other method, and they arrive together or not at all. Beside a Qi Men
   * board none of them is shown — not because the room is short, but because
   * a reader who found them there would take a whole second method for part
   * of the chart. See `ChartReading`, where the same line is held.
   */
  const full = $derived(pillars.some((pillar) => pillar.stage !== undefined));
</script>

<!--
  A name in one register: the word, the glyph and its reading.

  Written out rather than passed through `glyph`, which returns the two as one
  string. They are one name and travel together either way — but which of the
  three leads is what tells a caption from a palace, and a reading set at the
  size of the name it follows is a reading shouting. Three elements, so the
  stylesheet can say so.
-->
{#snippet register(entity: { hanzi: string; pinyin?: string }, word: string)}
  <p class="pair">
    <span class="word">{word}</span>
    <span class="glyph"
      ><span class="hanzi">{entity.hanzi}</span>{#if entity.pinyin}<span class="reading"
          >{entity.pinyin}</span
        >{/if}</span
    >
  </p>
{/snippet}

<!--
  A frame around the plate, and its only job is to be measurable.

  The cells are containers already — that is what sizes their registers in
  `cqw` — but an element cannot answer a query about itself, and how many
  columns four pillars want is a question about the room the *plate* was
  given. Beside a board there is room for four; in the column of the scan's
  dialog there is room for two, and four there come out at a size where the
  word under the glyph cannot be read.
-->
<div class="frame">
<div class="plate" class:bare={!full} class:wide={!full && wide}>
  {#each pillars as pillar (pillar.position)}
    <div class="cell" style="--element: var(--element-{pillar.ganzhi.stem.element})">
      <div class="registers">
        <!-- The pillar names itself in the corner, as a palace does. -->
        <p class="corner">{t(`cli.column.${pillar.position}` as MessageKey)}</p>
        {#if full}
          <!-- The day pillar has no god: it is the day master, the point every
               other god is measured from, and it says so instead. -->
          <p class="god">
            {#if pillar.stemGod}
              {t(`label.god.${pillar.stemGod.id}` as MessageKey)}
            {:else}
              {t('cli.field.dayMaster')}
            {/if}
          </p>
        {/if}
        {@render register(
          pillar.ganzhi.stem,
          t(`label.stem.${pillar.ganzhi.stem.id}` as MessageKey),
        )}
        {@render register(
          pillar.ganzhi.branch,
          t(`label.branch.${pillar.ganzhi.branch.id}` as MessageKey),
        )}
        {#if pillar.stage}
          <p class="stage">{t(`label.stage.${pillar.stage.id}` as MessageKey)}</p>
        {/if}
      </div>
    </div>
  {/each}
</div>
</div>

<style>
  .frame { container-type: inline-size; }
  /*
   * The four pillars in full are the 八字 board, and take a board's measure.
   *
   * `--board` is what the other three are drawn at — see `app.css` — and this
   * one is the odd instrument of the four, being a grid of the page's own type
   * rather than a picture at an address. That is a fact about how it is made
   * and not about how wide it is: a reader who lays a chart and then a birth
   * is looking at two boards, and 46rem against the chart's measure said they
   * were two kinds of thing.
   */
  .plate {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    inline-size: var(--board);
    border: 1px solid var(--rule);
    margin: 0 auto 1.5rem;
  }
  /*
   * Three registers instead of five, so the cell stops being a square.
   *
   * The square is what a god, a pair, a pair and a stage fill. Holding two
   * pairs and a name it was a third empty at the foot, and a box visibly
   * larger than what is in it reads as something failing to load rather than
   * as a caption — which is what these four are beside a board.
   *
   * So the cell is as tall as its contents: the registers come back into the
   * flow, and what decides the height is the type, which is still measured
   * against the width. The plate keeps a measure of its own, narrower than
   * the Four Pillars' and centred under the drawing.
   */
  .bare {
    /* Not a board and so not at a board's measure: these four are a caption to
       one, and the window's height has nothing to say about how wide a caption
       is. Back to a measure of its own, narrower than the Four Pillars'. */
    inline-size: auto;
    max-width: 34rem;
    margin-inline: auto;
  }
  .bare .cell { aspect-ratio: auto; }
  .bare .registers { position: static; padding: 4cqw 3cqw; gap: 1.5cqw; }
  /*
   * The type stops growing where the cell does not.
   *
   * `cqw` alone is right for the Four Pillars, whose plate is the answer and
   * whose cells are the size the section gives them. These four are a caption
   * to a board, and in two columns each cell is half the plate: at a fifth of
   * that in type the pairs came out larger than the reading they caption. The
   * cap is a shade over the body text, which is where a caption belongs — and
   * under it, on the page, nothing changes.
   */
  .bare .corner { font-size: min(8cqw, 0.75rem); }
  .bare .word { font-size: min(11cqw, 1.05rem); }
  .bare .glyph { font-size: min(9cqw, 0.85rem); }
  /*
   * Two columns where four will not fit, by the room the plate was given and
   * not by the width of the window: the narrow case is the column of a dialog
   * on a wide screen, which no viewport query can see.
   *
   * Two and never three. `auto-fit` would have wrapped one pillar onto a row
   * of its own somewhere between the two, and four pillars broken 3 + 1 read
   * as a table that ran out of room rather than as a plate.
   */
  @container (max-width: 30rem) {
    .bare { grid-template-columns: repeat(2, 1fr); }
  }
  /*
   * The rules are drawn by the grid, not by the cells.
   *
   * A border on the left of every cell but the first is right for one row and
   * wrong for two: wrapped, the third cell opens a row and carries a rule
   * down the outside of it. A gap the colour of the ground underneath shows
   * as a line wherever two cells actually meet.
   */
  .bare { gap: 1px; background: var(--rule); }
  .bare .cell { border-left: 0; }

  /*
   * Under a board of the page's width, at the page's width, reading the way
   * the board reads.
   *
   * Three things make two grids one figure rather than two, and the plate had
   * none of them. **The measure**: a fraction of the drawing's own, so the
   * two align edge to edge — see below, and `--board` for what the drawing's
   * is. **The order of the registers**: on the board a palace sets the name
   * large and the word small under it, and the plate did the opposite — two
   * grids one above the other, one led by hanzi and one by Italian, read as two
   * unrelated tables. **The colour**: the name in the ink, the word beside
   * it quiet, again as in a palace.
   *
   * The Four Pillars' own plate keeps the order it has. There the plate is
   * the section's answer and stands alone, and what leads for a reader with
   * no Chinese is the word. Here it stands under a board that has already
   * settled the question for the whole page.
   */
  /*
   * The plate is the grid: four squares across three palaces.
   *
   * `geometry.ts` derives the drawing from the side of the paper, and with
   * captions and a compass the margin is `0.125 · size` — so the nine palaces
   * occupy three quarters of it and a palace is a quarter. That three
   * quarters is the width taken here, and it is the width the eye actually
   * reads the board at: the paper runs wider, but what is ruled and tinted
   * and stands out is the square of nine. Four cells in it come to
   * `0.1875 · size` each, three quarters of a palace.
   *
   * `.cast` in `ChartReading` is the paper's width, so this is a percentage
   * of it and nothing here has to know the expression that produced it.
   */
  .wide {
    max-width: none;
    inline-size: 75%;
    margin-inline: auto;
  }
  /*
   * Square, and carrying the board's type rather than its own.
   *
   * The cell is three quarters of a palace and the names in it are not: a
   * name set as a fraction of *this* cell would come out a quarter under the
   * board's, which is the size they were before any of this. So the palace's
   * fractions are divided through by the ratio of the two cells — a palace's
   * name is `0.03 · size` and this cell is `0.1875 · size`, hence 16cqw; the
   * word under it `0.01375`, hence 7.33; the corner `0.0175`, hence 9.33.
   * What the reader sees is type at exactly the board's size, in a grid
   * exactly the board's width.
   *
   * No cap on any of them. A cap is what breaks the correspondence at exactly
   * the sizes it is worth having.
   */
  .wide .cell { aspect-ratio: 1; }
  /*
   * Back inside the square, and spread in it the way a palace is.
   *
   * Six registers fill a palace from 23% of its side down to 80%; two fill a
   * smaller square carrying the same type from about a sixth to five sixths,
   * which is as much air as this one can afford. The name of the pillar
   * leaves the flow for the corner — where a palace writes its Luoshu number,
   * at the size a palace writes it — and cannot collide with what is centred
   * below it, since that starts well under the top.
   */
  .wide .registers { position: absolute; inset: 0; justify-content: center; gap: 8cqw; }
  .wide .corner { position: absolute; inset-block-start: 4.7cqw; inset-inline-start: 5.3cqw; font-size: 9.33cqw; }
  /* The word under the name it renders, and not over it. `order` rather than
     a second piece of markup: it is the same register either way round. */
  .wide .word { order: 2; font-size: 7.33cqw; color: var(--faint); }
  .wide .glyph { order: 1; font-size: 16cqw; color: var(--ink); }
  /* Part of the name and not a second name: a reading set at the size of what
     it renders competes with it. Nothing on the board answers for this one —
     the drawing prints no readings yet — so it is set from the name. */
  .wide .reading { font-size: 0.45em; color: var(--faint); }
  /*
   * The same fallback to two columns, at the threshold this plate's own width
   * puts it at.
   *
   * The frame that is queried is the paper's width and the plate is three
   * quarters of it, so the 30rem the compact plate falls back at is 40rem
   * here. Without this the four cells would go on shrinking for another
   * tenth of the screen, carrying the board's type into a cell that no longer
   * has room for it.
   */
  @container (max-width: 40rem) {
    .wide { grid-template-columns: repeat(2, 1fr); }
  }
  /*
   * The square is the unit everything inside is measured against, so the
   * cell is the container and its contents are sized in `cqw`. A word in
   * Italian is several times wider than the two hanzi these registers were
   * proportioned for, and at four columns across a phone there is no room
   * for a line that sets its own size.
   */
  .cell {
    position: relative;
    aspect-ratio: 1;
    container-type: inline-size;
    background: var(--element, var(--ground));
    border-left: 1px solid var(--rule);
  }
  .cell:first-child { border-left: 0; }
  /* Absolutely placed so its padding cannot argue with the square. */
  .registers {
    position: absolute;
    inset: 0;
    padding: 4cqw 3cqw;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5cqw;
    text-align: center;
    overflow: hidden;
  }
  p { margin: 0; line-height: 1.25; }
  .corner { align-self: start; font-size: 8cqw; color: var(--faint); }
  .god { font-size: 8.5cqw; color: var(--faint); }
  .pair { display: grid; }
  .word { font-size: 11cqw; }
  .glyph { font-size: 9cqw; color: var(--faint); }
  /* Written as a space would be, and not as one: a space between two inline
     elements is collapsible, and what is on either side of it here is a name
     and its reading. */
  .reading { margin-inline-start: 0.25em; }
  /* Along the foot, where the board writes what fell in a palace. */
  .stage { margin-top: auto; font-size: 8cqw; color: var(--faint); }

  /*
   * Paper, where the square comes off.
   *
   * Four squares are one figure, so a page break may not pass through them:
   * broken, they leave two pairs on two sheets and a pillar cut in half. That
   * much was here from the start. The rest is what a sheet does to the way
   * the square is built — three devices, each of them screen furniture, and
   * each read differently once the layout is paginated. The **`aspect-ratio`**
   * reserves a box whose height no longer answers to what is in it. The
   * **registers are absolutely placed** to fill that box, so they cannot grow
   * with it. And the type is set in **`cqw`**, which is a question put to a
   * container that printing has just re-measured — one engine answers it with
   * the cell on the sheet, another with the cell as it stood on screen. Where
   * the answers differ the content is taller than the box, and `overflow:
   * hidden` under it takes the difference away without a mark: Firefox prints
   * four tinted squares holding a name apiece and drops every stem, branch,
   * god and stage in them. A board that lost its pillars and gives no sign of
   * it is the failure `.scroller` is unpicked for in `app.css`, and the answer
   * is the same one — nothing on a sheet may clip, because nothing on a sheet
   * can be scrolled to.
   *
   * So on paper the cell is as tall as what it holds, the registers are back
   * in the flow, nothing is hidden, and the type is set from the page's own
   * size rather than from a container. What is given up is the square, which
   * is a shape; what is kept is every name in it. The three arrangements keep
   * their proportions to one another — a caption stays small, and under a
   * board the name still leads over the word.
   */
  @media print {
    .plate { break-inside: avoid; }
    /* `--board` is measured against the window's height, which is not a
       quantity a sheet has. The plate takes the measure it is handed. */
    .plate:not(.bare):not(.wide) { inline-size: 100%; }
    .cell { aspect-ratio: auto; }
    .registers,
    .wide .registers {
      position: static;
      justify-content: flex-start;
      padding: 0.5rem 0.35rem;
      gap: 0.2rem;
      overflow: visible;
    }
    .corner,
    .bare .corner,
    .wide .corner { position: static; align-self: start; font-size: 0.7rem; }
    .god { font-size: 0.72rem; }
    /* The Four Pillars' own plate, where the word leads. */
    .word { font-size: 0.95rem; }
    .glyph { font-size: 0.8rem; }
    .stage { font-size: 0.7rem; }
    /* The caption to a board, which stays a caption. */
    .bare .word { font-size: 0.85rem; }
    .bare .glyph { font-size: 0.72rem; }
    /* Under a board, where the name leads and the word is quiet beneath it. */
    .wide .glyph { font-size: 1.25rem; }
    .wide .word { font-size: 0.72rem; }
  }
</style>
