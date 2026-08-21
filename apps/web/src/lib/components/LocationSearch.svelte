<script lang="ts">
  import type { Translator } from '@shipan/i18n';
  import { refines, type Location } from '$lib/moment';

  let {
    t,
    selected = $bindable<Location | undefined>(undefined),
    latitude = $bindable(''),
    longitude = $bindable(''),
    timezone = $bindable(''),
  }: {
    t: Translator;
    selected?: Location | undefined;
    /**
     * The coordinates, which refine the place above or stand in for it.
     *
     * Strings, as the date and the time are: `''` is the only honest way to
     * say «not given», and `0` is a coordinate somebody may mean. Bound here
     * rather than asked for by each section, because the two places that ask
     * for a place are the two places that have to be able to sharpen one.
     */
    latitude?: string;
    longitude?: string;
    /**
     * The clock the moment is read on, where the coordinates stand alone.
     *
     * Only there. With a place the zone is the place's and this is neither
     * shown nor sent — a control that decided nothing would read as a choice
     * that was left.
     */
    timezone?: string;
  } = $props();

  let query = $state('');
  let candidates = $state<Location[]>([]);
  let searching = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  /**
   * Which request is the one still being typed towards.
   *
   * The debounce clears the timer and cannot clear a fetch already in
   * flight, and the network keeps no order: a slower answer to an older
   * request would land after a faster one and overwrite it — or repopulate
   * the list after the box was emptied. So an answer is applied only if
   * nothing was asked after it.
   */
  let asked = 0;

  /**
   * The list is offered and never chosen from.
   *
   * There are dozens of places called Rome. Picking the most populous for the
   * person would produce a chart that looks right and is wrong, and nothing
   * further on could tell.
   */
  function search(): void {
    clearTimeout(timer);
    const text = query.trim();
    if (text.length < 2) {
      asked += 1; // Whatever is in flight answers a question no longer posed.
      candidates = [];
      searching = false;
      return;
    }

    timer = setTimeout(async () => {
      const request = ++asked;
      searching = true;
      try {
        const response = await fetch(
          `/api/locations?q=${encodeURIComponent(text)}&lang=${t.locale}`,
        );
        const found = response.ok ? ((await response.json()).results as Location[]) : [];
        if (request === asked) candidates = found;
      } finally {
        if (request === asked) searching = false;
      }
    }, 180);
  }

  function choose(candidate: Location): void {
    selected = candidate;
    // Overwritten, not filled: a refinement of Rome standing in the fields
    // when Beijing is chosen would be read as a refinement of Beijing, and
    // the board would be laid over Italy on a Shanghai clock. The effect
    // below cannot do this — it must not clobber what an address carried —
    // so the one act that means «somewhere else» does it here.
    settle(candidate);
    candidates = [];
    query = '';
  }

  /** The place's own coordinates and clock, put in the fields. */
  function settle(place: Location): void {
    latitude = String(place.latitude);
    longitude = String(place.longitude);
    timezone = place.timezone;
  }

  /**
   * The place set aside, and its zone kept where the coordinates need one.
   *
   * Removing the place does not remove where the reader said they were: the
   * coordinates stay and become the whole of the answer, and the clock they
   * are read on would otherwise fall back to this browser's — which is right
   * for a chart cast where you are standing and wrong for a birth in another
   * hemisphere. The zone the place carried is the better guess, so it is kept
   * on the way out.
   */
  function forget(): void {
    if (selected && !timezone) timezone = selected.timezone;
    selected = undefined;
  }

  /** Whether there is a coordinate in either field, which is what the zone
   *  select and the two presses under the fields turn on. */
  const given = $derived(Boolean(latitude || longitude));
  /**
   * Whether they say something the place does not — the whole of the
   * difference between a value sitting there and a value somebody moved.
   *
   * The fields are prefilled, so «filled» stops meaning anything; what the
   * summary shows and what travels in the address both turn on this instead.
   * The rule lives in `moment.ts` because the address obeys it too, and the
   * two could not be allowed to disagree.
   */
  const moved = $derived(refines({ place: selected, latitude, longitude, timezone }));
  const pair = $derived(latitude && longitude ? `${latitude}, ${longitude}` : '');

  // svelte-ignore state_referenced_locally
  let open = $state(refines({ place: selected, latitude, longitude, timezone }));

  /**
   * A chosen place puts its own coordinates in the fields.
   *
   * Because a refinement is a nudge, and nobody nudges an empty box: the
   * starting point has to be on screen, or the reader has to go and look up
   * where the search thinks the town is before they can say it is half a
   * degree off. What the engine does with them is unchanged — an untouched
   * pair is not written into the address at all (see `refines`), so the
   * plainest question keeps the plainest address and the answer goes on
   * saying «Roma» rather than «Roma · 41.8919, 12.5113».
   *
   * Only into empty fields. An address carrying a place *and* a refinement
   * arrives with both, and this must not overwrite the second with the first;
   * choosing another place is the act that means «somewhere else», and
   * `choose` handles it. It runs in the browser, so a panel rendered on the
   * server shows the fields empty for the instant before hydration — inside a
   * fold, inside a panel that is usually shut.
   */
  $effect(() => {
    if (selected && !latitude && !longitude) settle(selected);
  });

  /**
   * The zones, built the first time somebody opens the field and never twice.
   *
   * Four hundred options are not rendered on every page that has a place on
   * it: they are rendered where a reader is typing a pair of coordinates with
   * no town to carry a clock, which is the one case that needs them. The
   * current value is prepended if the list does not hold it, so an address
   * naming an alias — or a zone this runtime has not heard of — comes back out
   * of the form as it went in rather than silently becoming another one.
   */
  const zones = $derived.by((): string[] => {
    if (!open) return [];
    const known = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
    return timezone && !known.includes(timezone) ? [timezone, ...known] : known;
  });

  /**
   * A clock to start from, filled in the browser and never on the server.
   *
   * `Intl` answers with the zone of whatever is running it, and on the server
   * that is the machine serving the page — a value that would be rendered,
   * hydrated over, and wrong in between. So it is set in an effect, which
   * runs only in the browser, and only once there is a coordinate for it to
   * be the zone of.
   */
  $effect(() => {
    if (!selected && given && !timezone) {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  });
</script>

<div class="search">
  <!--
    The field and what hangs over it, in a box of their own.

    The list of candidates is positioned against this and not against the
    whole component: `top: 100%` of everything would put it under the
    coordinates as soon as those were opened, which is a list of places
    appearing an inch below the box being typed in.
  -->
  <div class="field">
  <label>
    {t('cli.field.place')}
    <input
      type="search"
      bind:value={query}
      oninput={search}
      autocomplete="off"
      placeholder="Beijing, Roma, 北京…"
    />
  </label>

  {#if selected}
    <p class="chosen">
      <strong>{selected.name}</strong>
      <span>{#if selected.region}{`${selected.region}, `}{/if}{selected.country}</span>
      <span class="zone">{selected.timezone}</span>
      <!-- The face is a glyph, so the name a screen reader speaks has to say
           what pressing it takes away — as every other × on the site does. -->
      <button
        type="button"
        aria-label={t('form.placeRemove', { place: selected.name })}
        onclick={forget}
      >
        ×
      </button>
    </p>
  {/if}

  {#if candidates.length > 0}
    <ul>
      {#each candidates as candidate (candidate.id)}
        <li>
          <!--
            The name, and under it everything that tells two of them apart.

            Three columns read well across a panel and not at all down one
            third of it, which is the width this field now has: the zone was
            cut off by the edge of the list, and the zone is the whole reason
            a row of identical names is worth reading.
          -->
          <button type="button" onclick={() => choose(candidate)}>
            <span>{candidate.name}</span>
            <span class="where">
              <!-- The separator is written into the expression: a space
                   against the edge of a block is one Svelte trims, and
                   "Lazio,Italia" is not how either word is spelled. -->
              {#if candidate.region}{`${candidate.region}, `}{/if}{candidate.country}
              <span class="zone">· {candidate.timezone}</span>
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {:else if searching}
    <p class="quiet">…</p>
  {/if}
  </div>

  <!--
    The coordinates, under the place and folded away.

    Folded because nine readers in ten want a town, and the tenth is looking
    for exactly this; open on arrival when something is in it, as the options
    of the form above are, since a disclosure hides what somebody put there
    as readily as what they never touched. The pair rides on the summary so
    the shut state says what is behind it rather than only that something is.
  -->
  <details class="coordinates" bind:open>
    <summary>
      {t('form.coordinates')}
      <!-- Only what departs. Under a chosen place the fields hold the town's
           own, and a shut fold reading «Coordinate 41.8919, 12.5113» over
           every chart of Rome would say somebody had put them there. -->
      {#if moved && pair}<span class="at">{pair}</span>{/if}
    </summary>

    <div class="stack">
      <div class="pair">
        <label>
          {t('form.coordinatesLatitude')}
          <!--
            Bound by hand rather than with `bind:value`, which on a number
            field hands back a number: `0` and an empty box would then be one
            value, and the equator is a place somebody may mean.

            Each field is required by the other. Half a pair is refused by the
            server too, but a form that lets the press happen has already sent
            somebody to an error page for something the field could have said.
          -->
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            inputmode="decimal"
            value={latitude}
            required={Boolean(longitude)}
            oninput={(event) => (latitude = event.currentTarget.value)}
          />
        </label>
        <label>
          {t('form.coordinatesLongitude')}
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            inputmode="decimal"
            value={longitude}
            required={Boolean(latitude)}
            oninput={(event) => (longitude = event.currentTarget.value)}
          />
        </label>
      </div>

      <!-- Only where the coordinates stand alone: with a place above them the
           clock is the place's, and this would be a control that changed
           nothing. -->
      {#if !selected && given}
        <label>
          {t('form.timezone')}
          <select bind:value={timezone}>
            {#each zones as zone (zone)}
              <option value={zone}>{zone}</option>
            {/each}
          </select>
        </label>
      {/if}

      <!--
        The way back, named for the state it restores and not for what it
        deletes — the same press «Back to now» is in `MomentForm`.

        Nothing under here explains itself, and that is deliberate: a fold
        somebody opens on purpose to type a longitude into is read by somebody
        who knows what a longitude is, and two paragraphs of prose over three
        fields is a lecture where a form was wanted. What the coordinates do
        to the board — and what the latitude does not — is in the README and
        in `CLAUDE.md`, where it is looked up rather than recited.

        What it restores turns on whether a place is standing above: with one,
        the resting value is the town's own and this puts it back; without
        one, it is empty. And it is offered only where there is something to
        leave, which under a chosen place means only once somebody has moved
        the pair — over untouched fields it would press to nothing.
      -->
      {#if selected ? moved : given}
        <button
          type="button"
          class="clear"
          onclick={() => {
            if (selected) settle(selected);
            else {
              latitude = '';
              longitude = '';
            }
          }}
        >
          {t(selected ? 'form.coordinatesReset' : 'form.coordinatesRemove')}
        </button>
      {/if}
    </div>
  </details>
</div>

<style>
  /* The same label as the fields it stands beside: this one is a component
     of its own, so it says so itself. */
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  .search { display: grid; gap: 0.4rem; }
  /* What the list of candidates is measured against. The coordinates sit
     outside it, so opening them cannot move the list off the field. */
  .field { position: relative; }
  input, select { width: 100%; }
  /*
   * The candidates hang over the form rather than pushing it down.
   *
   * In the flow they made the row they sit in taller with every keystroke —
   * the fields beside them jumped, and everything below moved by the height
   * of a list that is gone a moment later. A list of candidates is a thing
   * offered over the page, not a part of it; `.field` is positioned
   * for this.
   */
  ul, .quiet {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 20;
  }
  ul {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    border: 1px solid var(--rule);
    border-radius: 6px;
    background: var(--ground);
    max-height: 16rem;
    overflow-y: auto;
    /* Something has to say it is above what it covers, in either scheme. */
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.22);
  }
  li + li { border-top: 1px solid var(--rule); }
  li button {
    display: grid;
    gap: 0.05rem;
    width: 100%;
    padding: 0.45rem 0.6rem;
    border: 0;
    background: none;
    text-align: left;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }
  li button:hover, li button:focus-visible { background: var(--tint); }
  .where {
    color: var(--faint);
    font-size: 0.85em;
    /* `Europe/Rome` has nowhere to break: told to, it breaks anywhere rather
       than running under the scrollbar. */
    overflow-wrap: anywhere;
  }
  .chosen { display: flex; gap: 0.2rem 0.5rem; align-items: baseline; margin: 0.4rem 0 0; flex-wrap: wrap; }
  /* In the list the zone sits inside `.where` and takes its size from it;
     beside the chosen place it stands on its own and asks for its own. */
  .chosen .zone { color: var(--faint); font-size: 0.85em; }
  .chosen button { border: 0; background: none; cursor: pointer; color: var(--faint); font-size: 1.1em; }
  .quiet { color: var(--faint); margin: 0.25rem 0 0; }

  /* Named and sized like the disclosure of the form around it, so a panel
     with both does not read as two different kinds of fold. */
  summary { cursor: pointer; color: var(--faint); font-size: 0.85em; }
  details { display: grid; gap: 0.5rem; }
  .stack { display: grid; gap: 0.5rem; }
  /* What is behind the fold, said on the line that shuts it. In the ink, so
     it reads as a value and not as more of the word beside it. */
  .at { color: var(--ink); }
  /*
   * Two columns where there is room and one where there is not, and the cap
   * is on the row: a latitude is six characters, and a box the width of the
   * panel reads as the wrong field. `min-inline-size: 0` for the reason
   * `MomentForm` sets it — `auto-fit` in an indefinite width counts its
   * repetitions against the cap and carries the pair off a phone screen.
   */
  .pair {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 0.5rem;
    max-width: 24rem;
    min-inline-size: 0;
  }
  /* A link and not a block: it undoes something, it does not submit, and a
     filled button in a form would outrank the one that asks. The same shape
     the «Back to now» press has in `MomentForm`. */
  .clear {
    justify-self: start;
    border: 0;
    padding: 0;
    background: none;
    color: var(--faint);
    font: inherit;
    font-size: 0.85em;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }
  .clear:hover, .clear:focus-visible { color: var(--ink); }
</style>
