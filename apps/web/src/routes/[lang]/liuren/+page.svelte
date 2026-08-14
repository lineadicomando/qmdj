<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import LiurenReading from '$lib/components/LiurenReading.svelte';
  import Takeaway from '$lib/components/Takeaway.svelte';
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
      bind:guiren
    />
    <SubmitButton {t} label="cli.heading.liuren" {busy} />
  {/snippet}
  {#snippet controls()}
    {#if board}
      <Takeaway {t} copyLabel="form.copyBoard" copyUrl="/api/liuren/text?{address}" />
    {/if}
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
        height="1379"
        class="screen"
        class:settling={drawn !== plate}
        onload={() => (drawn = plate)}
      />
      {#if onPaper}<img src={paper} alt="" width="900" height="1379" class="paper" />{/if}
    </div>

    <div>
      <LiurenReading {board} {t} />

    </div>
  </div>
{/if}

<style>

  .result { transition: opacity 0.15s ease-out; display: grid; gap: 2rem; }
  .stale { opacity: 0.5; }

  /* Centred, as the chart's board is. An earlier version pushed the picture
     to the margin so that it shared a left edge with the reading; sharing an
     **axis** is the same fix made on the right half — the words are centred
     as a block under it and stay left-aligned inside themselves, because a
     centred line of prose is a line nobody can come back to. */
  .board img { width: 100%; max-width: 34rem; height: auto; display: block; margin-inline: auto; }
  .board .paper { display: none; }
  /* Held in place while the next board is on its way, rather than blanking. */
  .screen { transition: opacity 0.2s ease-out; }
  .settling { opacity: 0.6; }

  .failure { color: var(--alarm); }

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
      .board img { max-width: 26rem; }
  }
</style>
