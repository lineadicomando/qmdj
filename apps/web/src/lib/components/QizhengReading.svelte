<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import CalendarAndAlmanac from './CalendarAndAlmanac.svelte';
  import { glyph } from '$lib/glyph';

  /**
   * A 七政四餘 board said in words, under the picture of it.
   *
   * Two tables and not one, because the board holds two frames at once and
   * neither is the other's approximation. The first is the eleven, each with
   * the 宿 it fell in and the degrees past that 宿's determinative star; the
   * second is the twelve palaces, each with the 人事宮 it took and whatever
   * came to stand there. A single table would have to choose which of the two
   * is the index, and both are.
   *
   * It takes the board as the API returns it. The client imports only types
   * from `core`, so the two standing notes and the phases are read off what
   * arrives rather than looked up: a value import would drag the ephemerides
   * and a native module into the browser bundle.
   */
  let { board, t, moment = null }: { board: any; t: Translator; moment?: any } = $props();

  const placed = $derived([...board.governors, ...board.remainders]);

  /** What stands in each palace, by the palace's index on the ring. */
  const standing = $derived(
    board.houses.map((seat: any) =>
      placed.filter((one: any) => one.palace.index === seat.palace.index),
    ),
  );

  const degrees = (value: number): string => `${value.toFixed(2)}°`;
</script>

<div class="words">
  <p class="caption">
    {t('cli.field.minggong')}:
    <strong>{t(`label.ci.${board.minggong.ci.id}` as MessageKey)}</strong>
    <span class="glyph">{glyph(board.minggong.palace)} · {glyph(board.minggong.ci)}</span>
  </p>

  <h2>{t('cli.field.governors')}</h2>
  <div class="scroller">
    <table>
      <thead>
        <tr>
          <th>{t('cli.column.body')}</th>
          <th>{t('cli.column.inLodge')}</th>
          <th>{t('cli.column.inPalace')}</th>
          <th>{t('cli.column.motion')}</th>
        </tr>
      </thead>
      <tbody>
        {#each placed as one}
          <tr>
            <th scope="row">
              {t(`label.qizheng.${one.body.id}` as MessageKey)}
              <span class="glyph">{glyph(one.body)}</span>
            </th>
            <td>{glyph(one.lodge)} <span class="deg">{degrees(one.lodgeDegree)}</span></td>
            <td>{glyph(one.ci)} <span class="deg">{degrees(one.palaceDegree)}</span></td>
            <td class="way">
              {t(`label.motion.${one.motion}` as MessageKey)}
              <span class="glyph">{one.motion === 'ni' ? '逆 nì' : '順 shùn'}</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h2>{t('cli.field.houses')}</h2>
  <div class="scroller">
    <table class="palaces">
      <thead>
        <tr>
          <th>{t('cli.column.palace')}</th>
          <th>{t('cli.column.house')}</th>
          <th>{t('cli.column.standing')}</th>
        </tr>
      </thead>
      <tbody>
        {#each board.houses as seat, index}
          <tr>
            <th scope="row">
              {t(`label.ci.${seat.ci.id}` as MessageKey)}
              <span class="glyph">{glyph(seat.ci)}</span>
            </th>
            <td>
              {t(`label.house.${seat.house.id}` as MessageKey)}
              <span class="glyph">{glyph(seat.house)}</span>
            </td>
            <td class="standing">
              <!-- Most palaces hold nothing, which is what a sky looks like.
                   An empty cell says that better than a word for it would. -->
              {#each standing[index] as one, position}
                {position > 0 ? ' · ' : ''}<span class="glyph">{glyph(one.body)}</span>
              {/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- The calendar this board was laid from and the almanac page it is read
       beside, named apart. One component with the chart's and the 六壬
       board's, so the three cannot drift. -->
  <CalendarAndAlmanac {moment} {t} />

  <!-- Both said where a reader is counting, and never in a footnote. The
       first answers whoever counted three names and expected four; the
       second answers whoever is holding an almanac open beside this and is
       about to conclude the degrees are wrong. -->
  <p class="note">{t('cli.value.threeRemainders')}</p>
  <p class="note">{t('cli.value.qizhengFrame')}</p>
</div>

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.6rem 0 0.5rem; }
  .words { max-width: 44rem; margin-inline: auto; }
  .caption { margin: 0 0 1rem; }
  .glyph { color: var(--faint); font-size: 0.85em; }
  .deg { font-variant-numeric: tabular-nums; }
  .way { color: var(--faint); }
  .scroller { overflow-x: auto; }
  table { width: 100%; min-width: max-content; max-width: 40rem; border-collapse: collapse; }
  th, td {
    text-align: left;
    padding: 0.3rem 0.6rem;
    border-bottom: 1px solid var(--rule);
    vertical-align: baseline;
    white-space: nowrap;
  }
  thead th { color: var(--faint); font-weight: 400; font-size: 0.85em; }
  .note { color: var(--faint); font-size: 0.85em; margin: 0.6rem 0 0; }

  /* The one column that wraps, and the one table that lets it.
     Every other cell here holds one short thing, and `max-content` is what
     keeps those from being squashed on a narrow screen. But a crowded palace
     holds four bodies, and under `max-content` a cell that *may* wrap is
     measured as though it never does — so the table went to its scrolling
     frame for the sake of the one row in twelve that needed it. This table
     gives up the floor and lets that column take the lines it takes. */
  .palaces { min-width: 0; }
  .palaces .standing { white-space: normal; min-width: 10rem; }

  /* On paper the tables give up their scrolling frames, as the chart's table
     of palaces does: one that still clipped would print four rows of eleven
     and give no sign of the other seven. */
  @media print {
    .scroller { overflow: visible; }
  }
</style>
