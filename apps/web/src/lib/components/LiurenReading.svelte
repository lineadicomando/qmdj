<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import { glyph } from '$lib/glyph';

  /**
   * A Liu Ren board said in words, under the picture of it.
   *
   * One component for the two surfaces that show a board — the section, where
   * somebody is studying it, and the consultation, where somebody is about to
   * hand it to something that will read it. Two copies would be two things to
   * keep in step, and the names of twelve generals are exactly what drifts.
   *
   * It takes the board as the API returns it. The client imports only types
   * from `core`, so the twelve branches of the ground and the names of the
   * nine rules are written out below: a value import would drag the
   * ephemerides and a native module into the browser bundle.
   */
  let { board, t }: { board: any; t: Translator } = $props();

  const EARTH: readonly { id: string; hanzi: string }[] = [
    { id: 'zi', hanzi: '子' }, { id: 'chou', hanzi: '丑' }, { id: 'yin', hanzi: '寅' },
    { id: 'mao', hanzi: '卯' }, { id: 'chen', hanzi: '辰' }, { id: 'si', hanzi: '巳' },
    { id: 'wu', hanzi: '午' }, { id: 'wei', hanzi: '未' }, { id: 'shen', hanzi: '申' },
    { id: 'you', hanzi: '酉' }, { id: 'xu', hanzi: '戌' }, { id: 'hai', hanzi: '亥' },
  ];

  const RULE_HANZI: Record<string, string> = {
    zeike: '賊剋', biyong: '比用', shehai: '涉害', yaoke: '遙剋', maoxing: '昴星',
    bieze: '別責', bazhuan: '八專', fuyin: '伏吟', fanyin: '返吟',
  };
</script>

<div class="words">
  <p class="caption">
    {t('cli.field.yuejiang')}:
    <strong>{t(`label.yuejiang.${board.yuejiang.id}` as MessageKey)}</strong>
    <span class="glyph">{glyph(board.yuejiang)} · {glyph(board.yuejiang.branch)}</span>
    <span class="term">{t(`label.term.${board.yuejiang.term.id}` as MessageKey)}</span>
  </p>

  <h2>{t('cli.field.transmissions')}</h2>
  <ol class="chuan">
    {#each board.transmissions as transmission}
      <li>
        <span class="which">{t(`label.transmission.${transmission.position}` as MessageKey)}</span>
        <span class="branch">{glyph(transmission.branch)}</span>
        <span class="general">
          {t(`label.general.${transmission.general.id}` as MessageKey)}
          <span class="glyph">{glyph(transmission.general)}</span>
        </span>
        <span class="stem">
          <!-- The decade covers ten branches and the board has twelve, so
               two carry no stem. That absence is the 空亡 and is said as
               one rather than left as a blank cell. -->
          {#if transmission.hiddenStem}
            {t(`label.stem.${transmission.hiddenStem.id}` as MessageKey)}
            <span class="glyph">{glyph(transmission.hiddenStem)}</span>
          {:else}
            <em>{t('cli.value.emptyBranch')}</em>
          {/if}
        </span>
      </li>
    {/each}
  </ol>

  <h2>{t('cli.field.courses')}</h2>
  <!-- Left to right here, and right to left in the drawing. The picture
       is a 課式 and follows the tradition's hand; a list in a European
       page is read the way the page is, and numbering each says which is
       which either way. -->
  <ol class="ke">
    {#each board.courses as course}
      <li>
        <span class="which">{t(`label.course.${course.number}` as MessageKey)}</span>
        <span class="pair">{glyph(course.upper)} / {glyph(course.lower)}</span>
      </li>
    {/each}
  </ol>

  <h2>{t('cli.field.plate')}</h2>
  <!-- Twelve rows that do not break: on a narrow screen it is the table
       that scrolls, not the page — and on paper it does not scroll at
       all, because a frame that clips would print three palaces of
       twelve and say nothing about the other nine. -->
  <div class="scroller">
    <table>
      <thead>
        <tr>
          <th>{t('cli.column.earth')}</th>
          <th>{t('cli.column.heaven')}</th>
          <th>{t('cli.column.general')}</th>
        </tr>
      </thead>
      <tbody>
        {#each board.heaven as over, palace}
          <tr>
            <th scope="row">
              {t(`label.branch.${EARTH[palace].id}` as MessageKey)}
              <span class="glyph">{EARTH[palace].hanzi}</span>
            </th>
            <td>{glyph(over)}</td>
            <td>
              {t(`label.general.${board.generals[palace].id}` as MessageKey)}
              <span class="glyph">{glyph(board.generals[palace])}</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="drawn">
    {t('cli.field.drawnBy')}:
    <strong>{t(`label.liurenRule.${board.rule}` as MessageKey)}</strong>
    <span class="glyph">{glyph({ hanzi: RULE_HANZI[board.rule] ?? '' })}</span>
    <!-- 八專, 別責 and 涉害 name the shape with the same words as the rule
         that found it. Said once rather than twice. -->
    {#if board.keti && t(`label.keti.${board.keti}` as MessageKey) !== t(`label.liurenRule.${board.rule}` as MessageKey)}
      · {t(`label.keti.${board.keti}` as MessageKey)}
    {/if}
  </p>

  <!-- Said where it applies and never in a footnote: this board rests on a
       rule no reference implementation covers. -->
  {#if board.unverified}
    <p class="note">{t('cli.value.liurenUnverified')}</p>
  {/if}

</div>

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.6rem 0 0.5rem; }
  /* A block centred under the picture, with its own text left-aligned:
     they share an axis, and nothing inside is centred. */
  .words { max-width: 44rem; margin-inline: auto; }
  .caption { margin: 0 0 1rem; }
  .caption .term { color: var(--faint); }
  .glyph { color: var(--faint); font-size: 0.85em; }
  .chuan, .ke { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.35rem; }
  /* Measured columns rather than fractions: a transmission is four short
     things, and `1fr` each pushed the stem to the far side of a wide screen
     with nothing in between to carry the eye. */
  .chuan li { display: grid; grid-template-columns: 6rem 5rem 13rem auto; gap: 0.5rem; align-items: baseline; }
  .ke li { display: grid; grid-template-columns: 6rem auto; gap: 0.5rem; align-items: baseline; }
  .which { color: var(--faint); font-size: 0.85em; }
  .branch, .pair { font-size: 1.05em; }
  .stem em { font-style: normal; color: var(--faint); }
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
  .drawn { margin-top: 1.4rem; }
  .note { color: var(--faint); font-size: 0.85em; }

  /* On paper the table gives up its scrolling frame: one that still clipped
     would print three rows of twelve and give no sign of the other nine. */
  @media print {
    .scroller { overflow: visible; }
  }
</style>
