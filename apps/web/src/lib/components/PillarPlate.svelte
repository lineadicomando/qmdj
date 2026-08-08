<script lang="ts">
  import { glyph } from '$lib/glyph';
  import type { BaziPillar } from '@qimendunjia/core';
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
  let { pillars, t }: { pillars: readonly BaziPillar[]; t: Translator } = $props();
</script>

<div class="plate">
  {#each pillars as pillar (pillar.position)}
    <div class="cell" style="--element: var(--element-{pillar.ganzhi.stem.element})">
      <div class="registers">
        <!-- The pillar names itself in the corner, as a palace does. -->
        <p class="corner">{t(`cli.column.${pillar.position}` as MessageKey)}</p>
        <!-- The day pillar has no god: it is the day master, the point every
             other god is measured from, and it says so instead. -->
        <p class="god">
          {#if pillar.stemGod}
            {t(`label.god.${pillar.stemGod.id}` as MessageKey)}
          {:else}
            {t('cli.field.dayMaster')}
          {/if}
        </p>
        <p class="pair">
          <span>{t(`label.stem.${pillar.ganzhi.stem.id}` as MessageKey)}</span>
          <span class="glyph">{glyph(pillar.ganzhi.stem)}</span>
        </p>
        <p class="pair">
          <span>{t(`label.branch.${pillar.ganzhi.branch.id}` as MessageKey)}</span>
          <span class="glyph">{glyph(pillar.ganzhi.branch)}</span>
        </p>
        <p class="stage">{t(`label.stage.${pillar.stage.id}` as MessageKey)}</p>
      </div>
    </div>
  {/each}
</div>

<style>
  .plate {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    max-width: 46rem;
    border: 1px solid var(--rule);
    margin: 0 0 1.5rem;
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
  .pair span:first-child { font-size: 11cqw; }
  .glyph { font-size: 9cqw; color: var(--faint); }
  /* Along the foot, where the board writes what fell in a palace. */
  .stage { margin-top: auto; font-size: 8cqw; color: var(--faint); }
</style>
