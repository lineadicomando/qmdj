<!--
  The four pillars read out: the day master, the pillars at a glance, the same
  four in a table, and the decades where a direction was given for them.

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

  let { bazi, t }: { bazi: any; t: Translator } = $props();

  const say = (pair: any): string =>
    `${t(`label.stem.${pair.stem.id}` as MessageKey)} · ${t(`label.branch.${pair.branch.id}` as MessageKey)}`;
</script>

<p class="master">
  {t('cli.field.dayMaster')}: {t(`label.stem.${bazi.dayMaster.id}` as MessageKey)}
  <span class="glyph">{glyph(bazi.dayMaster)}</span>
</p>

<!-- Five columns that do not break: on a narrow screen it is the table that
     scrolls, not the page. -->
<div class="scroller">
  <table>
    <thead>
      <tr>
        <th></th><th>{t('cli.column.pillar')}</th><th>{t('cli.column.god')}</th>
        <th>{t('cli.column.hidden')}</th><th>{t('cli.column.stage')}</th>
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
          <td>{#if pillar.stemGod}{t(`label.god.${pillar.stemGod.id}` as MessageKey)}{:else}—{/if}</td>
          <td>{pillar.hidden.map((h: any) => t(`label.stem.${h.stem.stem.id}` as MessageKey)).join(', ')}</td>
          <td>{t(`label.stage.${pillar.stage.id}` as MessageKey)}</td>
        </tr>
      {/each}
    </tbody>
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

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.5rem 0 0.5rem; }
  table { width: 100%; min-width: max-content; max-width: 46rem; border-collapse: collapse; }
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
