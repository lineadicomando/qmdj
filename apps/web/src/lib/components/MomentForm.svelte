<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MessageKey, Translator } from '@shipan/i18n';
  import type { Location } from '$lib/moment';
  import LocationSearch from './LocationSearch.svelte';

  import { METHODS, YUAN_READINGS } from '$lib/vocabulary';

  let {
    t,
    date = $bindable(''),
    time = $bindable(''),
    place = $bindable<Location | undefined>(undefined),
    latitude = $bindable(''),
    longitude = $bindable(''),
    timezone = $bindable(''),
    trueSolarTime = $bindable(true),
    dayBoundary = $bindable('zishi'),
    method = $bindable<string | undefined>(undefined),
    yuan = $bindable<string | undefined>(undefined),
    guiren = $bindable<string | undefined>(undefined),
    luohou = $bindable<string | undefined>(undefined),
    when = 'fields',
    openLegend,
    extra,
    extraLegend,
    extraSet = 0,
  }: {
    t: Translator;
    date?: string;
    time?: string;
    place?: Location | undefined;
    /**
     * The place said in degrees — a refinement of the one above, or the whole
     * of it. Passed straight through: the field that asks for a place is the
     * field that has to be able to sharpen one, and every section that has
     * the first has the second by having it. See `LocationSearch`.
     */
    latitude?: string;
    longitude?: string;
    timezone?: string;
    trueSolarTime?: boolean;
    dayBoundary?: string;
    /** Bound only where a ju is cast: the pillars have no method to choose. */
    method?: string | undefined;
    /** Bound with `method`, and shown only beside chaibu. */
    yuan?: string | undefined;
    /**
     * Bound where a 六壬 board is laid, and nowhere else.
     *
     * It sits here rather than in the open because it is what the other two
     * are: a divergence between schools, a refinement of how the same instant
     * is read. What decides *which board* the instant is laid on is not one of
     * these and is asked in the open — see the consultation.
     */
    guiren?: string | undefined;
    luohou?: string | undefined;
    /**
     * A name for the fields this asks in the open, where they need one.
     *
     * Given only where the section around it puts another named group beside
     * them — the consultation does, and there the place would otherwise be the
     * one thing on the panel standing outside every box. Left off everywhere
     * else, because a box around the only group there is names it twice.
     */
    openLegend?: MessageKey;
    /**
     * Where the date and the time are asked for.
     *
     * `fields` — beside the place, because the moment *is* the question: a
     * chart of a date, an interval, four pillars of a birth.
     *
     * `options` — under the disclosure, empty, and empty means now. That is
     * the consultation: the chart is cast for the instant the question is
     * put, and a reader who wants another instant can still say so. A field
     * a section fills in for nine readers out of ten is a field that belongs
     * where the tenth can find it, not in front of all of them.
     */
    when?: 'fields' | 'options';
    /**
     * Anything else a section wants under the same disclosure.
     *
     * A field that changes what is asked rather than how the moment is read
     * belongs beside the other things a reader opens on purpose, not above
     * the button in the plain form.
     */
    extra?: Snippet;
    /** What that group is called. A group of fields with no name is a list. */
    extraLegend?: MessageKey;
    /** How many of the extras are filled in, for the count on the summary. */
    extraSet?: number;
  } = $props();

  /** Unique within the page: two forms may stand on one, and ids may not. */
  const uid = $props.id();

  /**
   * How much is set in there, counted for the one line the reader can see.
   *
   * A disclosure hides what is inside it, including what somebody put there —
   * come back to a page whose address carried a date and a birth and the
   * options read exactly like the options of a form with nothing in them. So
   * the summary carries the count, and a form that arrives with something set
   * opens itself rather than waiting to be found.
   *
   * Only what departs from what the engine would have done anyway is counted:
   * an untouched form says nothing, which is the point of saying anything.
   */
  function set(): number {
    let count = extraSet;
    // Only under the disclosure. Where they stand in the open the reader is
    // looking at them, and a badge counting a field in plain sight is noise.
    if (when === 'options') {
      if (date) count += 1;
      if (time) count += 1;
    }
    if (!trueSolarTime) count += 1;
    if (dayBoundary !== 'zishi') count += 1;
    if (method !== undefined && method !== 'chaibu') count += 1;
    if (yuan !== undefined && yuan !== 'term') count += 1;
    if (guiren !== undefined && guiren !== 'chou') count += 1;
    if (luohou !== undefined && luohou !== 'descending') count += 1;
    return count;
  }

  const changed = $derived(set());
  // svelte-ignore state_referenced_locally
  let open = $state(set() > 0);

  /** Whether the options hold more than one thing, and want naming apart. */
  const grouped = $derived(when === 'options' || extra !== undefined);
