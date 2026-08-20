<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, sayPlace, type MomentInput } from '$lib/moment';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import QizhengReading from '$lib/components/QizhengReading.svelte';
  import Takeaway from '$lib/components/Takeaway.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  // svelte-ignore state_referenced_locally
  let luohou = $state(data.luohou);
  $effect(() => {
    asked = { ...data.moment };
    luohou = data.luohou;
  });

  const board = $derived(data.result?.qizheng);
  const moment = $derived(data.result?.moment);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');

  /**
   * Where the answer says it was cast, on the bar and on paper.
   *
   * The place if that is all there is, and the coordinates with it when they
   * were given: a line saying only «Roma» over a board laid at a pair of
   * degrees somebody typed would be claiming a place that was refined away.
   */
  const where = $derived(sayPlace(data.moment));

  let busy = $state(false);
  let panel: FormPanel | undefined = $state();
  let drawn = $state('');

  // The address the answer was placed for, so the picture and the words agree.
  const address = $derived(
    momentQuery(
      {
        ...data.moment,
        date: moment?.input.date ?? data.moment.date,
        time: moment?.input.time ?? data.moment.time,
      },
      { luohou: data.luohou, lang: t.locale },
    ),
  );

  const plate = $derived(`/api/qizheng/plate?${address}&scheme=${appearance.current}`);

  /**
   * The same board, drawn for paper.
   *
   * An `<img>` carries its colours in its address, so no stylesheet here can
   * turn a dark board light on its way to a printer. A second copy in the
   * light scheme, hidden on screen, warmed as soon as the board is placed —
   * `beforeprint` is synchronous and cannot wait for a picture. The same pair
   * both other boards draw, for the same reason.
   */
  const onPaper = $derived(appearance.current !== 'light');
  const paper = $derived(`/api/qizheng/plate?${address}&scheme=light`);
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
      const query = momentQuery(asked, { luohou });
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

<svelte:head><title>{t('cli.heading.qizheng')}</title></svelte:head>

<h1 class="offscreen">{t('cli.heading.qizheng')}</h1>

<FormPanel {t} bind:this={panel} closable={board !== undefined} onsubmit={submit}>
  {#snippet fields()}
    <MomentForm
      {t}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:latitude={asked.latitude}
      bind:longitude={asked.longitude}
      bind:timezone={asked.timezone}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
      bind:luohou
    />
    <SubmitButton {t} label="cli.heading.qizheng" {busy} />
  {/snippet}
  {#snippet controls()}
    {#if board}
      <Takeaway {t} copyLabel="form.copyStars" copyUrl="/api/qizheng/text?{address}" />
    {/if}
  {/snippet}

  {#snippet summary()}
    {data.moment.date || '—'}
    {data.moment.time}
    {where ? `· ${where}` : ''}
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
        height="1450"
        class="screen"
        class:settling={drawn !== plate}
        onload={() => (drawn = plate)}
      />
      {#if onPaper}<img src={paper} alt="" width="900" height="1450" class="paper" />{/if}
    </div>

    <div>
      <QizhengReading {board} {t} {moment} />
    </div>
  </div>
{/if}

<style>
  /*
   * One column, and what matters about it is that its floor is zero.
   *
   * The tables under the board ask for `min-width: max-content`: every cell
   * holds one short thing, and squashing them is worse than scrolling them,
   * which is why each of them sits in a frame of its own that scrolls. But an
   * `auto` track is at least as wide as what stands in it asks to be, and a
   * scrolling frame around a table asking for 44rem asks for 44rem all the
   * same — so on a narrow screen the column grew past the page and the *page*
   * scrolled sideways, which is the one thing the frames were there to
   * prevent. This board showed it first because its tables are the widest on
   * the site, but nothing about it was this board's.
   *
   * `minmax(0, 1fr)` is leave for the track to be narrower than its contents,
   * and it is what makes the frames work at all. The consultation has said it
   * since it was written.
   */
  .result {
    transition: opacity 0.15s ease-out;
    display: grid;
    gap: 2rem;
    grid-template-columns: minmax(0, 1fr);
  }
  .stale { opacity: 0.5; }

  /* Centred, at the measure every board on this site is drawn at: see
     `--board` in `app.css`. This one had 44rem of its own — wider than the
     other three because it carries a listing of eleven and a band of readings
     on top of the ring, and at their width the cells came out a third of the
     size and the listing smaller than the page's own smallest type. That
     argument was for a floor and it is answered by any measure above it; what
     it never argued for was a width no other board shares. */
  .board img { width: 100%; inline-size: var(--board); height: auto; display: block; margin-inline: auto; }
  .board .paper { display: none; }
  .screen { transition: opacity 0.2s ease-out; }
  .settling { opacity: 0.6; }

  .failure { color: var(--alarm); }

  @media (prefers-reduced-motion: reduce) {
    .result, .screen { transition: none; }
  }

  /**
   * On paper.
   *
   * The picture swaps for the copy drawn in the colours of a sheet. What the
   * two tables under it owe a printer is settled in `QizhengReading`, where
   * the tables are.
   */
  @media print {
    .result { display: block; }
    .board .screen { display: none; }
    .board .paper { display: block; }
    .board img { max-width: 26rem; }
  }
</style>
