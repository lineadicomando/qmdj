<script lang="ts">
  import { glyph } from '$lib/glyph';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  /**
   * Takes the palaces, not the chart.
   *
   * A table bound to a whole `QimenChart` could only ever show one; taking
   * the rows means the same table serves a chart, a comparison, or whatever
   * comes next.
   */
  let { palaces, t }: { palaces: readonly any[]; t: Translator } = $props();

  const gloss = (prefix: string, id: string): string => t(`label.${prefix}.${id}` as MessageKey);
</script>

<table>
  <thead>
    <tr>
      <th>{t('cli.column.palace')}</th>
      <th>{t('cli.column.earth')}</th>
      <th>{t('cli.column.heaven')}</th>
      <th>{t('cli.column.star')}</th>
      <th>{t('cli.column.gate')}</th>
      <th>{t('cli.column.spirit')}</th>
    </tr>
  </thead>
  <tbody>
    {#each palaces as cell (cell.palace.number)}
      <tr>
        <th scope="row">
          <span>{cell.palace.number} {gloss('palace', cell.palace.id)}</span>
          <span class="glyph">{glyph(cell.palace)}</span>
        </th>
        <td>
          <span>{gloss('stem', cell.earth.id)}</span>
          <span class="glyph">{glyph(cell.earth)}</span>
          <!-- 寄宮, on the one palace that hosts the centre. In the cell and
               not in a footnote: whoever reads this row is the person the
               lodging is for. Guarded like the relations above — a chart is
               cached private for a day, so this meets charts cast before the
               field existed. -->
          {#if cell.lodged}
            <span class="gloss">{t('cli.field.lodgedShort', { stem: gloss('stem', cell.lodged.id) })}</span>
            <span class="glyph">{glyph(cell.lodged)}</span>
          {/if}
        </td>
        <td>
          <span>{gloss('stem', cell.heaven.id)}</span>
          <span class="glyph">{glyph(cell.heaven)}</span>
        </td>
        <td>
          <span>{gloss('star', cell.star.id)}</span>
          <span class="glyph">{glyph(cell.star)} · {gloss('strength', cell.starStrength.id)}</span>
          <!-- How it stands to the palace it is in, under how it stands to the
               season. Two questions of the same thing, told apart by the glyph
               that names only the second: 旺相休囚死 is the season and 生我 ·
               剋我 · 比和 is the ground.

               Guarded like the horses in `ChartReading`, and for the same
               reason: a chart is cached private for a day, so a field added to
               the engine meets charts cast before it existed. -->
          {#if cell.starRelation}
            <span class="glyph">{glyph(cell.starRelation)} · {gloss('relation', cell.starRelation.id)}</span>
          {/if}
        </td>
        <td>
          {#if cell.gate}
            <span>{gloss('gate', cell.gate.id)}</span>
            <!-- The space is written out: Svelte trims what sits against the
                 edge of a block, and the name would touch the separator. -->
            <span class="glyph">{glyph(cell.gate)}{#if cell.gateStrength}&nbsp;· {gloss('strength', cell.gateStrength.id)}{/if}</span>
            {#if cell.gateRelation}
              <span class="glyph">{glyph(cell.gateRelation)} · {gloss('relation', cell.gateRelation.id)}</span>
            {/if}
          {:else}<span class="gloss">—</span>{/if}
        </td>
        <td>
          {#if cell.spirit}
            <span>{gloss('spirit', cell.spirit.id)}</span>
            <span class="glyph">{glyph(cell.spirit)}</span>
          {:else}<span class="gloss">—</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  /* As wide as its content asks for inside a scrolling frame, and no
     narrower: six columns squeezed into a phone break every name in two. */
  table { width: 100%; min-width: max-content; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid var(--rule); vertical-align: baseline; }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  /* The word leads; the name it renders sits under it, small. */
  th span:first-child, td span:first-child { display: block; }
  .glyph { display: block; color: var(--faint); font-size: 0.8em; }
  .gloss { display: block; color: var(--faint); font-size: 0.8em; }
</style>
