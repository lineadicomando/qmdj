<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, type MomentInput } from '$lib/moment';
  import { step, type Unit, type Wall } from '$lib/step';
  import ChartReading from '$lib/components/ChartReading.svelte';
  import CopyText from '$lib/components/CopyText.svelte';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import MomentSteps from '$lib/components/MomentSteps.svelte';
  import StrengthLegend from '$lib/components/StrengthLegend.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  /**
   * The fields are edited, so they are state; the address is what they were
   * last asked as, so arriving at one puts them back.
   */
  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  $effect(() => {
    asked = { ...data.moment };
  });

  const chart = $derived(data.chart);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');

  /**
   * The instant the answer was actually computed for.
   *
   * An address that says nothing means now, and the server resolved that now
   * **in the place's own zone**. Stepping from the browser's clock instead
   * would jump by hours for a chart cast in Beijing and read in Rome.
   */
  const cast = $derived<Wall | undefined>(
    data.chart && { date: data.chart.moment.input.date, time: data.chart.moment.input.time },
  );

  // The picture answers for the moment the data answers for — pinned to the
  // instant, so that "now" is a new address every time and not one image
  // cached over a day of different charts.
  const plate = $derived(
    `/api/chart/plate?${momentQuery({ ...data.moment, ...cast }, { lang: t.locale, scheme: appearance.current })}`,
  );

  /**
   * The same chart, for whatever is asked of it in words.
   *
   * Pinned to the instant like the drawing, and for the same reason: what is
   * copied has to be the chart on screen, and «now» is a different chart an
   * hour later.
   */
  const address = $derived(momentQuery({ ...data.moment, ...cast }, { lang: t.locale }));

  /**
   * Where each step stands, shown on the step that moves it.
   *
   * Cut from the instant the answer was cast for, not from the fields: the
   * fields say nothing when the chart is the present one, and a row of steps
   * that read as empty beside a chart of today would be lying about it.
   */
  const values = $derived(
    cast && {
      year: cast.date.slice(0, 4),
      month: cast.date.slice(5, 7),
      day: cast.date.slice(8, 10),
      // The present arrives from the engine to the second, and the seconds
      // are neither stepped nor read: what a step moves is the clock time.
      shichen: cast.time.slice(0, 5),
    },
  );

  let busy = $state(false);
  let panel: FormPanel | undefined = $state();

  /**
   * The drawing that is on screen, as against the one that was asked for.
   *
   * A new address changes `src` before a pixel of the new picture exists, and
   * the browser holds the old one up in the meantime with nothing to say it
   * is stale. Until the two agree, the board is shown as on its way.
   */
  let drawn = $state('');

  /**
   * Asking is navigating, and the answer arrives as the page's own data.
   *
   * `replaceState`: a moment gets stepped a dozen times in a row, and a back
   * button that has to walk back through every one of them is a back button
   * nobody can use. Back leaves the chart, which is what a reader means by it.
   */
  async function show(next: MomentInput): Promise<void> {
    const query = momentQuery(next);
    const target = `${page.url.pathname}${query ? `?${query}` : ''}`;
    busy = true;
    try {
      // Asking the present for the present again is not a navigation, and
      // SvelteKit would rightly do nothing with it. It is still a new chart.
      if (target === `${page.url.pathname}${page.url.search}`) await invalidateAll();
      else await goto(target, { replaceState: true, noScroll: true, keepFocus: true });
    } finally {
      busy = false;
    }
  }

  /**
   * Asking closes the fields, once they have answered.
   *
   * Only on the submit, and only when the answer is a chart: a failure leaves
   * the panel open, because what has to be corrected is in it.
   */
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await show(asked);
    if (!data.failure) await panel?.close();
  }

  /** The day, moved without reopening the fields. The hour stays where it is. */
  function jump(date: string): void {
    if (date) void show({ ...data.moment, date, time: cast?.time ?? data.moment.time });
  }

  function moved(unit: Unit, by: number): void {
    if (cast) void show({ ...data.moment, ...step(cast, unit, by) });
  }

  /** The present is what the address says by not saying a date. */
  function now(): void {
    void show({ ...data.moment, date: '', time: '' });
  }
</script>

<svelte:head><title>{t('cli.heading.chart')}</title></svelte:head>

<!-- Named, not shown: the nav says which section this is — see `.offscreen`. -->
<h1 class="offscreen">{t('cli.heading.chart')}</h1>

