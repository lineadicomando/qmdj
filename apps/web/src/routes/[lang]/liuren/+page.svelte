<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import LiurenReading from '$lib/components/LiurenReading.svelte';
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

    <div>
      <LiurenReading {board} {t} />

      <div class="tools">
        <button type="button" class="print" onclick={() => window.print()}>
          {t('form.print')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 26rem; }
  label :global(select) { color: var(--ink); }
  label small { font-size: 0.85em; }

  .result { transition: opacity 0.15s ease-out; display: grid; gap: 2rem; }
  .stale { opacity: 0.5; }

  /* Left, not centred: the reading under it starts at the margin, and a
     picture centred over a caption that is not shares no edge with it. */
  .board img { width: 100%; max-width: 34rem; height: auto; display: block; }
  .board .paper { display: none; }
  /* Held in place while the next board is on its way, rather than blanking. */
  .screen { transition: opacity 0.2s ease-out; }
  .settling { opacity: 0.6; }

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
   * The picture swaps for the copy drawn in the colours of a sheet, and the
   * button that started the printing does not print itself. What the table
   * under it owes a printer is settled in `LiurenReading`, where the table is.
   */
  @media print {
    .result { display: block; }
    .board .screen { display: none; }
    .board .paper { display: block; }
    .tools { display: none; }
    .board img { max-width: 26rem; }
  }
</style>
