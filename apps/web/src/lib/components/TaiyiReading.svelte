<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import { glyph } from '$lib/glyph';

  /**
   * A 太乙 board said in words, under the picture of it.
   *
   * Three tables. The first is what the year put where — the two eyes, the two
   * counts, the four generals — and it is laid out so that **the host's column
   * and the guest's are the same width and neither comes first**: naming the
   * two parties is the reader's first act, for the reason choosing a 用神 is,
   * and a layout that led with one of them would have made the choice.
   *
   * The sixteen are not listed again at the foot of it. They stand on the
   * drawing above, each in its own cell with its reading under it, and a band
   * repeating the same sixteen names in the same order was a legend to a
   * picture that had stopped needing one.
   *
   * The second is the sixteen seats, which is the ring the whole board is read
   * on. The third is the longer circuits — the gate on duty, the three bases,
   * the five blessings, the great circuit — each of which turns on a scale of
   * decades and is therefore the part of this board a reader is most likely to
   * be checking against a date.
   *
   * It takes the board as the API returns it. The client imports only types
   * from `core`: a value import would drag the ephemerides and a native module
   * into the browser bundle.
   */
  let { board, t }: { board: any; t: Translator } = $props();

  const sides = $derived([
    { key: 'host', eye: board.wenchang, side: board.host, eyeWord: 'label.taiyi.wenchang', count: 'label.taiyi.hostCount' },
    { key: 'guest', eye: board.shiji, side: board.guest, eyeWord: 'label.taiyi.shiji', count: 'label.taiyi.guestCount' },
  ]);

  /** A palace of this board: the trigram, and the number *this* board gives it. */
  const seat = (palace: any): string => `${glyph(palace)} ${palace.number}`;
</script>

<div class="words">
  <p class="caption">
    {t('label.taiyi.taiyi')}
    <strong>{seat(board.taiyi.palace)}</strong>
    <span class="glyph">{board.taiyi.year}/3</span>
    · {t('label.taiyi.ju')} <strong>{board.ju}</strong>
    · {t('label.taiyi.liuji')} <strong>{board.liuji.number}</strong>
    <span class="glyph">{board.liuji.year}/60</span>
  </p>

  <h2>{t('cli.field.taiyiEyes')}</h2>
  <div class="scroller">
    <table>
      <thead>
        <tr>
          <th></th>
          <th>{t('cli.field.taiyiEyes')}</th>
          <th>{t('cli.field.taiyiCounts')}</th>
          <th>{t('label.taiyi.general')}</th>
          <th>{t('label.taiyi.assistant')}</th>
        </tr>
      </thead>
      <tbody>
        {#each sides as one}
          <tr>
            <th scope="row">{t(one.eyeWord as MessageKey)}</th>
            <td>
              {t(`label.taiyishen.${one.eye.id}` as MessageKey)}
              <span class="glyph">{glyph(one.eye)}</span>
            </td>
            <td class="count">{one.side.count}</td>
            <td>{seat(one.side.general)}</td>
            <!-- Absent where the count reduced to the centre, which is on no
                 ring. The text states no rotation from there and none is
                 invented here. -->
            <td>{one.side.assistant ? seat(one.side.assistant) : '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="caption">
    {t('label.taiyi.jishen')} <span class="glyph">{glyph(board.jishen)}</span>
    · {t('label.taiyi.heshen')} <span class="glyph">{glyph(board.heshen)}</span>
  </p>

  {#if board.patterns.length > 0}
    <h2>{t('cli.field.taiyiConditions')}</h2>
    <div class="scroller">
      <table>
        <tbody>
          <!-- In the order the engine found them, never sorted by fortune: a
               board with six adverse conditions is not a worse board, because
               worse is a word about somebody's undertaking and no undertaking
               is known here. -->
          {#each board.patterns as pattern}
            <tr>
              <th scope="row">
                {t(`label.taiyipattern.${pattern.id}` as MessageKey)}
                <span class="glyph">{glyph(pattern)}</span>
              </th>
              <td class="glyph">{glyph(pattern.valence)}</td>
              <td>{t(`label.taiyi.${pattern.subject}` as MessageKey)}</td>
              <td>
                {#if pattern.kind}{t(`label.taiyikind.${pattern.kind}` as MessageKey)}{/if}
                {#if pattern.partner}· {t(`label.taiyi.${pattern.partner}` as MessageKey)}{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <h2>{t('cli.field.taiyiCircuits')}</h2>
  <div class="scroller">
    <table>
      <tbody>
        <tr>
          <th scope="row">{t('label.taiyi.zhishi')}</th>
          <td>{t(`label.gate.${board.gate.gate.id}` as MessageKey)}
            <span class="glyph">{glyph(board.gate.gate)}</span></td>
          <td class="count">{board.gate.year}/30</td>
        </tr>
        <tr>
          <th scope="row">{t('label.taiyi.wufu')}</th>
          <td>
            {t(`label.taiyiwufu.${board.wufu.palace.id}` as MessageKey)}
            <span class="glyph">{glyph(board.wufu.palace)} · {glyph(board.wufu.palace.palace)}</span>
          </td>
          <td class="count">{board.wufu.year}/45</td>
        </tr>
        <tr>
          <th scope="row">{t('label.taiyi.dayou')}</th>
          <td>{seat(board.dayou.station.palace)}
            <span class="glyph">{glyph(board.dayou.wenchang)}</span></td>
          <td class="count">{board.dayou.station.year}/36</td>
        </tr>
        {#each [['junji', board.sanji.jun, 30], ['chenji', board.sanji.chen, 3], ['minji', board.sanji.min, 1]] as [id, fief, span]}
          <tr>
            <th scope="row">{t(`label.taiyi.${id}` as MessageKey)}</th>
            <td class="glyph">{glyph(fief.branch)}</td>
            <td class="count">{fief.year}/{span}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!--
    Said where a reader is counting, and never in a footnote: it answers
    whoever has a Qi Men chart open beside this and is about to read every
    palace one seat wrong.

    It used to have a second line beside it, saying what this board was
    checked against. That is a fact about the figure rather than a caption to
    this year's board, and it has gone to the notes with the rest of what this
    engine knows about its own footing; the transcript still carries it, since
    a transcript travels to where no notes page follows it.
  -->
  <p class="note">{t('cli.value.taiyiPalaces')}</p>
</div>

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.6rem 0 0.5rem; }
  .words { max-width: 44rem; margin-inline: auto; }
  .caption { margin: 0 0 1rem; }
  .glyph { color: var(--faint); font-size: 0.85em; }
  .count { font-variant-numeric: tabular-nums; }
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

  /* On paper the tables give up their scrolling frames, as every other table
     on this site does: one that still clipped would print three columns of
     five and give no sign of the other two. */
  @media print {
    .scroller { overflow: visible; }
  }
</style>
