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

  **It is also the root of a language**, and that is a claim rather than an
  arrangement: the classical use of this method is a question put at an
  instant, and the three sections after it are the instruments that use serves
  itself with. What it costs is the chart's old address, and the note in
  `navigation.ts` says so.

  Two things can be done with what comes out, and they are the two the page is
  built around: hand it to a model, or print it. The second is why the answer
  carries the question in ink and not only in the fields — a sheet shown to
  somebody else has to say what was asked, or it is a chart of nothing.
-->
<script lang="ts">
  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import { appearance } from '$lib/appearance.svelte';
  import { INSTRUMENTS, instrumentOf, type Instrument, type InstrumentId } from '$lib/instruments';
  import { momentQuery, sayFailure, type Failure, type MomentInput } from '$lib/moment';
  import BaziReading from '$lib/components/BaziReading.svelte';
  import ChartReading from '$lib/components/ChartReading.svelte';
  import Takeaway from '$lib/components/Takeaway.svelte';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import LiurenReading from '$lib/components/LiurenReading.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import PillarPlate from '$lib/components/PillarPlate.svelte';
  import QizhengReading from '$lib/components/QizhengReading.svelte';
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
  /**
   * Which board the question is put to.
   *
   * Chosen **before** the press and at no point after it. A control that
   * switched instrument over a standing answer would either cast again — and
   * then it is a different instant from the one the question was asked at —
   * or show a board laid for a moment nobody asked at. Moving it here does
   * neither: it goes into `fields`, so the answer is spent the moment it
   * moves, and what is on screen is put away until the next press.
   *
   * See `PLAN.md` § 4 phase 14 for why it is one board at a time and not two.
   *
   * The identifier is what travels and what the field binds to; everything
   * that turns with it is read off the descriptor, in `instruments.ts`, so
   * that a board is a row rather than a branch. See `PLAN.md` § 4 phase 18.
   */
  // svelte-ignore state_referenced_locally
  let instrumentId = $state<InstrumentId>(data.instrument);
  const instrument = $derived(instrumentOf(instrumentId));

  let busy = $state(false);
  let needed = $state<MessageKey | undefined>();
  /**
   * Starts on what the load refused: an address naming a place there is none
   * of. The other sections stop before casting for that — see the chart's
   * load — and here nothing is cast until the press, so the refusal is said
   * up front, where the reader corrects the place the press will use.
   */
  // svelte-ignore state_referenced_locally
  let failure = $state<Failure | undefined>(data.failure);
  /** The board as it came back — whichever of the four was laid. */
  let chart = $state<any>();
  /**
   * The instrument the standing answer was laid with, pinned at the cast.
   *
   * The field goes on being editable after the press and the answer does not
   * follow it — which the page already knew about the question, the moment and
   * the address, and did not know about the instrument. Everything under the
   * result reads *this*, and everything in the form reads the field.
   *
   * The gap was not cosmetic. The answer on screen is rendered by the
   * component its board belongs to, so a reader who cast a chart and then
   * moved the field was shown a Qi Men chart handed to 八字's reading, which
   * looks for four pillars on an object that has nine palaces — an exception
   * in a render, on the section's own landing page. It was survivable while
   * there were two boards only because both were read by components that
   * failed quietly on each other's shape.
   */
  let castInstrument = $state<Instrument | undefined>();
  /** The instrument the answer on screen belongs to, or the field before any. */
  const shown = $derived(castInstrument ?? instrument);
  /**
   * The moment that was cast, held apart from the board.
   *
   * A 六壬 response carries it beside the board where a chart carries it
   * inside, and what stands under both — the calendar it was laid from, the
   * almanac page it is read beside — is the same either way. It is the whole
   * moment and not one field of it: reaching for a field here is how this went
   * stale once already, when `jianchu` was renamed under it and the line
   * quietly stopped appearing.
   */
  let castMoment = $state<any>();
  /** The fields, which withdraw once they have answered. */
  let panel: FormPanel | undefined = $state();

  const said = $derived(failure ? sayFailure(t, failure) : '');

  /** Whether the board is laid on a birth rather than cast for a question. */
  const laidOnABirth = $derived(instrument.needs === 'birth');

  /**
   * The birth given *beside* what was asked, where an instrument takes one.
   *
   * Only dunjia does. Under a board of 命 this stays empty and the birth
   * travels as the moment itself, which is what `needs` means.
   */
  const sentBirth = $derived((instrument.takesBirth && born) || undefined);

  /**
   * The sex, where it changes something — and it changes different things.
   *
   * Under dunjia it fixes the direction the 行年 count runs, so it is
   * meaningless without a birth beside the chart and travels only with one.
   * Under 八字 it fixes the direction the 大運 run, and there it travels alone,
   * because the birth is the board's own moment rather than an addition to it.
   * The other two do not read it at all.
   */
  const sentGender = $derived(
    !instrument.takesGender || !gender
      ? undefined
      : instrument.takesBirth
        ? (born && gender) || undefined
        : gender,
  );

  /**
   * What is still missing, checked before anything is asked of the server.
   *
   * Under a board of 卜 it is the question, and only the question: the birth
   * is an addition and never a requirement, since a consultation without one
   * is the whole of the classical use.
   *
   * Under a board of 命 it is the **date**, and that reverses the page's own
   * rule about an empty field. Everywhere else here empty is the press and
   * means now, which is exactly what a birth cannot mean: a board of 命 laid
   * on an empty date would be laid on today, look like an answer, and be
   * nobody's. So the one field this section is proudest of leaving blank is
   * the one field the other kind of instrument insists on.
   */
  const missing = $derived<MessageKey | undefined>(
    laidOnABirth
      ? asked.date === ''
        ? 'form.needed.birth'
        : undefined
      : question.trim() === ''
        ? 'form.needed.question'
        : undefined,
  );

  /**
   * The address of the chart that was cast, for the drawing and the prompt.
   *
   * Written once at the cast and never derived: the fields stay editable
   * after the press, and a board that followed them would quietly redraw as
   * a chart nobody cast while the reading beside it still answered the one
   * they did. A moved field already puts the copy button away; the drawing
   * holds still the same way, until the next press replaces both.
   */
  let address = $state('');

  /**
   * The question as it was actually put, kept apart from the field.
   *
   * The field goes on being editable after the press and the answer does not
   * follow it — so the sentence standing over a cast chart is the one it was
   * cast with, not whatever is in the box at the moment of reading. On a
   * sheet that will be printed and handed to somebody, the difference is the
   * whole document.
   */
  let posed = $state('');

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
  const fields = $derived(
    `${momentQuery(asked)}|${instrumentId}|${born}|${gender}|${question.trim()}`,
  );
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
      // The birth and the instrument are setup and survive a reload with the
      // rest of it. The question never does, and that is the line: what was
      // typed to get here comes back, what was asked does not.
      {
        instrument: instrumentId,
        born: sentBirth,
        gender: sentGender,
      },
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
          // No birth reaches a Liu Ren board, and not by oversight: the person
          // asking is already in it, standing on the day stem. Which boards
          // take one is `takesBirth`, where the reason is written down. See
          // the page's own note, and `PLAN.md` § 4 phase 14.
          born: sentBirth,
          gender: sentGender,
        },
      );
      const response = await fetch(`/api/${instrument.api}?${query}`);
      const body = await response.json();

      if (!response.ok) {
        chart = undefined;
        castInstrument = undefined;
        castMoment = undefined;
        address = '';
        failure = body as Failure;
        return;
      }

      // An endpoint returns its board named after itself, which is the
      // convention `api` stands on — see `instruments.ts`.
      chart = body[instrument.api];
      /**
       * The moment, from wherever this board keeps it.
       *
       * Three of the four are handed it beside the board; a chart carries its
       * own inside. Read only from `body.moment`, the chart's press threw on
       * every consultation from the day a second board arrived — the reading
       * came back, the moment did not, and the whole cast was reported as a
       * board that could not be laid. It failed silently in the sense that
       * matters: the message it produced is one a reader would read as an
       * outage rather than as a bug, and the other instrument worked.
       */
      castMoment = body.moment ?? body[instrument.api]?.moment ?? null;
      // Pinned to what the engine actually cast for. Under a question that is
      // the instant of the press, and it is the whole point of the mode: the
      // consultation belongs to that minute and not to whenever this is read.
      const cast = { date: castMoment.input.date, time: castMoment.input.time };
      address = momentQuery(
        { ...asked, ...cast },
        {
          lang: t.locale,
          born: sentBirth,
          gender: sentGender,
        },
      );
      castFrom = fields;
      castInstrument = instrument;
      posed = question.trim();
      at = `${cast.date} ${cast.time.slice(0, 5)}`;
    } catch {
      chart = undefined;
      castInstrument = undefined;
      address = '';
      // The request itself failed, so there is no code to translate — and it
      // may well be the first press, when nothing was ever cast to be "read
      // again": what failed is the casting, and the message says so.
      failure = { message: t('consult.castFailed') };
    } finally {
      busy = false;
      mark();
    }

    // The fields withdraw once they have answered, and stay open for a
    // failure: what has to be corrected is inside them. Closing is also what
    // puts the two things there are to do with a chart — hand it over, print
    // it — on the one line the panel leaves at the top of the page.
    if (chart && !failure) await panel?.close();
  }

  const plate = $derived(`/api/${shown.api}/plate?${address}&scheme=${appearance.current}`);

  /**
   * The same board, drawn for paper.
   *
   * The drawing is an `<img>`, so its colours are settled by an address and
   * not by a stylesheet: there is no rule this page can write that turns a
   * dark board light on its way to a printer. What there is instead is a
   * second copy, asked for in the light scheme, hidden on screen and shown
   * only in print.
   *
   * Not asked for at all when the reader is already reading in light, since
   * then the board on screen is the board for paper.
   */
  const onPaper = $derived(appearance.current !== 'light' && shown.plate !== undefined);
  const paper = $derived(`/api/${shown.api}/plate?${address}&scheme=light`);

  /**
   * Fetched as soon as there is a chart, not when the printer is asked for.
   *
   * Printing starts in three ways — this page's button, the browser's menu,
   * Ctrl+P — and only the first can be made to wait for a picture to arrive.
   * `beforeprint` cannot: it is synchronous, and a dialog that opens before
   * the image has loaded prints a gap where the board was. So the copy is
   * warmed the moment the chart is cast, which costs one request against a
   * response the browser then holds for the day.
   */
  $effect(() => {
    if (!chart || !onPaper) return;
    const warm = new Image();
    warm.src = paper;
    void warm.decode().catch(() => {});
  });

  /**
   * Where the prompt comes from.
   *
   * `asked=true` and never the question: the server is told one exists, so
   * that the prompt can end on the line introducing it, and the browser adds
   * the line itself. The birth travels — it is what the 年命 is computed
   * from — and the question does not.
   */
  const promptUrl = $derived(
    `/api/${shown.api}/prompt?${address}` + (shown.needs === 'birth' ? '' : '&asked=true'),
  );

  /** The instant the board was actually laid for, for the line that says so. */
  let at = $state('');