</script>

<!-- The date and the time, in whichever of the two places this section asks
     for them. One markup, so they are the same pair either way. -->
{#snippet moment()}
  <label>
    {t('cli.column.day')}
    <!-- ISO whatever the locale: a shared address must mean one thing. -->
    <input
      type="date"
      bind:value={date}
      aria-describedby={when === 'options' ? `${uid}-now` : undefined}
    />
  </label>
  <label>
    {t('cli.column.hour')}
    <input
      type="time"
      bind:value={time}
      aria-describedby={when === 'options' ? `${uid}-now` : undefined}
    />
  </label>
{/snippet}

<!-- How the moment is read, which is the same set of choices wherever the
     moment came from. Last under the disclosure: it is what a reader changes
     once, if ever, and never on the way to asking something. -->
{#snippet reading()}
  <label class="check">
    <input type="checkbox" bind:checked={trueSolarTime} />
    {t('form.trueSolarTime')}
  </label>
  <label>
    {t('form.dayBoundary')}
    <!-- The values are the engine's and do not change; what is shown says
         which hour each one is, for a reader who has never met 子時. -->
    <select bind:value={dayBoundary}>
      <option value="zishi">{t('form.dayBoundary.zishi')}</option>
      <option value="midnight">{t('form.dayBoundary.midnight')}</option>
    </select>
  </label>
  {#if method !== undefined}
    <label>
      {t('form.method')}
      <!-- The word leads and the method's own name follows with its hanzi:
           the thing named is Chinese, the choice must be readable without. -->
      <select bind:value={method}>
        {#each METHODS as id}
          <option value={id}>{t(`form.method.${id}` as MessageKey)}</option>
        {/each}
      </select>
    </label>
    <p class="note">{t('cli.note.method', { method: method ?? 'chaibu' })}</p>
    <!-- Only beside chaibu. Under zhirun the yuan is the futou's because
         that is what the method is, and a control that changed nothing
         would read as a choice where none is left. -->
    {#if yuan !== undefined && method === 'chaibu'}
      <label>
        {t('form.yuan')}
        <select bind:value={yuan}>
          {#each YUAN_READINGS as id}
            <option value={id}>{t(`form.yuan.${id}` as MessageKey)}</option>
          {/each}
        </select>
      </label>
      {#if yuan === 'futou'}
        <p class="note">{t('cli.note.yuanFutou')}</p>
      {/if}
    {/if}
  {/if}

  {#if guiren !== undefined}
    <label>
      {t('form.guiren')}
      <select bind:value={guiren}>
        <option value="chou">{t('form.guiren.chou')}</option>
        <option value="wei">{t('form.guiren.wei')}</option>
      </select>
    </label>
    <p class="note">{t('form.guiren.note')}</p>
  {/if}

  <!-- The one 七政四餘 divergence a reader might move. The options lead in
       their own language and the hanzi stand beside what is named, because
       what is named here is Chinese: 羅睺 is the name of the thing, and a
       reader who has met it in an Indian source has met it the other way
       round. See `form.luohou.note`. -->
  {#if luohou !== undefined}
    <label>
      {t('form.luohou')}
      <select bind:value={luohou}>
        <option value="descending">{t('form.luohou.descending')}</option>
        <option value="ascending">{t('form.luohou.ascending')}</option>
      </select>
    </label>
    <p class="note">{t('form.luohou.note')}</p>
  {/if}
{/snippet}

  <!-- What is asked in the open, side by side where there is room and stacked
       where there is not. Three things where the moment is the question, and
       one where it is now: the place, which fixes the hour wherever the
       instant came from. -->
  {#if openLegend}
    <fieldset class="open">
      <legend>{t(openLegend)}</legend>
      <div class="row" class:sole={when === 'options'}>
        {#if when === 'fields'}{@render moment()}{/if}
        <LocationSearch {t} bind:selected={place} bind:latitude bind:longitude bind:timezone />
      </div>
    </fieldset>
  {:else}
    <div class="row" class:sole={when === 'options'}>
      {#if when === 'fields'}{@render moment()}{/if}
      <LocationSearch {t} bind:selected={place} bind:latitude bind:longitude bind:timezone />
    </div>
  {/if}

  <details bind:open>
    <!-- A label, not the note: what a disclosure is called has to say what
         opening it offers. The note is information, and it belongs inside
         with the options it is about. -->
    <summary>
      {t('form.options')}
      {#if changed > 0}
        <!-- The number is read as a number by anyone who can see it beside
             the word. Anyone who cannot gets the sentence instead. -->
        <span class="badge" aria-hidden="true">{changed}</span>
        <span class="offscreen">{t('form.optionsSet', { count: changed })}</span>
      {/if}
    </summary>

    {#if when === 'options'}
      <fieldset>
        <legend>{t('form.moment')}</legend>
        <div class="stack">
          <div class="row pair">{@render moment()}</div>
          <!-- Under the two fields and tied to them: a date input has no
               placeholder to say what empty means, so the sentence has to. -->
          <p class="note" id="{uid}-now">{t('form.momentNote')}</p>
          <!-- Only here, and only while there is an instant to leave: under a
               birth there is no now to go back to, and over empty fields the
               button would press to nothing. Named for the state it restores —
               empty — which the note above has just finished defining. -->
          {#if date || time}
            <button type="button" class="now" onclick={() => { date = ''; time = ''; }}>
              {t('form.momentNow')}
            </button>
          {/if}
        </div>
      </fieldset>
    {/if}

    {#if extra}
      <fieldset>
        {#if extraLegend}<legend>{t(extraLegend)}</legend>{/if}
        <div class="stack">{@render extra()}</div>
      </fieldset>
    {/if}

    {#if grouped}
      <fieldset>
        <legend>{t('form.calculation')}</legend>
        <div class="stack">{@render reading()}</div>
      </fieldset>
    {:else}
      <!-- The only thing in there. A box with a name of its own, under a
           disclosure already called Options, would name it twice. -->
      {@render reading()}
    {/if}
  </details>

<style>
  /*
   * Named like the groups under the disclosure, so a panel that has both reads
   * as one form rather than as a box beside some loose fields.
   *
   * No margin under it, and the reason is that this component has no single
   * root: the group in the open and the fold below it are two items of
   * whichever grid the page stacks them in, and that grid's gap is already
   * between them. A margin here was that gap counted twice — which is nothing
   * much where three fields stand over a fold, and a hole where the open group
   * holds one search box and the fold is one small line.
   */
  fieldset.open { margin: 0; }
  /*
   * As many columns as there is room for, and no breakpoint anywhere.
   *
   * `auto-fit` asks the row how much room it was given rather than asking the
   * screen how wide it is: the same three fields come out in three columns on
   * a page, in two on a tablet and in one on a phone, and the panel they sit
   * in is free to be any width without this having to know.
   */
  /*
   * The bound is on the row and not on the column, and it has to be.
   *
   * The three of them shared whatever the panel had, so on a wide page a field
   * for a date came out twenty rems long — a box the width of a sentence
   * holding eight characters, which reads as a mistake and is one. But capping
   * the *track* caps it on a phone too, and there a field narrower than the
   * screen is the mistake in the other direction. Capping the row leaves the
   * columns at `1fr`: they still divide whatever they are given, and what they
   * are given stops at a width three fields can honestly use.
   *
   * `min-inline-size: 0` is not hygiene here, it is what makes the cap safe.
   * `auto-fit` counts its repetitions against the available space, and where
   * that space is indefinite — which is exactly what sizing this row as an
   * item of the form's own grid asks for — it counts them against the
   * `max-width` instead. So the row's minimum became three whole columns, and
   * on a phone it carried the fields off the right of the screen. At zero the
   * minimum is the container's, and `auto-fit` settles on the one column that
   * fits.
   */
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: 0.9rem;
    max-width: 46rem;
    min-inline-size: 0;
  }
  /* The same cap, taken down to what the row actually holds: a width for
     three fields around one is a search box the length of the page, and a
     field far wider than what goes in it reads as the wrong field. */
  .sole { max-width: 22rem; }
  /* Two columns and not one: the cap has to clear two whole tracks *and* the
     gap between them, or `auto-fit` counts the room for one and stacks a date
     over a time that belong on a line together. */
  .pair { max-width: 28rem; }
  /* Each field keeps its own height and hangs from the top of the row: a
     chosen place makes the row taller, and stretching would push the fields
     beside it down along with it. */
  .row > :global(*) { align-self: start; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  label :global(input), label :global(select) { color: var(--ink); }
  .check { display: flex; gap: 0.45rem; align-items: center; }
  summary { cursor: pointer; color: var(--faint); font-size: 0.85em; }
  details { display: grid; gap: 0.6rem; }
  /* The options are read, not filled in: a line of prose stays a line the eye
     can come back from, however wide the panel is. */
  details label:not(.check) { max-width: 26rem; }
  .note { margin: 0; color: var(--faint); font-size: 0.8em; max-width: 42rem; }

  /* A link and not a block: it undoes a detour, it does not submit anything,
     and a filled button under the fields would outrank the one that asks. */
  .now {
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
  .now:hover, .now:focus-visible { color: var(--ink); }

  /*
   * A group of fields, named — and named to the machine as well.
   *
   * `fieldset` and `legend` are what a screen reader reads out before every
   * field in the group, which is how «Date» comes out as the date of a birth
   * rather than the date of the chart. A paragraph in bold over the same
   * fields looks identical and says it to nobody.
   *
   * The fields hang in a `div` and not off the fieldset itself: a `legend` is
   * laid out by rules of its own, and a fieldset made a grid puts it wherever
   * the browser happens to think it belongs.
   */
  fieldset { border: 0; margin: 0; padding: 0; min-inline-size: 0; }
  /* On top of the gap between them: a group is a step apart from the group
     above it, not another field in the same list. */
  fieldset + fieldset { margin-top: 0.9rem; }
  /* In the ink and a shade heavier than the labels under it. Set in the same
     grey at the same weight, a name for a group of fields reads as one more
     label, and then the groups are three lists nobody can see the edges of. */
  legend { padding: 0 0 0.45rem; font-size: 0.9em; font-weight: 600; color: var(--ink); }
  .stack { display: grid; gap: 0.6rem; }

  /* How much is set behind a summary that says nothing about it. Small,
     round, in the ink rather than in a colour that means nothing here. */
  .badge {
    display: inline-block;
    min-inline-size: 1.5em;
    padding-inline: 0.4em;
    border-radius: 999px;
    background: var(--ink);
    color: var(--ground);
    font-size: 0.8em;
    line-height: 1.5;
    text-align: center;
  }
</style>
