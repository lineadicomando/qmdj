<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { sayFailure } from '$lib/moment';
  import type { Unit } from '$lib/step';
  import MomentSteps from '$lib/components/MomentSteps.svelte';
  import Takeaway from '$lib/components/Takeaway.svelte';
  import TaiyiReading from '$lib/components/TaiyiReading.svelte';

  /**
   * The 太乙 board of a year, which is the only page here with no form to
   * speak of.
   *
   * Every other section asks for an instant and most of them for a place. This
   * board is 太乙主天 and its subject is the year the world is standing in, so
   * the whole of the input is a number — and the whole of the address is that
   * number, which is why this is the first page on this site that can be
   * linked, shared, indexed and cached in public.
   *
   * That is why the fields never open into a panel. Everywhere else the
   * instant, the place and the school are a page of controls that withdraws
   * once it has answered; here there is one number, so what the other sections
   * are left with *after* they withdraw is the whole of it — a bar over the
   * board carrying the year, the two steps that move it, the way back to the
   * year being lived, and what can be done with the answer. A disclosure over
   * a single field is a door in front of a doorway.
   *
   * There is no prompt here and the absence is decided rather than deferred:
   * `/[lang]` is the only surface that builds one, and this board is not one
   * of its instruments. See `PLAN.md` § 4 phase 20.
   */
  let { data } = $props();
  const t = $derived(data.t);

  const board = $derived(data.result?.taiyi);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');

  let busy = $state(false);
  let drawn = $state('');

  const address = $derived(`year=${data.year}&lang=${t.locale}`);
  const plate = $derived(`/api/taiyi/plate?${address}&scheme=${appearance.current}`);

  /**
   * The same board, drawn for paper.
   *
   * An `<img>` carries its colours in its address, so no stylesheet here can
   * turn a dark board light on its way to a printer. A second copy in the
   * light scheme, hidden on screen, warmed as soon as the board arrives —
   * `beforeprint` is synchronous and cannot wait for a picture. The same pair
   * every other board draws, for the same reason.
   */
  const onPaper = $derived(appearance.current !== 'light');
  const paper = $derived(`/api/taiyi/plate?${address}&scheme=light`);
  $effect(() => {
    if (!board || !onPaper) return;
    const warm = new Image();
    warm.src = paper;
    void warm.decode().catch(() => {});
  });

  /**
   * Asking is navigating, and the answer arrives as the page's own data.
   *
   * `replaceState`, as on the chart: a year gets stepped a dozen times in a
   * row, and a back button that has to walk back through every one of them is
   * a back button nobody can use.
   */
  async function show(year: number | ''): Promise<void> {
    busy = true;
    try {
      await goto(`${page.url.pathname}${year === '' ? '' : `?year=${year}`}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    } finally {
      busy = false;
    }
  }

  /**
   * The year, typed rather than stepped.
   *
   * It stays a field beside the steps for the reason the day does on the
   * chart: the board of 1644 is one gesture away here and three hundred and
   * eighty presses away there. Nothing is submitted — the field *is* the form,
   * so changing it asks.
   */
  function jump(value: string): void {
    const year = Number(value);
    if (Number.isInteger(year) && year >= 1 && year <= 9999) void show(year);
  }

  function moved(_unit: Unit, by: number): void {
    const year = data.year + by;
    if (year >= 1 && year <= 9999) void show(year);
  }

  /** The year being lived, which the address says by saying nothing. */
  function now(): void {
    void show('');
  }
</script>

<svelte:head><title>{t('taiyi.title')}</title></svelte:head>

<!-- Named, not shown: the nav says which section this is — see `.offscreen`. -->
<h1 class="offscreen">{t('taiyi.title')}</h1>

<!--
  The whole of the form, dressed and laid out as what the other sections leave
  behind: the field at the near end of the row, what moves it at the far end,
  and the clipboard and the printer on a line of their own under them.

  Not a `FormPanel`: there is nothing here to fold away, and a panel would put
  a «change the year» link in front of the one field it holds. But the shape
  of a closed one is what a reader arrives here already knowing, and a bar
  that dealt its three controls out differently because it had fewer of them
  would make somebody look for the printer twice.
-->
<div class="bar">
  <div class="row">
    <input
      type="number"
      class="year"
      inputmode="numeric"
      min="1"
      max="9999"
      value={data.year}
      aria-label={t('form.year')}
      disabled={busy}
      onchange={(event) => jump(event.currentTarget.value)}
    />
    <MomentSteps
      {t}
      units={['year']}
      nowTitle="step.now.year"
      disabled={busy}
      values={{ year: String(data.year) }}
      onstep={moved}
      onnow={now}
    />
  </div>
  <!-- The same corner in every section: finding them once is finding them
       everywhere. Only where there is something to take away. -->
  {#if board}
    <Takeaway {t} copyLabel="form.copyTaiyi" copyUrl="/api/taiyi/text?{address}" />
  {/if}
</div>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if board}
  <div class="result" class:stale={busy} aria-busy={busy}>
    <div class="board">
      <img
        src={plate}
        alt=""
        width="900"
        height="1360"
        class="screen"
        class:settling={drawn !== plate}
        onload={() => (drawn = plate)}
      />
      {#if onPaper}<img src={paper} alt="" width="900" height="1360" class="paper" />{/if}
    </div>

    <div>
      <TaiyiReading {board} {t} />
    </div>
  </div>
{/if}

<style>
  /* The closed bar of a `FormPanel`, in the one section that never opens one:
     the box has to read as the same object here as it does everywhere else,
     because it is doing the same job. Its measurements are that panel's, and
     changing one of them here is how two boxes stop being one thing. */
  .bar {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: var(--tint);
    padding: 0.5rem 0.8rem;
    margin-bottom: 2rem;
  }
  /*
   * The field at one end and what moves it at the other, as on the chart.
   *
   * `space-between` and not a row that fills from the left: on the chart the
   * fields sit at the near end and the steps at the far one, and it is the
   * ends that make the two bars the same bar — a stepper tucked against its
   * field here would read as a different control from the one over there.
   * `baseline`, so the year in the field and the year in the steps sit on one
   * line rather than on two that nearly agree. Takeaway keeps the corner it
   * keeps everywhere: in a column its own auto margin sends it to the end.
   */
  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.4rem 1rem;
    flex-wrap: wrap;
  }
  /* Dressed as the day is on the chart's bar: a field among text, not a form. */
  .year {
    width: 6rem;
    font-size: 0.9rem;
    padding: 0.15rem 0.35rem;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  /* `minmax(0, 1fr)` is leave for the track to be narrower than its contents,
     which is what makes the scrolling frames under the board work at all. See
     the same note on every other board's page. */
  .result {
    transition: opacity 0.15s ease-out;
    display: grid;
    gap: 2rem;
    grid-template-columns: minmax(0, 1fr);
  }
  .stale { opacity: 0.5; }

  .board img { width: 100%; inline-size: var(--board); height: auto; display: block; margin-inline: auto; }
  .board .paper { display: none; }
  .screen { transition: opacity 0.2s ease-out; }
  .settling { opacity: 0.6; }

  .failure { color: var(--alarm); }

  @media (prefers-reduced-motion: reduce) {
    .result, .screen { transition: none; }
  }

  /* On a narrow screen the bar is most of the page, as the panel is: the rule
     and the inset cost more width than they are worth. */
  @media (max-width: 30rem) {
    .bar { padding: 0.5rem 0.6rem; margin-bottom: 1.4rem; }
  }

  /*
   * On paper.
   *
   * The picture swaps for the copy drawn in the colours of a sheet, and the
   * bar goes: a printed board is a board, and a control on it is furniture
   * nobody can use.
   */
  @media print {
    .bar { display: none; }
    .result { display: block; }
    .board .screen { display: none; }
    .board .paper { display: block; }
    .board img { max-width: 26rem; }
  }
</style>
