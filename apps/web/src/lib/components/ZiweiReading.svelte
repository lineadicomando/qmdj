<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import CalendarAndAlmanac from './CalendarAndAlmanac.svelte';
  import Icon from './Icon.svelte';
  import { glyph } from '$lib/glyph';

  /**
   * A 紫微斗數 board said in words.
   *
   * One table and twelve rows, going down the page rather than round a
   * square. The square is how the board is drawn and it is not how it is
   * *read*: a reader following the seats is following the order 卷二 numbers
   * them in — 命宮 first, then 兄弟, then 妻妾 — and that order runs round the
   * ring backwards, which a grid cannot show and a column can.
   *
   * It takes the board as the API returns it. The client imports only types
   * from `core`, so every name here arrives with its hanzi and its reading
   * already on it: a value import would drag the ephemerides and a native
   * module into the browser bundle.
   */
  let {
    board,
    t,
    moment = null,
    pointed = $bindable(null),
    found = null,
    onfind = undefined,
  }: {
    board: any;
    t: Translator;
    moment?: any;
    pointed?: string | null;
    /** Where the last press landed. Owned by the page; see the note there. */
    found?: string | null;
    /** Take the reader back to this seat on the drawing above. */
    onfind?: ((branch: string) => void) | undefined;
  } = $props();

  const gendered = $derived(board.palaces.some((palace: any) => palace.majorLimit !== null));
</script>

