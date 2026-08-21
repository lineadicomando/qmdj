<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, sayPlace, type MomentInput } from '$lib/moment';
  import ZiweiReading from '$lib/components/ZiweiReading.svelte';
  import { ziweiSeatBoxes } from '@qimendunjia/plate';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';
  import Takeaway from '$lib/components/Takeaway.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  // The fields are edited, so they are state; the address is what they were
  // last asked as, so arriving at one puts them back.
  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  // svelte-ignore state_referenced_locally
  let gender = $state(data.gender);
  $effect(() => {
    asked = { ...data.moment };
    gender = data.gender;
  });

  const result = $derived(data.result);
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

  /**
   * What the board is still waiting for.
   *
   * The date, and nothing else: the place refines the hour and the sex only
   * turns the limits and the rings, so a board without either is shorter
   * rather than wrong. Without a date there is no board at all — see
   * `+page.ts`.
   */
  const needed = $derived(asked.date ? undefined : ('form.needed.date' as const));

  /**
   * The same board, for whatever is asked of it in words.
   *
   * Pinned to the instant the answer was cast for rather than to the fields,
   * as on every other section: the hour the transcript is fetched for has to
   * be the hour the columns on screen were cut from. The sex travels with it,
   * because the decade cycles are in the transcript and their direction is
   * read off it — an address that dropped it would copy a shorter reading
   * than the page is showing.
   */
  const address = $derived(
    momentQuery(
      {
        ...data.moment,
        date: result?.moment.input.date ?? data.moment.date,
        time: result?.moment.input.time ?? data.moment.time,
      },
      { gender: data.gender, lang: t.locale },
    ),
  );

  const plate = $derived(`/api/ziwei/plate?${address}&scheme=${appearance.current}`);

  /**
   * The same board, drawn for paper.
   *
   * An `<img>` carries its colours in its address, so no stylesheet here can
   * turn a dark board light on its way to a printer. A second copy in the
   * light scheme, hidden on screen, warmed as soon as the board is cast —
   * `beforeprint` is synchronous and cannot wait for a picture. The same pair
   * every other drawn board keeps.
   */
  const onPaper = $derived(appearance.current !== 'light');
  const paper = $derived(`/api/ziwei/plate?${address}&scheme=light`);
  let drawn = $state('');

  /**
   * Which seat the reader is pointing at, by the branch it stands on.
   *
   * **The bridge between the picture and the table, and it is a bridge rather
   * than a panel on purpose.** A cell of this board holds up to eleven names
   * and the drawing can afford the word for one of them; the table below says
   * all of them and has no room to be a picture. Neither is complete alone.
   * What was refused instead is the obvious thing — a panel that opens over
   * the board — because this art reads a seat *against* the others, the one
   * opposite it and the three it stands in aspect to, and a panel covering the
   * board to explain one cell puts out the light it was read by. So both stay
   * visible and only the emphasis moves. See `docs/history/` phase 23.
   */
  let pointed = $state<string | null>(null);

  /**
   * Where the last press landed, held for a moment after the pointer has gone.
   *
   * `pointed` follows the pointer and clears on `mouseleave` — which is the
   * very instant the page finishes scrolling somewhere else. So a reader who
   * pressed a cell arrived at their destination with nothing marked on it: the
   * bridge carried them over and then took the far end down. This outlives the
   * gesture instead. Quick to appear, held long enough to be found, then let
   * go and faded out by the transitions at each end.
   *
   * **One value serves both directions**, and that is not a shortcut: in
   * either of them the origin is off screen by the time it is set. Press a
   * cell and the drawing scrolls away; press the arrow in a row and the table
   * does. Marking both ends therefore only ever shows the reader the
   * destination, and needs no second variable to say which end that is.
   */
  let found = $state<string | null>(null);
  let held: ReturnType<typeof setTimeout> | undefined;

  function mark(branch: string) {
    clearTimeout(held);
    found = branch;
    held = setTimeout(() => (found = null), 2200);
  }

  /** The image's own box, read off it rather than assumed. */
  let sheet = $state<{ width: number; height: number } | null>(null);
  let screen: HTMLImageElement | undefined = $state();

  /**
   * The twelve squares, as fractions of the sheet.
   *
   * The band under the grid grows with the number of names, so the sheet is
   * taller on a crowded board than on a spare one and the cells sit at
   * different fractions of it. `naturalWidth` and `naturalHeight` are what the
   * SVG declared, so they are read once the picture has arrived and the
   * geometry comes from `plate`, which owns it.
   */
  const boxes = $derived(
    sheet ? ziweiSeatBoxes(sheet.width, sheet.height, { heading: true }) : {},
  );

  /**
   * The seats paired with their squares, ready to lay over the picture.
   *
   * Built here rather than with an `{@const}` inside the `{#each}`, and that
   * is not tidiness: written that way, the handler on one button closed over
   * the palace *before* it, so pointing at 巳 lit the row for 午 — the kind of
   * fault that looks like a highlight working until somebody reads what it
   * highlighted. One list, one item, no second binding to drift.
   */
  const overlay = $derived(
    (result?.ziwei.palaces ?? [])
      .map((palace: { branch: { id: string }; house: { hanzi: string } }) => ({
        palace,
        box: boxes[palace.branch.id],
      }))
      .filter((one: { box?: unknown }) => one.box),
  );
  $effect(() => {
    if (!result || !onPaper) return;
    const warm = new Image();
    warm.src = paper;
    void warm.decode().catch(() => {});
  });

  /** Reading is navigating: the address holds the moment, here and on the chart. */
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    busy = true;
    try {
      const query = momentQuery(asked, { gender });
      await goto(`${page.url.pathname}${query ? `?${query}` : ''}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    } finally {
      busy = false;
    }
    // The fields withdraw once they have answered, and stay for a failure:
    // what has to be corrected is in them.
    if (!data.failure && data.result) await panel?.close();
  }
</script>

<svelte:head><title>{t('cli.heading.ziwei')}</title></svelte:head>

<!-- Named, not shown: the nav says which section this is — see `.offscreen`. -->
<h1 class="offscreen">{t('cli.heading.ziwei')}</h1>

<FormPanel {t} bind:this={panel} closable={result !== undefined} onsubmit={submit}>
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
    />
    <label>
      <!-- Asked for, never assumed: only the 大限, the 小限 and the two rings
           of twelve read it, and without it the seats are complete. -->
      {t('form.gender')}
      <select bind:value={gender}>
        <option value="">{t('form.gender.unset')}</option>
        <option value="male">{t('form.gender.male')}</option>
        <option value="female">{t('form.gender.female')}</option>
      </select>
    </label>
    <SubmitButton {t} label="cli.heading.reading" {busy} {needed} />
  {/snippet}
  {#snippet controls()}
    {#if result}
      <!-- The same corner the other sections keep them in: nothing here is
           worth stepping, but a cast board is worth taking away. -->
      <Takeaway {t} copyLabel="form.copyBoard" copyUrl="/api/ziwei/text?{address}" />
    {/if}
  {/snippet}
  {#snippet summary()}
    {data.moment.date || '—'}
    {data.moment.time}
    {where ? `· ${where}` : ''}
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if result}
  <!-- Spent while the next reading is on its way, rather than swapped without
       warning: see the chart, where the same rule holds. -->
  <div class="result" class:stale={busy} aria-busy={busy}>
    <div class="board">
      <img
        src={plate}
        alt=""
        width="900"
        height="1150"
        class="screen"
        class:settling={drawn !== plate}
        bind:this={screen}
        onload={() => {
          drawn = plate;
          if (screen) sheet = { width: screen.naturalWidth, height: screen.naturalHeight };
        }}
      />
      {#if onPaper}<img src={paper} alt="" width="900" height="1150" class="paper" />{/if}

      <!--
        Twelve hit-areas over the picture, and nothing drawn in them.

        An `<img>` cannot be asked what is where, so the seats are laid over it
        from the geometry `plate` exports. They are buttons rather than bare
        divs because they do something — they take the reader to the row that
        says what is in the seat — and because a reader who does not use a
        mouse has to be able to reach them at all.
      -->
      {#each overlay as { palace, box } (palace.branch.id)}
        <!--
          `data-branch` is the half of the pairing the DOM can be asked about
          and `data-seat` on the table row is the other. Nothing reads either
          at runtime; they are how the link is inspected when it stops working,
          and it did — see the note on `overlay` above.
        -->
        <button
          type="button"
          class="seat"
          class:pointed={pointed === palace.branch.id}
          class:found={found === palace.branch.id}
          data-branch={palace.branch.id}
          style="left: {box.left * 100}%; top: {box.top * 100}%; width: {box.width *
            100}%; height: {box.height * 100}%"
          aria-label={t('board.seatLink', { seat: palace.house.hanzi })}
          onmouseenter={() => (pointed = palace.branch.id)}
          onmouseleave={() => (pointed = null)}
          onfocus={() => (pointed = palace.branch.id)}
          onblur={() => (pointed = null)}
          onclick={() => {
            mark(palace.branch.id);
            document
              .querySelector(`[data-seat="${palace.branch.id}"]`)
              ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }}
        ></button>
      {/each}
    </div>

    <div>
      <ZiweiReading
        board={result.ziwei}
        moment={result.moment}
        {t}
        bind:pointed
        {found}
        onfind={(branch) => {
          pointed = branch;
          mark(branch);
          screen?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }}
      />
    </div>
  </div>
{/if}

<style>
  /* What is read off the seats is dressed in `ZiweiReading`, which is where
     that markup went: a style left behind here would be one nobody could find
     from the thing it styles. */

  /* The one field the board asks for beyond the moment. Bounded: a `select`
     of three words does not become clearer for being a panel wide. */
  label { display: grid; gap: 0.3rem; max-width: 14rem; }
  select { font: inherit; padding: 0.35rem 0.4rem; }

  .failure { color: var(--warn); }

  /* Spent while the next board is on its way, rather than swapped without
     warning: the rule every section here keeps. */
  .stale { opacity: 0.55; transition: opacity 120ms ease; }

  /*
   * One column with a floor of zero, which is what lets the table's frame do
   * its job. An `auto` track is at least as wide as its contents ask to be,
   * so a scrolling frame around a table asking for 40rem asks for 40rem all
   * the same and the *page* scrolls sideways — the one thing the frame exists
   * to prevent. `minmax(0, 1fr)` is leave for the track to be narrower than
   * what stands in it. The 七政四餘 section found this and said so; it was
   * never that board's, and this one has the widest table on the site.
   */
  .result {
    display: grid;
    gap: 2rem;
    grid-template-columns: minmax(0, 1fr);
  }

  /*
   * The measure every board on this site is drawn at — `--board` in
   * `app.css` — and not a width of this section's own. It had 56rem, invented
   * here, which is the fault the 七政四餘 section already had and already
   * argued out of: a floor for how small the cells may get is answered by any
   * measure above it, and what it never argued for was a width no other board
   * shares.
   *
   * The frame takes the measure and the picture fills it, rather than the
   * picture taking it inside a wider frame. That is not tidiness: the twelve
   * hit-areas are positioned in per cent *of this box*, so a frame wider than
   * the image it holds would lay them beside the seats instead of on them.
   */
  .board {
    position: relative;
    inline-size: var(--board);
    max-inline-size: 100%;
    margin-inline: auto;
  }

  /*
    The hit-areas. No fill of their own until they are pointed at, and then
    only a ring: the cell underneath is a picture with its own tint, and a wash
    laid over it would change the phase colour the drawing spent an argument
    establishing.
  */
  .seat {
    position: absolute;
    margin: 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 2px;
    background: none;
    cursor: pointer;
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  .seat:hover, .seat.pointed, .seat:focus-visible {
    /* `--ink`, because this page has no accent colour and inventing one for a
       ring would put a sixth hue on a sheet whose five all mean a phase. */
    border-color: var(--ink);
    box-shadow: 0 0 0 1px var(--ink) inset;
    outline: none;
  }
  /* Where a press landed, and it stays a ring for the reason the ring exists:
     a wash here would sit on the cell's phase colour. Doubling the inset is
     the whole of the difference, which is enough because nothing else on the
     picture is emphasised at the same time. */
  .seat.found {
    border-color: var(--ink);
    box-shadow: 0 0 0 2px var(--ink) inset;
  }

  .board img { width: 100%; height: auto; display: block; }
  /* Both selectors carry the frame, and that is not decoration: `.board img`
     above sets `display: block`, and a bare `.paper` loses to it on
     specificity — one class against a class and a type — so the copy drawn for
     the printer stayed on the screen beside the one meant for it. Two boards,
     one birth, and nothing on the page to say why. */
  .board .paper { display: none; }
  .screen { transition: opacity 0.2s ease-out; }
  /* Held back only while a *new* board is drawing, so a reader never sees the
     previous birth's picture captioned with this one's words. */
  .settling { opacity: 0.55; }

  @media (prefers-reduced-motion: reduce) {
    .result, .screen { transition: none; }
  }

  @media print {
    /* Nothing to point with on paper. */
    .seat { display: none; }
    .board .screen { display: none; }
    .board .paper { display: block; }
    .board img { max-width: 26rem; }
  }
</style>
