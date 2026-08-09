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

  Two errands, and they do not overlap:

  - **a question, asked now** — the classical use. Cast at the instant of
    pressing;
  - **a chart of a birth** — read as a chart of a life. A modern, minority and
    school-divergent application, widespread enough to be worth framing
    honestly and disputed enough that a frame is all that can be offered. It
    takes no question, because a natal chart carrying a question is a third
    thing — comparing a chart of a life against the chart of a moment — that
    this project has declined.

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
  import SubmitButton from '$lib/components/SubmitButton.svelte';
  import type { MessageKey } from '@qimendunjia/i18n';

  let { data } = $props();
  const t = $derived(data.t);

  /**
   * Whether the chart of a birth is offered here yet.
   *
   * It is not, for now. The frame is built and the prompt it produces is
   * honest about what it will not say — but what came back from it read
   * thinly, and a mode that yields a poor reading is worse than one that is
   * absent: it teaches that this is what the method gives. It comes back when
   * there is something better to hand the model than a frame and a warning.
   *
   * Withheld here and nowhere else. `readingPrompt` still takes the destiny
   * frame, `/api/chart/prompt?frame=natal` still answers with it, and
   * `qimen chart --natal` still prints it, with their tests. What is switched
   * off is the offer in the interface, not the capability — so nothing has to
   * be rebuilt when it returns, and nothing rots in the meantime.
   */
  const NATAL_OFFERED = false;

  // Forced off rather than merely unshown: an address is a way in, and a mode
  // that cannot be chosen should not be reachable by typing `?mode=natal`.
  // svelte-ignore state_referenced_locally
  let natal = $state(NATAL_OFFERED && data.natal);
  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({ ...data.moment });
  let question = $state('');

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
   * The two modes want different things and neither wants the other's: a
   * consultation has a question and no moment, a chart of a birth has a
   * moment and no question.
   */
  const missing = $derived<MessageKey | undefined>(
    natal
      ? !asked.date || !asked.time
        ? 'form.needed.birth'
        : undefined
      : question.trim() === ''
        ? 'form.needed.question'
        : undefined,
  );

  /** The address of the chart that was cast, for the drawing and the prompt. */
  const address = $derived(
    cast ? momentQuery({ ...asked, ...cast }, { lang: t.locale }) : '',
  );

  /**
   * The setup, kept in the address so a reload finds the fields as they were.
   *
   * The question is not in it and never will be, and neither is the chart:
   * what is worth surviving a reload is what was typed to get here, not the
   * act itself.
   */
  function mark(): void {
    const next = new URL(page.url);
    const query = momentQuery(natal ? asked : { ...asked, date: '', time: '' });
    next.search = query;
    if (natal) next.searchParams.set('mode', 'natal');
    replaceState(next, page.state);
  }

  /**
   * Casting, which is a fetch and not a navigation.
   *
   * Everywhere else in this interface asking is navigating, because there the
   * address is the answer. Here it cannot be: the answer is cast for the
   * instant of the press under one mode, and holds a question that must not
   * travel under the other.
   */
  async function consult(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    needed = missing;
    if (needed) return;

    busy = true;
    failure = undefined;
    try {
      // A consultation says no date, which the engine reads as the present in
      // the place's own zone — never the browser's clock, which would be an
      // hour out for a chart cast in Beijing and asked for in Rome.
      const query = momentQuery(natal ? asked : { ...asked, date: '', time: '' }, {
        lang: t.locale,
      });
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
    } catch {
      chart = undefined;
      cast = undefined;
      failure = { message: t('form.copyUnread') };
    } finally {
      busy = false;
      mark();
    }
  }

  /** Changing the errand puts the other one's answer away with it. */
  function choose(to: boolean): void {
    if (to === natal) return;
    natal = to;
    chart = undefined;
    cast = undefined;
    needed = undefined;
    failure = undefined;
    mark();
  }

  const plate = $derived(
    `/api/chart/plate?${address}&scheme=${appearance.current}`,
  );

  /** Where the prompt comes from, which is the only thing the two modes differ in. */
  const promptUrl = $derived(
    natal ? `/api/chart/prompt?${address}&frame=natal` : `/api/chart/prompt?${address}&asked=true`,
  );
