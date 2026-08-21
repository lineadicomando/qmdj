<!--
  The four pillars read out: the day master, the pillars at a glance, the same
  four in a table with what each one carries, the stems their branches conceal
  with the god each of those is, and the decades where a direction was given.

  The last of the four boards to get a component of its own, and it got one for
  the reason the other three had theirs: the consultation shows what it is about
  to hand over. 八字 was here first, as the substrate a chart is cast from, and
  nothing had ever asked it to appear anywhere but its own section — so the
  markup lived in that page. Two copies of a table this size is two things to
  keep in step, and the pillars are the one board where a column drifting apart
  would be hard to see: every cell of it is a name.

  What it deliberately does **not** hold is the calendar the pillars were cast
  from. That is `CalendarAndAlmanac`, and it belongs beside this rather than
  inside it — the section shows it in full, and the consultation has its own
  reasons about what stands under a board it is handing over.
-->
<script lang="ts">
  import { glyph } from '$lib/glyph';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  // Types only. A value import would drag the ephemerides and a native module
  // into the browser bundle — the rule `TaiyiReading` states for all four.
  import type { Bazi, ElementCount, Ganzhi } from '@qimendunjia/core';

  let { bazi, t }: { bazi: Bazi; t: Translator } = $props();

  const say = (pair: Ganzhi): string =>
    `${t(`label.stem.${pair.stem.id}` as MessageKey)} · ${t(`label.branch.${pair.branch.id}` as MessageKey)}`;

  // All five, zeroes included, in the order `formatBazi` prints them: the
  // count exists to show what is absent as much as what abounds.
  const elements = ['mu', 'huo', 'tu', 'jin', 'shui'] as const;
  const counted = (distribution: ElementCount): string =>
    elements
      .map((element) => `${t(`label.element.${element}` as MessageKey)} ${distribution[element]}`)
      .join(' · ');
</script>

<!--
  The reading as one block, centred under the plate.

  The same `.words` `LiurenReading` and `QizhengReading` have, and 八字 did
  without it for as long as its plate stood at 46rem against the left margin:
  the words under it began at the same edge, so there was one axis already.
  The plate is a board's measure now and centred with the other three, and a
  reading left at the margin under it reads as a caption that came loose.
  Left-aligned inside itself, because a centred line of prose is a line nobody
  can come back to.
