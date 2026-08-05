<script lang="ts">
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
          <span class="glyph">{cell.palace.hanzi}</span>
        </th>
        <td>
          <span>{gloss('stem', cell.earth.id)}</span>
          <span class="glyph">{cell.earth.hanzi}</span>
        </td>
        <td>
          <span>{gloss('stem', cell.heaven.id)}</span>
          <span class="glyph">{cell.heaven.hanzi}</span>
        </td>
        <td>
          <span>{gloss('star', cell.star.id)}</span>
          <span class="glyph">{cell.star.hanzi} · {gloss('strength', cell.starStrength.id)}</span>
        </td>
        <td>
          {#if cell.gate}
            <span>{gloss('gate', cell.gate.id)}</span>
            <span class="glyph">{cell.gate.hanzi}{#if cell.gateStrength} · {gloss('strength', cell.gateStrength.id)}{/if}</span>
          {:else}<span class="gloss">—</span>{/if}
        </td>
        <td>
          {#if cell.spirit}
            <span>{gloss('spirit', cell.spirit.id)}</span>
            <span class="glyph">{cell.spirit.hanzi}</span>
          {:else}<span class="gloss">—</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid var(--rule); vertical-align: baseline; }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  /* The word leads; the name it renders sits under it, small. */
  th span:first-child, td span:first-child { display: block; }
  .glyph { display: block; color: var(--faint); font-size: 0.8em; }
  .gloss { display: block; color: var(--faint); font-size: 0.8em; }
</style>
