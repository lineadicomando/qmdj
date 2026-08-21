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

  **Three kinds of instrument stand in that select and the kind decides what
  is asked for.** The paragraph above is a board of 卜. A board of 命 is laid
  on a birth: nothing is asked of it, the moment *is* the input, and empty
  stops being the press because a birth left empty would be today's. A board
  of 天 — 太乙, and it is the only one — is laid on a **year**, which is
  neither a question nor a person: nobody is on it, no place and no hour enter
  it, so the whole of the form is one number, and empty is the year being
  lived. That last is the one place this page's original instinct survives
  into a kind that asks nothing, and for the reason it always had: an empty
  year is everybody's answer where an empty birth is nobody's. What does not
  turn with the kind is the rest of it — one instrument to a consultation,
  chosen before the press, and the prompt built here and nowhere else. See
  `instruments.ts`, and `docs/history/` phases 18 and 21.

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
  import { momentQuery, sayFailure, sayPlace, type Failure, type MomentInput } from '$lib/moment';
  import BaziReading from '$lib/components/BaziReading.svelte';
  import ChartReading from '$lib/components/ChartReading.svelte';
  import Takeaway from '$lib/components/Takeaway.svelte';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import LiurenReading from '$lib/components/LiurenReading.svelte';
  import MomentForm from '$lib/components/MomentForm.svelte';
  import PillarPlate from '$lib/components/PillarPlate.svelte';
  import QizhengReading from '$lib/components/QizhengReading.svelte';
  import ZiweiReading from '$lib/components/ZiweiReading.svelte';
  import StrengthLegend from '$lib/components/StrengthLegend.svelte';
  import TaiyiReading from '$lib/components/TaiyiReading.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';
  import type { MessageKey } from '@qimendunjia/i18n';
  // Types only, never a value: a value import from `core` would drag the
  // ephemerides and a native module into the browser bundle.
  import type {
    Bazi,
    LiurenBoard,
    Moment,
    QimenChart,
    QizhengBoard,
    TaiyiBoard,
    ZiweiBoard,
  } from '@qimendunjia/core';

  let { data } = $props();
  const t = $derived(data.t);

  /**
   * Whether the address arrived on an instrument of 命, whose date is a birth.
   *
   * The address writes one `date=`, and what it means turns on the instrument
   * beside it: a birth under 八字, another instant to ask at under Qi Men. The
   * instrument travels in the setup, so a reload can tell — and this is where
   * it tells, handing the pair to one slot and leaving the other empty.
   */
  // svelte-ignore state_referenced_locally
  const arrivedOnBirth = instrumentOf(data.instrument).needs === 'birth';
  /** The moment of a question — the fields of a board of 卜, where empty is
   * the press. Everything else in it is shared across both kinds: the place,
   * and how the moment is read. */
  // svelte-ignore state_referenced_locally
  let asked = $state<MomentInput>({
    ...data.moment,
    ...(arrivedOnBirth ? { date: '', time: '' } : {}),
  });
  /**
   * The birth a board of 命 is laid on, held apart from the moment above.
   *
   * One pair of fields used to play both parts, and the seam showed exactly
   * where a reader crossed it: lay a 八字 on a birth, switch to Qi Men, and
   * the birth was still standing in the options — meaning, now, «put the
   * question to another instant», which nobody had said. Two quantities, two
   * slots: switching instruments finds the other slot as it was left, and a
   * question after a birth is asked at the press, which is the whole use.
   */
  // svelte-ignore state_referenced_locally
  let birth = $state(
    arrivedOnBirth
      ? { date: data.moment.date, time: data.moment.time }
      : { date: '', time: '' },
  );
  let question = $state('');
  /**
   * The matter a board of 天 is read for, held apart from the question above.
   *
   * The two are not the same field wearing different labels, and merging them
   * would put one word on the distinction this instrument stands on. A question
   * asks what will happen and puts the person asking inside a figure they are
   * not in; a matter names what is being *looked at*, and is what the two
   * counts are counts of. Kept in this component and never in the address, as
   * the question is and for the same reason.
   */
  let matter = $state('');
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
   * The year a board of 天 is laid on, a third slot beside the other two.
   *
   * Held apart for the reason the birth is held apart from the moment of
   * asking: three quantities, and one of them resurfacing under another
   * instrument would mean something nobody said. It is a string because empty
   * is a value here — the year being lived — and a number field that coerced it
   * to zero would lay the board on year nought.
   */
  // svelte-ignore state_referenced_locally
  let year = $state(data.year);
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
   * See `docs/history/` phase 14 for why it is one board at a time and not two.
   *
   * The identifier is what travels and what the field binds to; everything
   * that turns with it is read off the descriptor, in `instruments.ts`, so
   * that a board is a row rather than a branch. See `docs/history/` phase 18.
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
  /**
   * The board as it came back, **carrying the name of the art it belongs to**.
   *
   * One value and not two, and that is the whole of why it is shaped this way.
   * The board and the instrument it was laid with have to move together — the
   * note on `castInstrument` below says what it cost when they did not, a Qi
   * Men chart handed to 八字's reading and an exception in a render — and a
   * pairing kept by hand is a pairing that can come apart. Kept in one
   * discriminated value it cannot: the arm that reads `board` is the arm that
   * matched on `id`, and the compiler will not let the two disagree.
   *
   * `castInstrument` still exists beside it, and is a different fact: this
   * says which board is on screen, that one carries the descriptor everything
   * around it is measured by — the plate's size, the endpoint, the legend.
   */
  type Laid =
    | { id: 'qimen'; board: QimenChart }
    | { id: 'liuren'; board: LiurenBoard }
    | { id: 'taiyi'; board: TaiyiBoard }
    | { id: 'qizheng'; board: QizhengBoard }
    | { id: 'ziwei'; board: ZiweiBoard }
    | { id: 'bazi'; board: Bazi };

  let chart = $state<Laid | undefined>();
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
  let castMoment = $state<Moment | null | undefined>();
  /** The fields, which withdraw once they have answered. */
  let panel: FormPanel | undefined = $state();

  const said = $derived(failure ? sayFailure(t, failure) : '');

  /** Whether the board is laid on a birth rather than cast for a question. */
  const laidOnABirth = $derived(instrument.needs === 'birth');
  /**
   * Whether the board is laid on a year — an instrument of 天, which is 太乙
   * and nothing else.
   *
   * Not the negation of `laidOnABirth` and never to be written as one: what the
   * two share is that nothing is asked of them, and everything else about them
   * differs. A birth is somebody's and needs a place and an hour; a year is
   * nobody's and needs neither. See `instruments.ts`.
   */
  const laidOnAYear = $derived(instrument.needs === 'year');
  /** Whether a question is being put at all — the one kind that asks for one. */
  const asking = $derived(instrument.needs === 'question');

  /**
   * The pair the form is editing, by the kind of the instrument.
   *
   * A reference and not a copy: the fields bind through it, and writing
   * `moment.date` writes the slot it points at. The other slot holds still.
   */
  const moment = $derived(laidOnABirth ? birth : asked);

  /** The input as it travels: the shared fields, under the active moment. */
  function input(): MomentInput {
    return { ...asked, date: moment.date, time: moment.time };
  }

  /**
   * Where the board says it was laid, on the bar and on the printed sheet.
   *
   * The place, and the coordinates beside it whenever they were given: a
   * sheet reading «Roma» over a board laid at a pair of degrees somebody
   * typed would be naming a town the coordinates had just replaced. Under 天
   * it is left off entirely, which is the caller's business and not this
   * line's — see the two places it is used.
   */
  const where = $derived(sayPlace(asked));

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
   * The year, where it is the input rather than a field left over.
   *
   * It travels in the setup under 天 and nowhere else, exactly as the birth
   * travels only where a board takes one: a `year=1644` sitting in the address
   * of a Qi Men consultation would be a parameter naming nothing.
   *
   * Absent means the year being lived, and **absent is the empty field and
   * nothing else**. Tested for emptiness rather than for truth because a
   * number field hands back the number 0 for a typed nought — which `min="1"`
   * stops the spinner from reaching and stops nobody from typing — and a
   * falsy test read that as «no year given» and laid the board on the current
   * one under a form still showing 0. Sent as it stands, it is refused by the
   * endpoint that bounds the year, which is an answer rather than a
   * substitution.
   */
  const sentYear = $derived.by(() => {
    if (!laidOnAYear) return undefined;
    const typed = typeof year === 'string' ? year.trim() : year;
    if (typed === '' || typed === undefined || typed === null) return undefined;
    return Number.isNaN(Number(typed)) ? undefined : String(typed);
  });

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
   *
   * Under a board of 天 it is the **matter**, and the year is the field that
   * may be left empty: a year left empty is the year being lived, which is an
   * answer and everybody's, so this section's original instinct survives into a
   * kind that asks no question — one field over. What cannot be left empty is
   * what the figure is read *for*. Without it the reading can only describe the
   * board, which is exactly what the first cut of this instrument produced: a
   * precise account of a figure that never says «and so?». See
   * `prompt.taiyi.matter`.
   */
  const missing = $derived<MessageKey | undefined>(
    laidOnAYear
      ? matter.trim() === ''
        ? 'form.needed.matter'
        : undefined
      : laidOnABirth
        ? birth.date === ''
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
    `${momentQuery(input())}|${instrumentId}|${born}|${gender}|${year}` +
      `|${question.trim()}|${matter.trim()}`,
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
      // The active slot's pair, which under a question is normally no date at
      // all: an empty pair is the present and writes nothing into the address.
      // A birth, or a date somebody went and typed, is setup like the place,
      // and comes back — to the slot the instrument names.
      input(),
      // The birth and the instrument are setup and survive a reload with the
      // rest of it. The question never does, and that is the line: what was
      // typed to get here comes back, what was asked does not.
      {
        instrument: instrumentId,
        born: sentBirth,
        gender: sentGender,
        // Setup like the rest, and the whole of it under 天. The place and the
        // options still travel beside it, unused by this board: they are what
        // a reader set once, and switching instruments and back should find
        // them rather than ask again.
        year: sentYear,
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
      //
      // Under 天 none of that applies and none of it is sent. The place and
      // the options are still standing in this page's state, because they are
      // setup a reader set once — but a 年計 board is a function of a year, and
      // handing it a `locationId` it would ignore is how a reader comes to
      // believe their city went into it.
      // No `lang` under 天: the board comes back as identifiers, hanzi and
      // numbers, and `/api/taiyi` never reads one — sending it only split that
      // endpoint's shared cache into a copy per locale of an identical answer.
      // The three addresses that *are* localized — the transcript, the drawing
      // and the prompt — carry it themselves.
      const query = laidOnAYear
        ? new URLSearchParams(sentYear === undefined ? {} : { year: sentYear }).toString()
        : momentQuery(
            input(),
            {
              lang: t.locale,
              // No birth reaches a Liu Ren board, and not by oversight: the person
              // asking is already in it, standing on the day stem. Which boards
              // take one is `takesBirth`, where the reason is written down. See
              // the page's own note, and `docs/history/` phase 14.
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
      //
      // The one cast in this function, and it is where it has to be: what
      // `json()` hands back is shapeless by nature, so the shape is asserted
      // once, here, at the instant the board is paired with the name of the
      // art that produced it. Everything downstream of this line is checked.
      const laid = { id: instrument.id, board: body[instrument.api] } as Laid;
      chart = laid;
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
      const laidAt = body.moment ?? body[instrument.api]?.moment ?? null;
      castMoment = laidAt;
      /**
       * The address of what was laid, and under 天 there is no moment in it.
       *
       * The two branches are not a convenience. A 年計 board has no instant, no
       * place and no pillars under it, so `castMoment` is legitimately null
       * here — and the line below this one used to read `castMoment.input.date`
       * unconditionally, which on this board is an exception thrown in the
       * middle of a successful cast.
       *
       * Either way it is pinned to what the engine actually laid rather than to
       * the field: under a question that is the instant of the press, and under
       * a year it is the board's own `year`, which is the one the server settled
       * on when the field said nothing.
       *
       * Matched on the board rather than on `laidOnAYear`, which reads the
       * *field*: the two agree here, and only one of them is the thing whose
       * `year` is about to be read.
       */
      if (laid.id === 'taiyi') {
        at = String(laid.board.year);
        address = `year=${at}&lang=${t.locale}`;
      } else {
        // Every board but 太乙 comes back with the instant it was laid at, so
        // its absence here is not a shape this page has to render — it is an
        // answer that cannot be one. Said outright rather than left to fail on
        // the next line: either way the press ends in the `catch` below and
        // the reader is told the casting failed, but only one of the two says
        // so on purpose.
        if (!laidAt) throw new Error('a board came back without the moment it was laid at');
        const cast = { date: laidAt.input.date, time: laidAt.input.time };
        address = momentQuery(
          { ...input(), ...cast },
          {
            lang: t.locale,
            born: sentBirth,
            gender: sentGender,
          },
        );
        at = `${cast.date} ${cast.time.slice(0, 5)}`;
      }
      castFrom = fields;
      castInstrument = instrument;
      // Only where one was put. The field is merely *hidden* under the kinds
      // that ask nothing, so a question typed under Qi Men and never cast is
      // still in this component's state when a 八字 or a 太乙 board comes back —
      // and read unconditionally it printed that sentence over a board it was
      // never put to, in the ink, at the top of the sheet somebody prints.
      //
      // Under 天 what stands there is the matter, for the reason the question
      // stands there under 卜: a sheet handed to somebody who was not here when
      // it was typed has to say what the figure was read for, or it is a board
      // about nothing.
      posed = asking ? question.trim() : laidOnAYear ? matter.trim() : '';
    } catch {
      chart = undefined;
      castInstrument = undefined;
      // Reset with the rest, as the refusal branch above does. It was the one
      // of the four left standing here, so a failed request kept the previous
      // cast's moment beside no board at all. Nothing rendered it — everything
      // under the result is inside `{#if chart}` — but two branches that clear
      // the same answer should clear the same fields, and the one that does
      // not is the one a later reader trusts.
      castMoment = undefined;
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
    `/api/${shown.api}/prompt?${address}` +
      (shown.needs === 'question' ? '&asked=true' : '') +
      // The same shape as `asked`, and never the text. A matter is somebody's
      // own — the merger they are watching, the dispute they are in — so a
      // boolean says one exists, the prompt ends on the line that introduces
      // it, and the browser appends what must not travel.
      (shown.needs === 'year' ? '&about=true' : ''),
  );

  /**
   * What the board was laid for, for the line that says so.
   *
   * An instant under the two kinds that have one, and a year under the third.
   * One field rather than two because it is one sentence — `consult.castAt`
   * says «laid for {when}», and what fills the blank is whatever the board is
   * a function of.
   */
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
  <!--
    What the browser adds to the prompt after it arrives — the question under
    卜, the matter under 天, and nothing at all under 命, which ends on its own
    closing and has no line for anything to land after.

    `posed` and not the field: it is the sentence the board was cast with,
    taken at the press and held there. Read off the live box instead, a
    question edited after the press travelled inside the copied prompt under a
    board that was never put to it — silently, in the clipboard, where nobody
    sees it until it is already pasted. It is also the sentence printed over
    the sheet, so the two cannot say different things.
  -->
  <Takeaway
    {t}
    lead
    copyLabel="form.copyPrompt"
    copyUrl={promptUrl}
    copySuffix={posed}
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

    `reopenLabel` names what a second consultation begins by rewriting, which
    is different under each kind. Under 天 it is the matter and not the year:
    the year is setup somebody set once, and what changes between two readings
    of one year is what they are looking at.
  -->
  <FormPanel
    {t}
    bind:this={panel}
    legend={null}
    reopenLabel={laidOnAYear
      ? 'consult.changeMatter'
      : laidOnABirth
        ? 'consult.changeBirth'
        : 'consult.change'}
    closable={chart !== undefined}
    onsubmit={consult}
  >
    {#snippet fields()}
      <!--
        Which board this is, and it stands first because everything above it
        used to move.

        The question and the matter are not the same field: one appears where
        the other does not, they carry different labels and different
        placeholders, and under an instrument of 命 neither is there at all.
        Put over the choice, that made the first thing on the page the thing
        that jumps — a reader comparing two instruments watched the box they
        had just started reading appear, vanish and change name under their
        hand, and everything below it slide by two lines. **What turns stands
        under what turns it.** The order the section is built on is untouched
        by the move: what has to come before the casting is the question, and
        the casting is the button at the foot of the panel.

        Not behind the disclosure either, because it is not a refinement of the
        instant: it decides what is laid on it, and the boards answer
        different shapes of question. The options say what they are **for**
        and not what they are called — somebody arriving with a question
        recognises the shape of their own, where `Qi Men` and `Liu Ren` are
        two words they have no way to weigh.
      -->
      <!--
        Six of them, and no longer a `select` nor a column of lines.

        A `select` gave one line to an option and showed one at a time, which
        held while there were two and stopped holding at five: a reader who
        knows none of these arts is choosing between descriptions, and
        descriptions have to be read side by side to be weighed. Radios in a
        column showed all six at once and only half solved it — six sentences
        stacked one under the other are still read *down*, and each of them had
        to carry the errand and the name of the art on the same line, behind an
        em dash, wrapping wherever the width happened to fall.

        A card holds two lines, so the two things stop competing for one: the
        name at the head of it — 奇門遁甲 Qí Mén Dùn Jiǎ, which is not a locale
        and now lives in `instruments.ts` rather than twice in the catalogs —
        and the errand under it.

        **The name is first in the order and second in the weight, and that is
        what keeps it inside the rule it looks like it breaks.** CLAUDE.md holds
        that what a reader operates leads in their own language, and an option
        whose face is a glyph is one nobody can choose on purpose. What that
        rule is written against is a card that says 太乙神數 and stops. Here the
        name is set where a kicker goes and in the quiet register, and the line
        in ink — the one the eye lands on and the one somebody is actually
        deciding between — is «come sta un anno, per tutti quelli che ci stanno
        dentro». Reading order says which thing this is; ink says which thing to
        read. A reader with no Chinese still chooses on the errand, and one who
        knows the six arts finds them where a list of six names is scanned,
        which is down the left edge and at the top of each card.

        **They are cards and not buttons, and the radio stays drawn on them.**
        This page has exactly one press and it is the one that casts the board;
        the instrument is chosen *before* it and never after. Six things with
        the air of the pressable, sitting above the one control that actually
        does something, would be six ways to wonder which of the seven casts.
        A visible radio says «one of these, then press» in the one vocabulary
        every reader already has — and it costs nothing, since the ring the
        keyboard leaves is then the browser's own on a control that is really
        there, rather than something reconstructed on a box that hides it.
      -->
      <fieldset class="instrument">
        <legend>{t('form.instrument')}</legend>
        <div class="choices">
          {#each INSTRUMENTS as choice (choice.id)}
            <label class="choice" class:chosen={instrumentId === choice.id}>
              <input type="radio" name="instrument" value={choice.id} bind:group={instrumentId} />
              <span class="glyph named">{choice.name.hanzi} {choice.name.pinyin}</span>
              <span class="errand">{t(choice.option)}</span>
            </label>
          {/each}
        </div>
      </fieldset>

      <!-- Above the moment and above the button, because that is the order:
           the chart is cast for the instant the question is put. -->
      <!--
        What is being asked, under no heading at all.

        A name over this and the choice above it would have to say «the
        question, and which board» — over a field labelled «Your question» and
        a group labelled «What kind of reading is it». Three ways of saying one
        thing, which is what the panel's own heading was taken off for. The
        lead line above the panel already says what the page is for, and these
        are the fields that do it; what takes a name below is the circumstance,
        which is a different kind of thing and reads as the step it is.
      -->
      <!--
        Absent under a board of 命, rather than disabled or ignored.

        Nothing is asked of those three, and a box standing empty over them
        would be the page inviting exactly the thing the prompt refuses. Under
        命 a topic names one of the seats the board prints — «my career» *is*
        官祿宮 — and a reading that started from it would have reached a seat
        without ever choosing one.
      -->
      <!--
        The matter, under 天 and where the question stands under 卜.

        It is **not** the question field relabelled, and the two are kept apart
        in the state for the same reason they are kept apart here: a question
        asks what will happen and puts the person asking inside a figure they
        are not in, which is the one thing this board refuses outright. A matter
        names what is being *looked at* — and naming two sides of it is what
        lets the board's two counts be counts of anything at all.

        Required, unlike the year beneath it. That looks like this page
        contradicting itself and is the same rule one field over: what may be
        empty is what has an honest default, and the year has one — the year
        being lived. What the figure is read *for* has none, and a board of 天
        laid on nothing produces a precise description of a figure that never
        says «and so?». Which is what it produced before this field existed.

        A label and a placeholder and nothing else. There was a note under it
        saying the same three things a third time — not a question, not about
        you, name two sides — and the placeholder already carries the shape
        where the reader is looking when they start typing. Three ways of
        saying one thing is what the panel's own heading was taken off for.
      -->
      <!-- `instrument.asks` in the guard rather than a non-null assertion under
           it: the key rides on the descriptor beside the kind, so an instrument
           that puts a field up is the same fact as one that says what to write
           in it, and the narrowing is where `shown.plate` does it below. -->
      {#if laidOnAYear && instrument.asks}
        <label class="question">
          {t('form.matter')}
          <textarea bind:value={matter} rows="3" placeholder={t(instrument.asks)}></textarea>
        </label>
      {/if}

      {#if asking && instrument.asks}
        <label class="question">
          {t('form.question')}
          <!-- Five lines rather than two. What is typed here is the one thing
               on the page the reader composes rather than picks, and a box the
               size of a caption says to keep it to a caption — when what makes
               a question readable is the circumstance around it. -->
          <!--
            The placeholder is the instrument's and not the field's, which is
            why it is read off the descriptor rather than off a key written
            here. Both boards of 卜 take a question and they take different
            ones: 奇門 is asked about a thing to be done and the hour to do it
            in, 六壬 about a situation already under way and the people in it.
            A single «What are you asking?» over both was the field naming
            itself a second time, and it left a reader who had just chosen
            between two errands with nothing telling them what changed. The
            card above says what the art is for; this says what to write.
          -->
          <textarea bind:value={question} rows="5" placeholder={t(instrument.asks)}></textarea>
        </label>
      {/if}

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

        The pair binds through `moment`, which is the slot the kind names —
        a birth and an instant-of-asking are different quantities, and a date
        typed as one must never resurface meaning the other.

        Under a board of 天 the whole component is **absent**, which is the one
        thing `when` could not express. There is no instant here to put in the
        open or under a disclosure, and no place either: a 年計 board is a
        function of a year, and a field asking where you are standing would be
        the page collecting a datum the board cannot use and the reader would
        assume it had. What stands in its place is the one number below.
      -->
      {#if laidOnAYear}
        <!--
          The whole of the form under 天, and it is one field.

          The section at `/[lang]/taiyi` says why a disclosure in front of a
          single field is a door in front of a doorway; here the disclosure is
          already the panel around everything, so what is left is the field, in
          the open beside the instrument that asked for it. Empty is allowed and
          means the year being lived — the note under it says so, because an
          empty field that quietly means *now* is only obvious to whoever wrote
          it.
        -->
        <label class="birthField date">
          {t('consult.year')}
          <input type="number" inputmode="numeric" min="1" max="9999" bind:value={year} />
        </label>
        <p class="note">{t('consult.yearNote')}</p>
      {:else}
      <MomentForm
        {t}
        when={laidOnABirth ? 'fields' : 'options'}
        openLegend={laidOnABirth ? 'form.group.birth' : 'form.group.standing'}
        bind:date={moment.date}
        bind:time={moment.time}
        bind:place={asked.place}
        bind:latitude={asked.latitude}
        bind:longitude={asked.longitude}
        bind:timezone={asked.timezone}
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
      {/if}

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
          label={asking ? 'consult.cast' : 'consult.lay'}
          {busy}
          needed={needed ?? undefined}
          quiet={chart !== undefined && !spent}
        />
      </div>
      <p class="note wide">{t('form.promptPrivacy')}</p>
    {/snippet}

    <!-- With the fields shut, the bar says which instant answered and where
         it stood. Not the question: that is set in full over the board, where
         it is read with the answer rather than beside a button.

         The place is left off under 天, and not for tidiness: it never reached
         the board. A bar reading «2026 · Roma» would say a 年計 board had been
         laid somewhere, which is the one thing about this instrument a reader
         has to not believe. -->
    {#snippet summary()}
      {at || '—'}
      {shown.needs !== 'year' && where ? `· ${where}` : ''}
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
        <!-- The place is off under 天 for the reason it is off the bar: it
             never entered the board, and on a printed sheet a place beside a
             year is a claim nobody can walk back. -->
        <p class="note">
          {t('consult.castAt', { when: at })}{shown.needs !== 'year' && where
            ? ` · ${where}`
            : ''}
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

        Asked of the board and not of `shown.plate`, though the two divide the
        six the same way. `plate` being absent is what 八字 *lacks*; `bazi` is
        what it **is**, and only the second gets `PillarPlate` the pillars it
        draws already narrowed to the one board that has any.
      -->
      {#if chart.id === 'bazi'}
        <PillarPlate pillars={chart.board.pillars} {t} />
      {:else if shown.plate}
        <div class="board" class:swapped={onPaper}>
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
        rather than on a boolean, so a sixth board adds an arm and nothing else.

        Matched on the **board's** own name and not on `shown.id`. The two
        agree inside this block — nothing is cast without pinning the
        instrument beside it — but only one of them is the name the board
        travels under, and matching on it is what lets each arm be handed
        `chart.board` already narrowed to the shape that arm reads. The pairing
        stops being an invariant somebody maintains and becomes one the
        compiler holds.
      -->
      <div>
        {#if chart.id === 'liuren'}
          <LiurenReading board={chart.board} {t} moment={castMoment} />
        {:else if chart.id === 'qizheng'}
          <QizhengReading board={chart.board} {t} />
        {:else if chart.id === 'bazi'}
          <BaziReading bazi={chart.board} {t} />
        {:else if chart.id === 'taiyi'}
          <TaiyiReading board={chart.board} {t} />
        {:else if chart.id === 'ziwei'}
          <ZiweiReading board={chart.board} {t} moment={castMoment} />
        {:else}
          <ChartReading chart={chart.board} {t} wide />
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
  /* Six descriptions, read side by side rather than one at a time. Wider than
     the column of lines it replaces, because two columns of half the measure
     are still two sentences the eye holds — where six sentences down a single
     column are a list, and a list is read in order rather than compared. */
  .instrument { display: grid; gap: 0.4rem; border: 0; padding: 0; margin: 0; max-width: 46rem; }
  .instrument legend { padding: 0; font-size: 0.9em; color: var(--faint); }
  /* `auto-fit` and not a media query: what decides how many columns fit is the
     panel, which is narrower than the window by its own padding and narrower
     again beside anything the page ever puts next to it. A breakpoint on the
     window would go on promising two columns after the room for the second one
     was gone. Below the floor the six fall into one column, which is where they
     started. */
  .choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: 0.5rem; }
  /* The radio, then the two lines beside it, and the lines hang together: a
     description that wrapped under its own control would read as a paragraph
     with a bullet rather than as one option among six. */
  .choice {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.1rem 0.5rem;
    align-content: start;
    padding: 0.5rem 0.65rem;
    border-radius: 4px;
    font-size: 0.9em;
    cursor: pointer;
    /* `--edge` and not `--rule`: this is the boundary of something the reader
       is expected to click into, and app.css says which of the two borders that
       takes. On the panel's own tint the card holds the ground, the same way
       every field around it does. */
    border: 1px solid var(--edge);
    background: var(--ground);
  }
  .choice input { margin: 0; align-self: baseline; }
  /* The name, at the head of the card and quieter than the line under it: it
     says which of the six this is, and the reader who does not know the six is
     not choosing on it. Set apart in syllables and capitalised, which is how
     the header has always written these titles — see `instruments.ts`. */
  .named { grid-column: 2; color: var(--faint); }
  /* Full ink, and second: the legend above them is the faint thing, and six
     errands a reader is choosing between are not an aside. */
  .errand { grid-column: 2; color: var(--ink); }
  /* Hover names the card under the pointer; the chosen one is ringed, which is
     a second pixel of the same ink and not a second colour. Two states that
     never have to be told apart at rest: hovering ends when the pointer moves
     and the choice does not. */
  .choice:hover { border-color: var(--ink); }
  .chosen { border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
  /* The ring used to be held to 34rem and pushed to the left margin, on the
     grounds that it is drawn narrower than the grid of nine and that the
     reading under it starts at the margin. This is the one page where the four
     boards are laid one after another, in the same frame, from the same
     controls — and there a board that changes width and edge with the
     instrument reads as the page having moved rather than the answer having.
     They share the measure and the axis; what is centred is the picture, and
     the words under it stay left-aligned inside themselves. */
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
  /* As on the chart, and at the same measure: the board has to fit a window,
     the words under it may perfectly well be scrolled to. See `--board`. */
  img {
    display: block;
    margin-inline: auto;
    width: 100%;
    inline-size: var(--board);
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
    /*
     * A picture on a sheet of paper, not one fitted to a window: `svh` means
     * nothing to a printer, and left the board at the full measure of the
     * page. 17cm is what A4 has between its margins with a little to spare.
     *
     * And a bound on the other side, which a width alone cannot give: this is
     * the one page that prints four different boards, and they are not the
     * same shape. The palaces are 900 by 1280 and come to 24cm tall at 17
     * wide, which is what a sheet takes; a ring of twelve is half again taller
     * than it is wide and would run off the bottom at the same measure. So the
     * height is what is capped, a shade over what the palaces already print
     * at, and a picture too tall for it narrows until it fits. The ring used
     * to be held to 34rem on screen and inherited that on paper; on screen it
     * no longer is, and this is where that job actually belonged.
     *
     * Both bounds are maxima and the size itself is `auto`, which is the whole
     * trick: a replaced element keeps its ratio under a pair of maxima, and
     * gives it up under a width it was *told*. `inline-size: 17cm` with a
     * `max-block-size` under it prints the board squashed — 17 wide by 24.5
     * tall out of a picture that is neither.
     */
    img {
      inline-size: auto;
      max-inline-size: min(100%, 17cm);
      max-block-size: 24.5cm;
    }
    .swapped .screen { display: none; }
    .paper { display: block; }
  }
</style>
