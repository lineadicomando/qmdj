<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { appearance } from '$lib/appearance.svelte';
  import { glyph } from '$lib/glyph';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  // svelte-ignore state_referenced_locally
  let guiren = $state(data.guiren);
  $effect(() => {
    asked = { ...data.moment };
    guiren = data.guiren;
  });

  const board = $derived(data.result?.liuren);
  const moment = $derived(data.result?.moment);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');

  let busy = $state(false);
  let panel: FormPanel | undefined = $state();
  let drawn = $state('');

  // The address the answer was laid for, so the picture and the words agree.
  const address = $derived(
    momentQuery(
      { ...data.moment, date: moment?.input.date ?? data.moment.date, time: moment?.input.time ?? data.moment.time },
      { guiren: data.guiren, lang: t.locale },
    ),
  );

  const plate = $derived(`/api/liuren/plate?${address}&scheme=${appearance.current}`);

  /**
   * The same board, drawn for paper.
   *
   * An `<img>` carries its colours in its address, so no stylesheet here can
   * turn a dark board light on its way to a printer. A second copy in the
   * light scheme, hidden on screen, warmed as soon as the board is laid —
   * `beforeprint` is synchronous and cannot wait for a picture. Exactly the
   * pair the chart draws, for exactly the reason set out there.
   */
  const onPaper = $derived(appearance.current !== 'light');
  const paper = $derived(`/api/liuren/plate?${address}&scheme=light`);
  $effect(() => {
    if (!board || !onPaper) return;
    const warm = new Image();
    warm.src = paper;
    void warm.decode().catch(() => {});
  });

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    busy = true;
    try {
      const query = momentQuery(asked, { guiren });
      await goto(`${page.url.pathname}${query ? `?${query}` : ''}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    } finally {
      busy = false;
    }
    if (!data.failure && data.result) await panel?.close();
  }

  /**
   * The twelve branches of the 地盤, and the names of the nine rules.
   *
   * Written out here because **the client imports only types from `core`**: a
   * value import would drag the ephemerides and a native module into the
   * browser bundle. The ground never moves and the rules are nine, so the
   * copy is small and cannot go stale in the way a table of results could.
   */
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

<svelte:head><title>{t('cli.heading.liuren')}</title></svelte:head>

<h1 class="offscreen">{t('cli.heading.liuren')}</h1>

<FormPanel {t} bind:this={panel} closable={board !== undefined} onsubmit={submit}>
  {#snippet fields()}
    <MomentForm
      {t}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
    />
    <label>
      <!-- The one divergence worth offering, and the label says what moving it
           costs: it changes the generals and leaves the transmissions alone.
           An option reading `chou` would be one nobody could choose on
           purpose, so each says which verse it is in the reader's own words. -->
      {t('form.guiren')}
      <select bind:value={guiren}>
        <option value="chou">{t('form.guiren.chou')}</option>
        <option value="wei">{t('form.guiren.wei')}</option>
      </select>
      <small>{t('form.guiren.note')}</small>
    </label>
    <SubmitButton {t} label="cli.heading.liuren" {busy} />
  {/snippet}
  {#snippet summary()}
    {data.moment.date || '—'}
    {data.moment.time}
    {data.moment.place ? `· ${data.moment.place.name}` : ''}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if board}
  <div class="result" class:stale={busy} aria-busy={busy}>
    <div class="board">
      <img
        src={plate}
        alt=""
        width="900"
        height="1220"
        class="screen"
        class:settling={drawn !== plate}
        onload={() => (drawn = plate)}
      />
      {#if onPaper}<img src={paper} alt="" width="900" height="1220" class="paper" />{/if}
    </div>

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

      <div class="tools">
        <button type="button" class="print" onclick={() => window.print()}>
          {t('form.print')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  h2 { font-size: 1em; font-weight: 500; margin: 1.6rem 0 0.5rem; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 26rem; }
  label :global(select) { color: var(--ink); }
  label small { font-size: 0.85em; }

  .result { transition: opacity 0.15s ease-out; display: grid; gap: 2rem; }
  .stale { opacity: 0.5; }

  .board img { width: 100%; max-width: 34rem; height: auto; display: block; margin-inline: auto; }
  .board .paper { display: none; }
  /* Held in place while the next board is on its way, rather than blanking. */
  .screen { transition: opacity 0.2s ease-out; }
  .settling { opacity: 0.6; }

  /* A column, not a page: the board above is 34rem and the words under it
     read as its caption rather than as a second, wider thing. */
  .words { max-width: 44rem; }
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
  .failure { color: var(--alarm); }
  .tools { margin-top: 1.5rem; }
  .print {
    font: inherit;
    font-size: 0.9em;
    color: var(--faint);
    background: none;
    border: 1px solid var(--rule);
    border-radius: 0.2rem;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
  }
  .print:hover { color: var(--ink); border-color: var(--edge); }

  @media (prefers-reduced-motion: reduce) {
    .result, .screen { transition: none; }
  }

  /**
   * On paper.
   *
   * The picture swaps for the copy drawn in the colours of a sheet, the table
   * gives up its scrolling frame — a frame that still clips on paper prints
   * three rows of twelve and gives no sign of the other nine — and the button
   * that started the printing does not print itself.
   */
  @media print {
    .result { display: block; }
    .board .screen { display: none; }
    .board .paper { display: block; }
    .scroller { overflow: visible; }
    .tools { display: none; }
    .board img { max-width: 26rem; }
  }
</style>