-->
<div class="words">
  <p class="master">
    {t('cli.field.dayMaster')}: {t(`label.stem.${bazi.dayMaster.id}` as MessageKey)}
    <span class="glyph">{glyph(bazi.dayMaster)}</span>
  </p>

  <p class="master">{t('cli.field.distribution')}: {counted(bazi.distribution)}</p>

  <!-- Five columns that do not break: on a narrow screen it is the table that
       scrolls, not the page.

       Every cell here is a name, and every name carries its reading under it —
       the way the pair always did and the way `formatBazi` says all four. The
       god and the stage used to arrive as a gloss with no glyph, which is the
       half of the rule that does not stand on its own: a reader who cannot look
       up 傷官 shāngguān cannot check a word this page is asking them to trust. -->
  <div class="scroller">
    <table>
      <thead>
        <tr>
          <th></th><th>{t('cli.column.pillar')}</th><th>{t('cli.column.god')}</th>
          <th>{t('cli.column.stage')}</th><th>{t('cli.column.nayin')}</th>
        </tr>
      </thead>
      <tbody>
        {#each bazi.pillars as pillar}
          <tr>
            <th scope="row">{t(`cli.column.${pillar.position}` as MessageKey)}</th>
            <td>
              <span>{say(pillar.ganzhi)}</span>
              <span class="glyph">{glyph(pillar.ganzhi)}</span>
            </td>
            <td>
              {#if pillar.stemGod}
                <span>{t(`label.god.${pillar.stemGod.id}` as MessageKey)}</span>
                <span class="glyph">{glyph(pillar.stemGod)}</span>
              {:else}—{/if}
            </td>
            <td>
              <span>{t(`label.stage.${pillar.stage.id}` as MessageKey)}</span>
              <span class="glyph">{glyph(pillar.stage)}</span>
            </td>
            <!-- 納音, computed for every pillar and shown until now against a
                 年命 alone. Its phase stands for the gloss it has none of: the
                 last character of 天上火 *is* the phase, and that is precisely
                 what this page's reader cannot see. -->
            <td>
              <span>{t(`label.element.${pillar.nayin.element}` as MessageKey)}</span>
              <span class="glyph">{glyph(pillar.nayin)}</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!--
    藏干, with the god each concealed stem is.

    Out of the table above and into one of its own, exactly as `formatBazi`
    puts it: three stems to a pillar do not fit a cell, and the cell they were
    crammed into showed the stems with no gods at all — so the page said four
    relations where the engine had computed eleven, and the largest half of
    what a set of pillars holds was on no surface anywhere.
  -->
  <h2>{t('cli.column.hidden')} <small>{t('cli.value.byWeight')}</small></h2>
  <div class="scroller">
    <table>
      <thead>
        <tr>
          <th></th><th>{t('cli.column.stem')}</th><th>{t('cli.column.god')}</th>
        </tr>
      </thead>
      <!-- A tbody to the pillar, so the position is one header spanning its
           group rather than a word repeated beside three different stems. -->
      {#each bazi.pillars as pillar}
        <tbody>
          {#each pillar.hidden as hidden, rank}
            <tr>
              {#if rank === 0}
                <th scope="rowgroup" rowspan={pillar.hidden.length}>
                  {t(`cli.column.${pillar.position}` as MessageKey)}
                </th>
              {/if}
              <td>
                <span>{t(`label.stem.${hidden.stem.stem.id}` as MessageKey)}</span>
                <span class="glyph">{glyph(hidden.stem.stem)}</span>
              </td>
              <td>
                <span>{t(`label.god.${hidden.god.id}` as MessageKey)}</span>
                <span class="glyph">{glyph(hidden.god)}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      {/each}
    </table>
  </div>

  {#if bazi.luck}
    <h2>{t('cli.heading.luck')}</h2>
    <ul class="cycles">
      {#each bazi.luck.cycles as cycle}
        <li><small>{cycle.startAge}</small> {say(cycle.ganzhi)}</li>
      {/each}
    </ul>
  {:else}
    <!-- Not `cli.error.genderRequired`: that one names `--gender`, which is a
         flag nobody reading a web page has. -->
    <p class="note">{t('form.needed.gender')}</p>
  {/if}
</div>

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.5rem 0 0.5rem; }
  /* The order is the whole of what ranks the concealed stems, so it is said
     where they are and not in a note underneath. */
  h2 small { color: var(--faint); font-weight: 400; margin-left: 0.4rem; }
  /* The measure of the words under a board, shared with the calendar the Four
     Pillars section sets beside them — one axis under the plate or none. */
  .words { max-width: 46rem; margin-inline: auto; }
  table { width: 100%; min-width: max-content; border-collapse: collapse; }
  th, td {
    text-align: left;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid var(--rule);
    vertical-align: baseline;
    white-space: nowrap;
  }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  .glyph { display: block; color: var(--faint); font-size: 0.8em; }
  .master { margin: 0 0 1rem; }
  .cycles {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 0.3rem 1rem;
  }
  .cycles small { color: var(--faint); margin-right: 0.4rem; }
  .note { color: var(--faint); font-size: 0.85em; margin-top: 1rem; }
  /* A table this wide scrolls inside its own frame on a narrow screen — but
     never on paper, where a frame that still clips prints two columns of five
     and gives no sign of the other three. */
  .scroller { overflow-x: auto; }
  @media print {
    .scroller { overflow: visible; }
  }
</style>