</script>

<svelte:head><title>{t('consult.title')}</title></svelte:head>

<!--
  The two ways out of this page, written once and rendered twice: among the
  fields while the panel is open, and on the bar it leaves behind once it is
  shut. The same pair in both places, because two copies of a pair of buttons
  is two things to keep in step.
-->
{#snippet takeaway()}
  <Takeaway
    {t}
    lead
    copyLabel="form.copyPrompt"
    copyUrl={promptUrl}
    copySuffix={question.trim()}
  />
{/snippet}

<article>
  <!-- Named, not shown: the nav says which section this is, as on the chart. -->
  <h1 class="offscreen">{t('consult.title')}</h1>

  <!-- The one line that says what comes out of this, before anybody types
       into it. It stands where a heading would, under one that is spoken and
       not seen — and it carries the word the nav gave up when the section
       stopped being named after the artefact it produces. -->
  <p class="lead">{t('consult.lead')}</p>

  <!--
    The fields, which withdraw once they have answered.

    The same panel the chart and the pillars use, and here it does more work
    than it does there: what it makes room for is not only the board but the
    two buttons the page exists for, which stand on the bar it leaves behind.
    A consultation is asked once and then read, at length — a form that stayed
    open through the reading would be a form claiming the reader is still
    filling it in.
  -->
  <FormPanel
    {t}
    bind:this={panel}
    legend={null}
    reopenLabel={laidOnABirth ? 'consult.changeBirth' : 'consult.change'}
    closable={chart !== undefined}
    onsubmit={consult}
  >
    {#snippet fields()}
      <!-- Above the moment and above the button, because that is the order:
           the chart is cast for the instant the question is put. -->
      <!--
        What is being asked, under no heading at all.

        A name over these two would have to say «the question, and which
        board» — over a field labelled «Your question» and one labelled «What
        kind of question is it». Three ways of saying one thing, which is what
        the panel's own heading was taken off for. The lead line above the
        panel already says what the page is for, and these are the fields that
        do it; what takes a name below is the circumstance, which is a
        different kind of thing and reads as the step it is.
      -->
      <!--
        Absent under a board of 命, rather than disabled or ignored.

        Nothing is asked of those two, and a box standing empty over them would
        be the page inviting exactly the thing the prompt refuses: a topic
        names one of the seats the board prints — «my career» *is* 官祿宮 — and
        a reading that started from it would have reached a seat without ever
        choosing one. See `prompt.ts` and `PLAN.md` § 4 phase 18.
      -->
      {#if !laidOnABirth}
        <label class="question">
          {t('form.question')}
          <!-- Five lines rather than two. What is typed here is the one thing
               on the page the reader composes rather than picks, and a box the
               size of a caption says to keep it to a caption — when what makes
               a question readable is the circumstance around it. -->
          <textarea bind:value={question} rows="5" placeholder={t('form.questionPlaceholder')}
          ></textarea>
        </label>
      {/if}

      <!--
        Which board the question is put to, in the open with it.

        Not behind the disclosure, because it is not a refinement of the
        instant: it decides what is laid on it, and the two boards answer
        different shapes of question. The options say what they are **for**
        and not what they are called — somebody arriving with a question
        recognises the shape of their own, where `Qi Men` and `Liu Ren` are
        two words they have no way to weigh.
      -->
      <!--
        Four of them, and no longer a `select`.

        A `select` gives one line to an option and shows one at a time, which
        held while there were two and stops holding at four: a reader who knows
        none of these arts is choosing between descriptions, and descriptions
        have to be read side by side to be weighed. Radios show all four at
        once, and the fieldset carries the same label the `select` did.
      -->
      <fieldset class="instrument">
        <legend>{t('form.instrument')}</legend>
        {#each INSTRUMENTS as choice (choice.id)}
          <label>
            <input type="radio" name="instrument" value={choice.id} bind:group={instrumentId} />
            <span>{t(choice.option)}</span>
          </label>
        {/each}
      </fieldset>

      <!--
        The moment, and where it stands depends on what it is.

        Under a board of 卜 what a consultation needs is a question and
        somewhere to stand: the hour pillar turns on the place, and there is no
        default for it that would not be somebody else's city. The date and the
        time go in the options and empty, because empty is the instant of the
        press and that is the whole use of this section — a field filled in for
        nine readers out of ten belongs where the tenth can find it.

        Under a board of 命 that reverses, and `when` is the lever the component
        already had for it. The moment *is* the input, so it stands in the open
        with the place; and empty stops being the press, because a birth left
        empty would be today's.
      -->
      <MomentForm
        {t}
        when={laidOnABirth ? 'fields' : 'options'}
        openLegend={laidOnABirth ? 'form.group.birth' : 'form.group.standing'}
        bind:date={asked.date}
        bind:time={asked.time}
        bind:place={asked.place}
        bind:trueSolarTime={asked.trueSolarTime}
        bind:dayBoundary={asked.dayBoundary}
        bind:method={asked.method}
        bind:yuan={asked.yuan}
        extraLegend={instrument.takesBirth ? 'consult.birth' : undefined}
        extraSet={instrument.takesBirth && born ? 1 : 0}
      >
        <!-- The birth, under the same disclosure as the options and above the
             way the moment is read: it is an addition to a consultation and
             never a requirement, and the form read to the button has one thing
             in it, which is the question. -->
        {#snippet extra()}
          <!--
            The birth, offered under one instrument and not the other.

            Under Qi Men it places a 年命 — a person is not in that chart at
            all until they are put in it. Under Liu Ren it is not offered, and
            structurally rather than cautiously: the querent is already there,
            standing on the day stem, and a 本命 beside it would be a second
            name for one person. Two names for one person is how a reading
            acquires a relation that was never there.
          -->
          {#if instrument.takesBirth}
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
          {/if}
        {/snippet}
      </MomentForm>

      <!--
        The sex, in the open beside the birth and under one instrument only.

        A third rule, agreeing with neither of the two above it: here it is not
        an addition to a board cast for a question but a direction the board's
        own cycles run in, and without it the 大運 are simply absent. So it
        stands with the birth rather than under the options, where the same
        field sits when dunjia reads it for a 行年. See `sentGender`.
      -->
      {#if laidOnABirth && instrument.takesGender}
        <label class="birthField">
          {t('form.gender')}
          <select bind:value={gender}>
            <option value="">{t('form.gender.unset')}</option>
            <option value="male">{t('form.gender.male')}</option>
            <option value="female">{t('form.gender.female')}</option>
          </select>
        </label>
      {/if}

      <!--
        One thing to do at a time, and the box says which.

        Nothing cast, or a field moved since: the only thing to press is the
        casting. Cast and standing — which is what a panel reopened over an
        answer holds — the two ways out stand beside it, and the casting stays
        quiet, still the way to put the same question again at a later
        instant. Which is a second consultation, rather than the same one seen
        twice.
      -->
      <div class="actions">
        <SubmitButton
          {t}
          label={laidOnABirth ? 'consult.lay' : 'consult.cast'}
          {busy}
          needed={needed ?? undefined}
          quiet={chart !== undefined && !spent}
        />
      </div>
      <p class="note wide">{t('form.promptPrivacy')}</p>
    {/snippet}

    <!-- With the fields shut, the bar says which instant answered and where
         it stood. Not the question: that is set in full over the board, where
         it is read with the answer rather than beside a button. -->
    {#snippet summary()}
      {at || '—'}
      {asked.place ? `· ${asked.place.name}` : ''}
    {/snippet}

    <!--
      What is left to do once the fields are gone, on the line they leave
      behind. This is the errand of the page and should not need the panel
      reopened to be reached.

      In a box of their own, and that is not decoration: the bar sets what it
      holds apart, so two buttons handed to it loose are pushed to opposite
      ends of the page with the summary between them — a pair that belongs
      together, reading as two unrelated controls.
    -->
    {#snippet controls()}
      {#if chart && !spent}{@render takeaway()}{/if}
    {/snippet}
  </FormPanel>

  {#if said}<p class="failure" role="alert">{said}</p>{/if}

  {#if chart}
    <!--
      The board is shown, and is not what the page is for.

      It is here so that somebody can see what they are about to hand over —
      after the button and not before it, because the taking away is the
      errand and the looking is the check on it. On paper the order is the
      other one, which is why the question heads the section: a sheet read by
      somebody who was not here when it was typed begins with what was asked.
    -->
    <section class="result" class:stale={busy || spent} aria-busy={busy}>
      <header class="posed">
        <!-- Empty under a board of 命, where nothing was asked. The line below
             still says which instant it was laid for, which on paper is the
             only answer there is to *which* board this is. -->
        {#if posed}<p class="asked">{posed}</p>{/if}
        <p class="note">
          {t('consult.castAt', { when: at })}{asked.place ? ` · ${asked.place.name}` : ''}
        </p>
      </header>

      <!--
        The board, and under it the key to its marks where it has any: the ramp
        of strengths belongs to the nine palaces and there is nothing for it to
        explain on a ring of twelve.

        Three of the four are a picture at an address. 八字 is not and never
        was: four pillars are a table, and `PillarPlate` sets them out as one
        without an image to fetch — so there is no second copy to warm for
        paper either, since a component takes the print stylesheet the page's
        own rules give it.
      -->
      {#if shown.plate}
        <div class="board" class:swapped={onPaper} class:ring={shown.plate.ring}>
          <img
            src={plate}
            alt=""
            width={shown.plate.width}
            height={shown.plate.height}
            class="screen"
          />
          <!-- The same board in the light scheme, for paper and nothing else.
               Only drawn when the two differ — see `onPaper`. -->
          {#if onPaper}
            <img
              src={paper}
              alt=""
              width={shown.plate.width}
              height={shown.plate.height}
              class="paper"
            />
          {/if}
          {#if shown.strengths}<StrengthLegend {t} />{/if}
        </div>
      {:else}
        <PillarPlate pillars={chart.pillars} {t} />
      {/if}
      <!-- `wide`: the board above has the page to itself, so what it was cast
           from is set as its caption — at the drawing's own measure, centred
           on it. See `ChartReading`. -->
      <!--
        The one branch the descriptor does not take, and deliberately.

        What reads a board is a component, and the four do not share a shape:
        one is handed the board and the moment beside it, one a chart that
        carries its own, one only the board. A registry entry naming a
        component would have to name the props with it, and a table of prop
        shapes is a conditional written sideways. It is keyed on the identifier
        rather than on a boolean, so a fifth board adds an arm and nothing else.
      -->
      <div>
        {#if shown.id === 'liuren'}
          <LiurenReading board={chart} {t} moment={castMoment} />
        {:else if shown.id === 'qizheng'}
          <QizhengReading board={chart} {t} />
        {:else if shown.id === 'bazi'}
          <BaziReading bazi={chart} {t} />
        {:else}
          <ChartReading {chart} {t} wide />
        {/if}
      </div>
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

  .question { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); max-width: 46rem; }
  /* Four descriptions, read side by side rather than one at a time. Bounded
     at the same measure the `select` had: the lines are sentences, and a
     sentence set the width of the panel is one the eye loses the start of. */
  .instrument { display: grid; gap: 0.35rem; border: 0; padding: 0; margin: 0; max-width: 34rem; }
  .instrument legend { padding: 0; font-size: 0.9em; color: var(--faint); }
  /* The control and its words on one line, with the words carrying the hang:
     a description that wrapped under its own radio would read as a paragraph
     with a bullet, not as one option among four. */
  .instrument label {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    align-items: baseline;
    font-size: 0.9em;
    cursor: pointer;
  }
  .instrument input { margin: 0; }
  /* Full ink: the legend above them is the faint thing, and four options a
     reader is choosing between are not an aside. */
  .instrument span { color: var(--ink); }
  /* The ring is drawn narrower than the grid of nine and does not want the
     full measure the chart's board takes. Left rather than centred: the
     reading under it starts at the margin, and a picture centred over a
     caption that is not shares no edge with anything. */
  .board.ring :global(img) { max-width: 34rem; margin-inline: 0; }
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
  /*
   * What was asked, over what came back.
   *
   * Set in the ink and larger than the reading, because on paper it is the
   * title of the sheet: whoever is handed one was not here when it was typed,
   * and a board with no question on it is a board about nothing. On screen it
   * does the smaller job of saying which question the answer belongs to, now
   * that the field it was typed into has folded away.
   */
  .posed { margin: 0; }
  .asked {
    margin: 0 0 0.3rem;
    font-size: 1.15rem;
    line-height: 1.4;
    max-width: 46rem;
    /* Typed by hand and set as typed: a question written over several lines
       keeps them, and a run of spaces is not collapsed into one. */
    white-space: pre-wrap;
  }
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
  /* The copy drawn for paper, which is not part of the page. */
  .paper { display: none; }
  /* The one or two things there are to press, on a line, with the leading one
     first. They wrap on a narrow screen rather than shrinking. */
  .actions { display: flex; flex-wrap: wrap; align-items: start; gap: 0.6rem 0.9rem; }
  /* Beside the button that copies and dressed as its equal: they are the two
     ways out of this page, and neither of them leads. */
  @media (prefers-reduced-motion: reduce) {
    .result { transition: none; }
  }

  /*
   * On paper.
   *
   * The board is swapped for the copy drawn light — the one exchange a
   * stylesheet cannot make on an `<img>`, and the whole reason there are two
   * of them. `.swapped` guards it: where the reader is already in the light
   * scheme there is no second copy, and hiding the first would print a sheet
   * with a hole in the middle.
   *
   * The rest is the sheet reading as a document rather than as a screenshot:
   * nothing greyed out, no state left over from a fetch, and the question at
   * the top where a title goes.
   */
  @media print {
    .lead { display: none; }
      .stale { opacity: 1; }
    /*
     * Blocks, not a grid.
     *
     * The answer is one column either way, so the grid buys nothing here —
     * and it costs a page. A grid container broken across sheets is measured
     * by Chrome as though its rows were whole, which left the footer alone on
     * a page of its own under half a page of nothing.
     */
    .result { display: block; }
    .board { margin-bottom: 1.2rem; }
    .posed { margin-bottom: 0.8rem; }
    .asked { font-size: 1.05rem; }
    /* A picture on a sheet of paper, not one fitted to a window: `svh` means
       nothing to a printer, and left the board at the full measure of the
       page. 17cm is what A4 has between its margins with a little to spare. */
    img { inline-size: min(100%, 17cm); }
    .swapped .screen { display: none; }
    .paper { display: block; }
  }
</style>
