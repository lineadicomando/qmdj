<!--
  Where a chart is posed in order to be taken away and read.

  This project computes a chart and refuses to read it, which is the rule it
  stands on. The consequence is that somebody who wants a reading takes the
  date to a model, and a model handed a date casts the chart from memory and
  gets it wrong. So the chart goes across already computed, with the
  conditions attached — and this is the section where that is done properly.

  It exists apart from the chart because of an order the chart section cannot
  keep. **The instant of asking is the instant that is cast**: the question
  comes before the casting, or it is a caption on a chart that was already
  there. On a page whose address *is* a chart, whose arrows step the moment
  and whose empty address means now, there is nowhere to put a question that
  is not after the fact. Here there is nothing else on the page.

  One errand: a question, asked now, which is the classical use. So the form
  asks two things in the open — the question, and the place, which fixes the
  hour and has no default that would not be somebody else's city. The date
  and the time are under the options and empty, because empty is the instant
  of the press: a field nine readers out of ten have no business filling in
  belongs where the tenth can find it, not in front of all of them.

  A birth may be given with it, and then the chart carries a 年命 — 本命, the
  year pillar of that birth, and 行年, the year being lived, both looked up
  *inside* the chart of the moment. That is the classical direction and the
  reverse of a natal chart, which this section offered once and no longer
  does: what a natal frame could honestly give a model was a warning, and
  《遁甲演義》 gives two pairs and the palaces they fall in. See
  `docs/sources.md`.

  Nothing here is in the address but the setup. The chart is fetched on a
  press and held in this component, and the question never leaves the browser
  at all: a consultation is an act, not an address, and a reload should find
  the fields ready rather than the answer preserved.
-->
<script lang="ts">
  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { momentQuery, sayFailure, type Failure, type MomentInput } from '$lib/moment';
  import ChartReading from '$lib/components/ChartReading.svelte';
  import CopyText from '$lib/components/CopyText.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import StrengthLegend from '$lib/components/StrengthLegend.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';
  import type { MessageKey } from '@qimendunjia/i18n';

  let { data } = $props();
  const t = $derived(data.t);

  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  let question = $state('');
  /**
   * The birth, which is optional and stays optional.
   *
   * A date alone places the 本命. The 行年 needs the direction its count runs
   * in as well, which the tradition sets by sex — forward from 寅, back from
   * 申 — so without that field the year being lived is simply not placed,
   * rather than guessed at.
   */
  // svelte-ignore state_referenced_locally
  let born = $state(data.born);
  // svelte-ignore state_referenced_locally
  let gender = $state<string>(data.gender);

  let busy = $state(false);
  let needed = $state<MessageKey | undefined>();
  let failure = $state<Failure | undefined>();
  /** The chart as it came back, and the instant it turned out to be cast for. */
  let chart = $state<any>();
  let cast = $state<{ date: string; time: string } | undefined>();

  const said = $derived(failure ? sayFailure(t, failure) : '');

  /**
   * What is still missing, checked before anything is asked of the server.
   *
   * Only the question. The birth is an addition and never a requirement:
   * a consultation without one is the whole of the classical use.
   */
  const missing = $derived<MessageKey | undefined>(
    question.trim() === '' ? 'form.needed.question' : undefined,
  );

  /** The address of the chart that was cast, for the drawing and the prompt. */
  const address = $derived(
    cast
      ? momentQuery(
          { ...asked, ...cast },
          { lang: t.locale, born: born || undefined, gender: (born && gender) || undefined },
        )
      : '',
  );

  /**
   * Everything the answer on screen was cast from, as one string.
   *
   * Compared against what was asked, it says whether the chart still answers
   * the fields — and that is not a nicety. The prompt is built from the chart
   * the server cast and the question this browser holds, and those are read at
   * different moments: ask A, cast, correct it to B, copy, and out comes the
   * chart of the instant A was put with B written underneath. Which is the
   * one thing this section exists to prevent.
   *
   * So a moved field puts the answer away rather than warning about it. The
   * button to copy is simply not there, and the button to cast is.
   */
  const fields = $derived(`${momentQuery(asked)}|${born}|${gender}|${question.trim()}`);
  let castFrom = $state('');
  const spent = $derived(chart !== undefined && castFrom !== fields);

  /**
   * The setup, kept in the address so a reload finds the fields as they were.
   *
   * The question is not in it and never will be, and neither is the chart:
   * what is worth surviving a reload is what was typed to get here, not the
   * act itself.
   */
  function mark(): void {
    const next = new URL(page.url);
    next.search = momentQuery(
      // Whatever is in the fields, which is normally no date at all: an empty
      // pair is the present and writes nothing into the address. A date
      // somebody went and typed is setup like the place, and comes back.
      { ...asked },
      // The birth is setup and survives a reload with the rest of it. The
      // question never does, and that is the line: what was typed to get
      // here comes back, what was asked does not.
      { born: born || undefined, gender: (born && gender) || undefined },
    );
    replaceState(next, page.state);
  }

  /**
   * Casting, which is a fetch and not a navigation.
   *
   * Everywhere else in this interface asking is navigating, because there the
   * address is the answer. Here it cannot be: the answer is cast for the
   * instant of the press, and it holds a question that must not travel.
   */
  async function consult(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    needed = missing;
    if (needed) return;

    busy = true;
    failure = undefined;
    try {
      // A consultation normally says no date, and the engine reads that as the
      // present in the place's own zone — never the browser's clock, which
      // would be an hour out for a chart cast in Beijing and asked for in
      // Rome. The fields are under the options, empty, for the reader who
      // means another instant and says so.
      const query = momentQuery(
        { ...asked },
        {
          lang: t.locale,
          born: born || undefined,
          gender: (born && gender) || undefined,
        },
      );
      const response = await fetch(`/api/chart?${query}`);
      const body = await response.json();

      if (!response.ok) {
        chart = undefined;
        cast = undefined;
        failure = body as Failure;
        return;
      }

      chart = body.chart;
      // Pinned to what the engine actually cast for. Under a question that is
      // the instant of the press, and it is the whole point of the mode: the
      // consultation belongs to that minute and not to whenever this is read.
      cast = { date: chart.moment.input.date, time: chart.moment.input.time };
      castFrom = fields;
    } catch {
      chart = undefined;
      cast = undefined;
      failure = { message: t('form.copyUnread') };
    } finally {
      busy = false;
      mark();
    }
  }

  const plate = $derived(
    `/api/chart/plate?${address}&scheme=${appearance.current}`,
  );

  /**
   * Where the prompt comes from.
   *
   * `asked=true` and never the question: the server is told one exists, so
   * that the prompt can end on the line introducing it, and the browser adds
   * the line itself. The birth travels — it is what the 年命 is computed
   * from — and the question does not.
   */
  const promptUrl = $derived(`/api/chart/prompt?${address}&asked=true`);