<FormPanel {t} bind:this={panel} closable={chart !== undefined} onsubmit={submit}>
  {#snippet fields()}
    <MomentForm
      {t}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
      bind:method={asked.method}
    />
    <!-- Nothing here can be missing: a chart of no date is the chart of now. -->
    <SubmitButton {t} label="cli.heading.chart" {busy} />
  {/snippet}
  {#snippet summary()}
    <!--
      The day stays a field with the panel shut.

      It is the one thing asked for here that the steps beside it cannot
      reach in a reasonable number of presses — a chart of a date next spring
      is one gesture away rather than four dozen — and it is also the answer
      to which moment this is. The instant it was cast for, not the one that
      was asked: an empty form means now, and the reader should be told which
      now.
    -->
    <input
      type="date"
      class="day"
      value={cast?.date ?? ''}
      aria-label={t('form.jumpDate')}
      disabled={busy}
      onchange={(event) => jump(event.currentTarget.value)}
    />
    {#if data.moment.place}<span>· {data.moment.place.name}</span>{/if}
  {/snippet}
  {#snippet controls()}
    <MomentSteps {t} disabled={busy} {values} onstep={moved} onnow={now} />
  {/snippet}
</FormPanel>

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if chart}
  <!--
    While the next chart is being cast, the one on screen is last question's
    answer: it is shown as spent rather than swapped without warning. A press
    that changed nothing visible for half a second is a press people make
    twice.
  -->
  <section class="result" class:stale={busy} aria-busy={busy}>
    <!-- The picture and the data together: a drawing carries the glyphs but
         not the warnings, so it is never shown on its own. -->
    <!--
      A box to reserve, not a promise about this drawing.

      The picture is as tall as the list of configurations under the board
      makes it, and how many the hour fell into is only known once the answer
      is here — between one and nine, mostly three to six. So this is the shape
      of a middling chart, which is what the browser holds the space at until
      the real one arrives and settles it.
    -->
    <!-- The board and the key to its marks are one thing in this grid: the
         gap between the picture and the reading is two rems, and a legend
         standing in it would belong to neither. -->
    <div class="board">
      <img
        src={plate}
        alt=""
        width="900"
        height="1035"
        class:settling={drawn !== plate}
        onload={() => (drawn = plate)}
      />
      <!-- Under the picture and above the words: the marks it explains are in
           the picture, and a key that came after the reading would be found
           by whoever had already given up on them. -->
      <StrengthLegend {t} />
    </div>

    <div>
      <ChartReading {chart} {t} />
      <!--
        The chart in words, and nothing more.

        Taking a chart to something that will read it is a different errand and
        lives in its own section, because there the question comes before the
        casting and here it could only come after. A field for one under this
        board would teach the wrong order — so what is left here is a pointer
        to where the right one is kept.
      -->
      <div class="tools">
        <CopyText {t} label="form.copyChart" url="/api/chart/text?{address}" />
        <p class="note">
          {t('form.toConsult')}
          <a href="/{t.locale}/consult">{t('nav.consult')}</a>
        </p>
      </div>
    </div>
  </section>
{/if}

<style>
  .failure { color: var(--alarm); }
  .tools { margin-top: 1.5rem; display: grid; justify-items: start; gap: 0.6rem; }
  .note { margin: 0; font-size: 0.8rem; color: var(--faint); max-width: 62ch; }
  /* In the closed bar, beside text rather than under a label of its own. */
  .day { font-size: 0.9rem; padding: 0.15rem 0.35rem; color: var(--ink); }
  /*
   * One column, and the drawing as large as the reading is wide.
   *
   * Beside the table it had to fit in a column of it, and every palace holds
   * five words, five names and a mark: at that size the board was read with
   * an effort nobody should be asked for. The table follows it instead —
   * a picture first, then the same thing said in full.
   */
  .result { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1fr); }
  /* The picture and its legend, as one item of that grid. Allowed to shrink:
     a grid item will not go below its own min-content otherwise, and the
     picture's is nine hundred pixels. */
  .board { min-inline-size: 0; }
  .result, img { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  .settling { opacity: 0.35; }
  /*
   * As large as the page allows, and centred in it.
   *
   * It stopped at 46rem inside a shell of 72 and hung off the left edge, which
   * left a third of the page empty beside the one thing anybody came here to
   * read: a palace carries six names, each with a word under it, and at that
   * measure they were set at seven pixels. The measure is the shell's now —
   * this is a picture and not a paragraph, and nothing about it wants the
   * width a line of prose wants.
   *
   * The other bound is the window's own height, and it is the *board* that has
   * to fit in it rather than the picture: a chart whose two palaces cannot be
   * seen at once is a chart nobody can compare anything on, while the list of
   * configurations underneath is a list and may perfectly well be scrolled to.
   *
   * From the top of the paper down to the foot of the board is seven eighths
   * of the width — the caption's margin of an eighth, then three quarters of
   * grid — so a window `h` tall can afford eight sevenths of it. Counting only
   * the grid's own three quarters leaves the caption above it unpaid for, and
   * the board comes to rest that much below the fold.
   *
   * `svh` is the short viewport, so a phone whose toolbars are out does not
   * make the board grow when they slide away.
   *
   * `width` first, so a browser that does not know `svh` still gets the
   * column's measure rather than the image's own 900 pixels.
   */
  img {
    display: block;
    margin-inline: auto;
    width: 100%;
    inline-size: min(100%, calc(100svh * 8 / 7));
    block-size: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .result, img { transition: none; }
  }
</style>