<div class="words">
  <p class="caption">
    {t('cli.field.bureau')}:
    <strong>{t(`label.bureau.${board.bureau.id}` as MessageKey)}</strong>
    <span class="glyph">{glyph(board.bureau)} · {glyph(board.minggongPillar)} {glyph(board.nayin)}</span>
  </p>

  <dl class="masters">
    <dt>{t('cli.field.minggongPalace')}</dt>
    <dd><span class="glyph">{glyph(board.palaces[0].branch)}</span></dd>
    <dt>{t('cli.field.shengong')}</dt>
    <dd><span class="glyph">{glyph(board.bodyBranch)}</span></dd>
    <dt>{t('cli.field.lifeMaster')}</dt>
    <dd>
      {t(`label.ziwei.${board.lifeMaster.id}` as MessageKey)}
      <span class="glyph">{glyph(board.lifeMaster)}</span>
    </dd>
    <dt>{t('cli.field.bodyMaster')}</dt>
    <dd>
      {t(`label.ziwei.${board.bodyMaster.id}` as MessageKey)}
      <span class="glyph">{glyph(board.bodyMaster)}</span>
    </dd>
  </dl>

  <h2>{t('cli.field.ziweiPalaces')}</h2>
  <div class="scroller">
    <table class="seats">
      <thead>
        <tr>
          <th>{t('cli.column.seat')}</th>
          <th>{t('cli.column.ground')}</th>
          <th>{t('cli.column.starsThere')}</th>
          <th>{t('cli.column.rings')}</th>
          {#if gendered}<th>{t('cli.column.limit')}</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each board.palaces as palace}
          <!--
            Bound to the drawing above by the branch the seat stands on.

            Pointing at either lights the other, and the emphasis is a rule
            down the side rather than a wash: this table already tints the row
            the 身宮 shares, and two washes on one row would say one thing and
            be read as another.
          -->
          <tr
            class:body={palace.body}
            class:pointed={pointed === palace.branch.id}
            class:found={found === palace.branch.id}
            data-seat={palace.branch.id}
            onmouseenter={() => (pointed = palace.branch.id)}
            onmouseleave={() => (pointed = null)}
          >
            <!--
              The name is a name, and the way back to the picture is a mark
              beside it.

              It was the name itself for a while, on the reasoning that the
              name is the one thing in the row that *is* the seat. That was
              wrong in the way that only shows when somebody looks at it: a
              word that is also a control looks like neither, so the return
              was there and nobody could see it. An arrow is a control at a
              glance, and pointing up is the whole of what it does — the board
              is above the table.
            -->
            <td>
              {t(`label.ziweihouse.${palace.house.id}` as MessageKey)}
              <!-- The reading and the mark do not part: this column is narrow
                   and the name wraps in it, and an arrow left alone on the
                   last line reads as something that fell off. -->
              <span class="tail">
                <span class="glyph">{glyph(palace.house)}</span>{#if onfind}<button
                    type="button"
                    class="find"
                    aria-label={t('board.seatBack', { seat: palace.house.hanzi })}
                    title={t('board.seatBack', { seat: palace.house.hanzi })}
                    onclick={() => onfind?.(palace.branch.id)}
                  >
                    <Icon name="up" />
                  </button>{/if}
              </span>
            </td>
            <td class="ground">
              <span class="glyph">{palace.stem.hanzi}{palace.branch.hanzi}
                {palace.stem.pinyin}{palace.branch.pinyin}</span>
            </td>
            <!--
              One star to a line, and the word leads it.

              This is the surface the drawing hands its detail to. A picture
              can carry one word to a cell before the words start costing the
              glyphs their room; a table has as many lines as it needs, so
              here **everything is said** — the star, the grade the book gives
              it on that branch, and the transformation the year works on it.
              A grade and a transformation ride on the star they belong to
              rather than in a legend, because both are attributes of *that
              star in that seat*: a reader sent to look them up elsewhere
              would be reading a different board.

              An empty cell is an empty seat, which this art reads through the
              seat opposite — and saying so is the reader's, not ours.
            -->
            <td class="counted">
              {#each palace.stars as seat}
                <span class="one">
                  {t(`label.ziwei.${seat.star.id}` as MessageKey)}
                  <span class="glyph">{glyph(seat.star)}</span>
                  {#if seat.brightness}<span class="qualifier"
                      >· {t(`label.brightness.${seat.brightness.id}` as MessageKey)}
                      <span class="glyph">{seat.brightness.hanzi}</span></span
                    >{/if}
                  {#if seat.transform}<span class="qualifier"
                      >· {t(`label.transform.${seat.transform.id}` as MessageKey)}
                      <span class="glyph">{seat.transform.hanzi}</span></span
                    >{/if}
                </span>
              {/each}
            </td>
            <td class="rings">
              {#if palace.body}<span class="one mark">{t('cli.field.shengong')} 身 shēn</span>{/if}
              {#if palace.changsheng}
                <span class="one">
                  {t(`label.stage.${palace.changsheng.id}` as MessageKey)}
                  <span class="glyph">{glyph(palace.changsheng)}</span>
                </span>
              {/if}
              {#if palace.boshi}
                <span class="one">
                  {t(`label.boshi.${palace.boshi.id}` as MessageKey)}
                  <span class="glyph">{glyph(palace.boshi)}</span>
                </span>
              {/if}
            </td>
            {#if gendered}
              <td class="limit">
                {palace.majorLimit ? `${palace.majorLimit.from}–${palace.majorLimit.to}` : ''}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- The lunar calendar this board is counted on, without the almanac: 曆注
       weighs a day as the occasion of an undertaking, and a birth is not one.
       The same rule the pillars keep. Held at the reading measure, because it
       is prose and the component carries no measure of its own. -->
  <div class="prose">
    <CalendarAndAlmanac {moment} {t} almanac={false} />
  </div>

  <!-- Which book every placement above came out of, and where its tables part
       from the modern ones. Said where a reader is looking at the seats,
       because that is where it would be checked. -->
  <p class="note">{t('cli.value.ziweiSource')}</p>
</div>

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.6rem 0 0.5rem; }
  /*
   * Two measures, and the table gets the wider one.
   *
   * Prose wants a reading measure and a table wants the room its columns ask
   * for, and this table asks for more than any other on the site: five
   * columns, each carrying a word, a name and a reading. At 44rem it was
   * cramped under a drawing half again as wide, which looked like the table
   * had been forgotten. So the block takes the board's own measure and the
   * prose inside it keeps 44rem — the caption, the two masters, the calendar
   * and the note, which are sentences and not columns.
   */
  .words {
    inline-size: var(--board);
    max-inline-size: 100%;
    margin-inline: auto;
  }
  .caption, .masters, .prose, .note { max-inline-size: 44rem; margin-inline: auto; }
  .caption { margin: 0 0 1rem; }
  .glyph { color: var(--faint); font-size: 0.85em; }
  .note { color: var(--faint); font-size: 0.85em; margin: 0.6rem 0 0; }

  .masters {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.2rem 0.8rem;
    margin: 0 0 1rem;
  }
  /* Faint until it is wanted: twelve of these down a column, each as dark as
     the words beside them, would be twelve things to look past. It comes up to
     full ink when the row is pointed at, when it is hovered, and when it takes
     focus — so it is quiet without being hidden. */
  .tail { white-space: nowrap; }

  .find {
    font: inherit;
    color: var(--faint);
    background: none;
    border: 0;
    padding: 0 0 0 0.35em;
    line-height: 1;
    cursor: pointer;
    transition: color 120ms ease;
  }
  .find:hover, .find:focus-visible { color: var(--ink); }
  tr.pointed .find { color: var(--ink); }

  @media (prefers-reduced-motion: reduce) {
    .find { transition: none; }
  }

  /* Nothing to press on paper. */
  @media print {
    .find { display: none; }
  }

  .masters dt { color: var(--faint); font-size: 0.85em; }
  .masters dd { margin: 0; }

  .scroller { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th, td {
    text-align: left;
    padding: 0.3rem 0.6rem;
    border-bottom: 1px solid var(--rule);
    vertical-align: baseline;
  }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  .ground, .limit { white-space: nowrap; }
  .limit { font-variant-numeric: tabular-nums; }

  /* The two columns that wrap, and the reason this table does not take
     `max-content`: a crowded seat holds eleven names where an empty one holds
     none, and a cell measured as though it never wraps would push the other
     columns off a narrow screen for the sake of one row in twelve. */
  /* Trimmed by a rem and a half between them when the seat's column grew to
     hold the mark: the table fits its measure at a desk width, and a table
     that spills is a table whose last column somebody never finds. */
  .counted { min-width: 15rem; }
  .rings { min-width: 8.5rem; }

  /* One named thing to a line. Down a column of eleven, a line each is what
     makes them countable; run together they read as a sentence about the
     seat, which is a thing this engine does not write. */
  .one { display: block; }
  .one + .one { margin-block-start: 0.15em; }

  /* A grade and a transformation are the book's own weighing and are set
     subordinate to the name they qualify — smaller and fainter — because they
     are not stars, and a reader scanning the column must not count them as
     more. */
  .qualifier { color: var(--faint); font-size: 0.88em; }
  .mark { font-variant: all-small-caps; letter-spacing: 0.04em; }

  /* The seat the 身宮 shares, marked on the row rather than only in a cell:
     it is the one thing on this board that is true of a whole seat. */
  .body { background: var(--tint, transparent); }

  /* The row the reader is pointing at on the drawing above, and the drawing
     lights up in turn when they point here. A rule down the side rather than
     a background, so that it can sit on the 身宮's tint without either being
     mistaken for the other. */
  tbody tr {
    box-shadow: inset 3px 0 0 0 transparent;
    transition: box-shadow 120ms ease, background-color 640ms ease;
  }
  tbody tr.pointed { box-shadow: inset 3px 0 0 0 var(--ink); }

  /* The mark left where a press landed, and here it *is* a wash.

     The rule above refuses a second wash on this row, and that refusal is
     about two washes standing at once — one would be read as qualifying the
     other. This one does not stand: it arrives in 90ms, holds while the reader
     finds the row, and is faded out over 640ms by the transition on the base
     rule, uncovering the 身宮's tint again exactly as it was. Nothing else is
     competing with it for the moment it is there, which is what lets it be the
     loudest thing on the page and still cost nothing.

     `--rule` because it is the palette's structural neutral and reads as a
     band rather than as a state: `--tint` is spoken for by the 身宮, and
     `--alarm` would tell a reader something had gone wrong. */
  tbody tr.found { background-color: var(--rule); transition: background-color 90ms ease; }

  @media (prefers-reduced-motion: reduce) {
    tbody tr, tbody tr.found { transition: none; }
  }

  /* On paper the table gives up its scrolling frame, as every other table
     here does: one that still clipped would print three seats of twelve and
     give no sign of the other nine. */
  @media print {
    .scroller { overflow: visible; }
    /* A mark that says "you pressed here" is about a gesture, and no gesture
       reaches a sheet of paper. */
    tbody tr.found { background-color: transparent; }
  }
</style>