</script>

<svelte:head><title>{t('consult.title')}</title></svelte:head>

<article>
  <!-- Named, not shown: the nav says which section this is, as on the chart. -->
  <h1 class="offscreen">{t('consult.title')}</h1>

  <!-- The one line that says what comes out of this, before anybody types
       into it. It stands where a heading would, under one that is spoken and
       not seen. -->
  <p class="lead">{t('consult.lead')}</p>

  <form onsubmit={consult}>
    <!-- Above the moment and above the button, because that is the order:
         the chart is cast for the instant the question is put. -->
    <label class="question">
      {t('form.question')}
      <!-- Five lines rather than two. What is typed here is the one thing on
           the page the reader composes rather than picks, and a box the size
           of a caption says to keep it to a caption — when what makes a
           question readable is the circumstance around it. -->
      <textarea bind:value={question} rows="5" placeholder={t('form.questionPlaceholder')}
      ></textarea>
    </label>

    <!--
      The place in the open, and everything else behind the disclosure.

      What a consultation needs is a question and somewhere to stand: the hour
      pillar turns on the place, and there is no default for it that would not
      be somebody else's city. The date and the time are in the options and
      empty, because empty is the instant of the press and that is the whole
      use of this section — a field filled in for nine readers out of ten
      belongs where the tenth can find it.
    -->
    <MomentForm
      {t}
      when="options"
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
      bind:method={asked.method}
      bind:yuan={asked.yuan}
      extraLegend="consult.birth"
      extraSet={born ? 1 : 0}
    >
      <!-- The birth, under the same disclosure as the options and above the
           way the moment is read: it is an addition to a consultation and
           never a requirement, and the form read to the button has one thing
           in it, which is the question. -->
      {#snippet extra()}
        <label class="birthField date">
          {t('consult.birthDate')}
          <!-- What the browser knows to fill in, if it is this reader's own
               birth and they have told it once. -->
          <input type="date" autocomplete="bday" bind:value={born} />
        </label>
        <label class="birthField">
          {t('consult.birthGender')}
          <select bind:value={gender} disabled={!born}>
            <option value="">{t('form.gender.unset')}</option>
            <option value="male">{t('form.gender.male')}</option>
            <option value="female">{t('form.gender.female')}</option>
          </select>
        </label>
        <p class="note">{t('consult.birthNote')}</p>
      {/snippet}
    </MomentForm>

    <!--
      One thing to do at a time, and the box says which.

      Nothing cast, or a field moved since: the only thing to press is the
      casting. Cast and standing: the point of the page is the copying, so it
      leads, and the casting stays beside it — quiet, and still the way to put
      the same question again at a later instant, which is a second
      consultation rather than the same one seen twice.
    -->
    <div class="actions">
      {#if chart && !spent}
        <CopyText {t} lead label="form.copyPrompt" url={promptUrl} suffix={question.trim()} />
      {/if}
      <SubmitButton
        {t}
        label="consult.cast"
        {busy}
        needed={needed ?? undefined}
        quiet={chart !== undefined && !spent}
      />
    </div>
    <p class="note wide">{t('form.promptPrivacy')}</p>
  </form>

  {#if said}<p class="failure" role="alert">{said}</p>{/if}

  {#if chart}
    <!--
      The board is shown, and is not what the page is for.

      It is here so that somebody can see what they are about to hand over —
      after the button and not before it, because the taking away is the
      errand and the looking is the check on it.
    -->
    <section class="result" class:stale={busy || spent} aria-busy={busy}>
      <!-- The board and the key to its marks together, as on the chart. -->
      <div class="board">
        <img src={plate} alt="" width="900" height="1035" />
        <StrengthLegend {t} />
      </div>
      <div><ChartReading {chart} {t} /></div>
    </section>
  {/if}
</article>

<style>
  /* One sentence, so it takes the width it is given: the measure that keeps a
     paragraph readable is about coming back from one line to the next, and
     there is no next one here. */
  .lead { margin: 0 0 1rem; color: var(--faint); font-size: 0.9rem; line-height: 1.55; }
  .note { margin: 0; color: var(--faint); font-size: 0.8rem; line-height: 1.55; max-width: 62ch; }
  /*
   * The measure for prose, lifted for the one line that is not prose.
   *
   * 62ch is what a paragraph wants, and inside a box as wide as the page it
   * broke this sentence in a place nothing on screen accounts for — narrower
   * than the field above it, at a width the reader can neither see nor guess
   * at. It is a caption under the buttons and is read at a glance rather than
   * through, so it takes the box: one line where there is room for one, and a
   * break at the edge of something visible where there is not.
   */
  .wide { max-width: none; }

  /* The same box the other sections put their fields in, and for the same
     reason: clearly not part of the answer, and out of the answer's way. */
  form {
    display: grid;
    gap: 0.9rem;
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: var(--tint);
    padding: 1rem 1.1rem 1.2rem;
    margin: 0 0 2rem;
  }
  .question { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 46rem; }
  /* The birth, rendered inside the options of `MomentForm`. A snippet is
     styled where it is written, so its two fields are dressed here to match
     the ones it stands among. What names the group is the `legend` over
     there, which is a heading to a screen reader where a paragraph in bold
     would have been a paragraph. */
  .birthField { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 26rem; }
  /* Eight characters go in it. The width of the same field in every other
     form on this site, and not the width of the sentence over it. */
  .date { max-width: 13rem; }
  textarea {
    font: inherit;
    font-size: 0.95rem;
    padding: 0.4rem;
    color: var(--ink);
    background: var(--ground);
    border: 1px solid var(--rule);
  }

  .failure { color: var(--alarm); }
  .result { display: grid; gap: 2rem; grid-template-columns: minmax(0, 1fr); }
  /* The picture and its legend, as one item of that grid. See the chart. */
  .board { min-inline-size: 0; }
  .result { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  /* As on the chart: the board has to fit a window, the words under it may
     perfectly well be scrolled to. */
  img {
    display: block;
    margin-inline: auto;
    width: 100%;
    inline-size: min(100%, calc(100svh * 8 / 7));
    block-size: auto;
  }
  /* The one or two things there are to press, on a line, with the leading one
     first. They wrap on a narrow screen rather than shrinking. */
  .actions { display: flex; flex-wrap: wrap; align-items: start; gap: 0.6rem 0.9rem; }
  @media (prefers-reduced-motion: reduce) {
    .result { transition: none; }
  }
</style>