</script>

<svelte:head><title>{t('consult.title')}</title></svelte:head>

<article>
  <!-- Named, not shown: the nav says which section this is, as on the chart. -->
  <h1 class="offscreen">{t('consult.title')}</h1>

  <form onsubmit={consult}>
    <!-- The two errands, named in words. They are exclusive, so they are
         radios and not switches: choosing one is unchoosing the other.
         With one of the two withheld there is nothing to choose between, and
         a group of one radio is a control that cannot be operated. -->
    {#if NATAL_OFFERED}
      <fieldset>
        <legend>{t('consult.mode')}</legend>
        <label class="check">
          <input type="radio" checked={!natal} onchange={() => choose(false)} />
          {t('consult.mode.question')}
        </label>
        <label class="check">
          <input type="radio" checked={natal} onchange={() => choose(true)} />
          {t('consult.mode.natal')}
        </label>
      </fieldset>
    {/if}

    {#if natal}
      <p class="note">{t('consult.natalNote')}</p>
    {:else}
      <!-- Above the moment and above the button, because that is the order:
           the chart is cast for the instant the question is put. -->
      <label class="question">
        {t('form.question')}
        <textarea bind:value={question} rows="2" placeholder={t('form.questionPlaceholder')}
        ></textarea>
      </label>
    {/if}

    <MomentForm
      {t}
      instant={natal}
      bind:date={asked.date}
      bind:time={asked.time}
      bind:place={asked.place}
      bind:trueSolarTime={asked.trueSolarTime}
      bind:dayBoundary={asked.dayBoundary}
      bind:method={asked.method}
    />

    <SubmitButton {t} label="consult.cast" {busy} needed={needed ?? undefined} />
  </form>

  {#if said}<p class="failure" role="alert">{said}</p>{/if}

  {#if chart}
    <!--
      Directly under the fields, and above the board.

      What this page is for is the taking away, not the looking: the chart
      below is here so that somebody can see what they are about to hand over,
      and it is long. A button at the foot of it would be the point of the
      page reached by scrolling past everything that is not the point.
    -->
    <div class="take" class:stale={busy}>
      <h2>{t('form.promptTitle')}</h2>
      <p class="note">{t('form.promptNote')}</p>
      <CopyText
        {t}
        lead
        label="form.copyPrompt"
        url={promptUrl}
        suffix={natal ? undefined : question.trim()}
      />
      <p class="note">{t('form.promptPrivacy')}</p>
      <p class="note">{t('consult.uncast')}</p>
    </div>

    <section class="result" class:stale={busy} aria-busy={busy}>
      <img src={plate} alt="" width="900" height="1035" />
      <div><ChartReading {chart} {t} /></div>
    </section>
  {/if}
</article>

<style>
  h2 { font-size: 1rem; font-weight: 500; margin: 0 0 0.5rem; }
  .note { margin: 0; color: var(--faint); font-size: 0.8rem; line-height: 1.55; max-width: 62ch; }

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
  fieldset { border: 0; padding: 0; margin: 0; display: grid; gap: 0.3rem; }
  legend { padding: 0; font-size: 0.9em; color: var(--faint); }
  .check { display: flex; gap: 0.45rem; align-items: center; font-size: 0.9em; }
  .question { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 46rem; }
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
  /* Between the fields and the board, and parted from the board rather than
     from the form: the box above it is already a boundary. */
  .take {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--rule);
    max-width: 62ch;
    display: grid;
    justify-items: start;
    gap: 0.6rem;
  }
  .take { transition: opacity 0.15s ease-out; }
  @media (prefers-reduced-motion: reduce) {
    .result, .take { transition: none; }
  }
</style>
