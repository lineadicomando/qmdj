<script lang="ts">
  import { goto, replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import type { MessageKey } from '@qimendunjia/i18n';
  import { appearance } from '$lib/appearance.svelte';
  import {
    chartQuery,
    intervalQuery,
    keptKey,
    keptParam,
    readKept,
    sortKept,
    type CriteriaInput,
    type IntervalInput,
    type Kept,
  } from '$lib/interval';
  import { sayFailure } from '$lib/moment';
  import { isPlainClick } from '$lib/navigation';
  import {
    DIRECTIONS,
    GATE_IDS,
    PALACES,
    PALACE_OF,
    PATTERN_IDS,
    PURPOSES,
    SPIRIT_IDS,
    STAR_IDS,
    STRENGTHS,
  } from '$lib/vocabulary';
  import FormPanel from '$lib/components/FormPanel.svelte';
  import LocationSearch from '$lib/components/LocationSearch.svelte';
  import MomentTable from '$lib/components/MomentTable.svelte';
  import PlateDialog from '$lib/components/PlateDialog.svelte';
  import SubmitButton from '$lib/components/SubmitButton.svelte';

  let { data } = $props();
  const t = $derived(data.t);

  // svelte-ignore state_referenced_locally
  let asked = $state<IntervalInput>({ ...data.interval });
  // svelte-ignore state_referenced_locally
  let looking = $state<CriteriaInput>({ ...data.criteria });
  /**
   * Which hour's board is open — see `pick`.
   *
   * Held here as well as in the address, and the two are not redundant. The
   * address is what makes it shareable and what a reload comes back to; this
   * is what the page reads, because a shallow navigation deliberately does
   * not re-run `load`, and `page.url` does not follow one.
   */
  // svelte-ignore state_referenced_locally
  let at = $state(page.url.searchParams.get('at') ?? '');
  /**
   * The hours set aside, which outlive the scan that found them.
   *
   * Held the same way as `at` and for the same reason, and the two are not
   * the same thing: one hour is *open*, several are *kept*. What separates
   * them is that a rescan is meant to lose the first and keep the second —
   * narrowing the criteria and running it again is precisely how a shortlist
   * gets built, so `show` carries these into the new address by hand.
   */
  // svelte-ignore state_referenced_locally
  let kept = $state<Kept[]>(readKept(page.url));
  $effect(() => {
    asked = { ...data.interval };
    looking = { ...data.criteria };
    // A real navigation is a new answer, and the address is what it answers:
    // an hour picked in the last one is not necessarily in this one.
    at = page.url.searchParams.get('at') ?? '';
    kept = readKept(page.url);
  });

  const scan = $derived(data.scan);
  const failure = $derived(data.failure ? sayFailure(t, data.failure) : '');
  const gloss = (prefix: string, id: string): string => t(`label.${prefix}.${id}` as MessageKey);

  let busy = $state(false);
  let panel: FormPanel | undefined = $state();

  /** Two dates, and nothing about them can be guessed: see `+page.ts`. */
  const needed = $derived(
    asked.from && asked.to ? undefined : ('form.needed.interval' as const),
  );

  async function show(): Promise<void> {
    busy = true;
    try {
      await goto(`${page.url.pathname}?${intervalQuery(asked, looking, { kept: keptParam(carried()) })}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      });
    } finally {
      busy = false;
    }
  }

  /**
   * What the shortlist survives, and the one thing it does not.
   *
   * Narrowing the criteria, widening the interval, changing the method: all
   * of those leave what was set aside alone, and that is the whole point of
   * it. Moving the place does not. An hour kept is a clock time, and the
   * clock is the place's — 08:10 in Rome is not 08:10 in Beijing, and the
   * chart it stands for is a different chart. Silently reinterpreting a
   * shortlist against a new city would hand somebody five hours they never
   * chose, looking exactly like five hours they did.
   */
  function carried(): Kept[] {
    const moved = (asked.place?.id ?? null) !== (data.interval.place?.id ?? null);
    return moved ? [] : kept;
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await show();
    // The criteria withdraw once they have been answered, and the bar keeps
    // saying what was asked. A failure keeps them open: it is in them.
    if (!data.failure && data.scan) await panel?.close();
  }

  /**
   * The errand, which is a second view of the gate rather than a state of its
   * own.
   *
   * Derived from `looking.gate` and writing back to it, so there is exactly
   * one thing to be in: a preset that kept its own value could say "opening"
   * over a gate somebody had since changed by hand. It also teaches in both
   * directions — choose 開門 in the gate field and this says what it is for.
   *
   * It does not travel in the address. The address carries criteria; the
   * errand is a way of filling them in.
   */
  const purpose = $derived(
    PURPOSES.find((entry) => entry.gate === looking.gate)?.id ?? '',
  );

  function choosePurpose(id: string): void {
    looking.gate = PURPOSES.find((entry) => entry.id === id)?.gate ?? '';
  }

  /** A checkbox group binds to an array; this is what a checkbox does to one. */
  function toggle(list: string[], id: string, on: boolean): string[] {
    return on ? [...list, id] : list.filter((entry) => entry !== id);
  }

  /**
   * The chart section, for one hour of the answer.
   *
   * Nothing follows a plain click here — `choose` opens the board over the
   * list instead, and the board now holds the whole reading. This is what is
   * left when that cannot happen: no script, a middle click, a ctrl click.
   * A real address that answers on its own, which is the only kind worth
   * putting in an `href`.
   *
   * It no longer carries the scan. The criteria used to ride along so the
   * chart could offer a way back to them; with the round trip gone they were
   * parameters nobody read, in an address somebody might share.
   */
  const chartHref = (start: string): string =>
    `/${t.locale}?${chartQuery(start, data.interval)}`;

  /**
   * The row of the answer the open hour stands on, if the answer still has
   * one.
   *
   * Matched on the minute, which is how every other part of this section
   * names an instant: the run's own `start` carries seconds and an offset,
   * a link to a board carries `time=04:10`, and an hour set aside is
   * `2026-09-01T04:10@qian`. Comparing the strings whole would mean the
   * shortlist could point at rows it cannot reach.
   *
   * It may well find nothing, and that is no longer a reason not to open. An
   * hour set aside under one set of criteria and looked at again under the
   * next is exactly the case the strip exists for; what the row supplies is
   * the pillar in the heading, and nothing else.
   */
  const picked = $derived(
    at ? scan?.moments.find((moment: any) => moment.start.slice(0, 16) === at.slice(0, 16)) : undefined,
  );

  /**
   * The board, asked for from the address and not from the answer.
   *
   * Both endpoints take an instant, which `at` is; neither has ever needed
   * the scan. Built from the row, they were open only to hours the current
   * criteria still returned.
   */
  const plateSrc = $derived(
    at && `/api/chart/plate?${chartQuery(at, data.interval, { lang: t.locale, scheme: appearance.current })}`,
  );
  const chartSrc = $derived(
    at && `/api/chart?${chartQuery(at, data.interval, { lang: t.locale })}`,
  );

  /**
   * The hour in words, which is what names the dialog.
   *
   * The pillar is added where the row is at hand and left out where it is
   * not. Nothing is hidden by that: the drawing carries all four pillars in
   * its own caption, and an hour named by its date and its clock is named.
   */
  const heading = $derived(
    at &&
      `${at.slice(0, 10)} ${at.slice(11, 16)}${picked ? ` · ${gloss('stem', picked.hour.stem.id)} ${gloss('branch', picked.hour.branch.id)} ${picked.hour.hanzi}` : ''}`,
  );

  /**
   * Choosing an hour opens its board over the list.
   *
   * The address follows the choice, but shallowly: `replaceState` from
   * `$app/navigation` moves it without running `load`, so picking an hour
   * does not rescan the interval. The answer behind the dialog is the one
   * already computed, and a board somebody is looking at is one they can
   * send — which a dialog holding its hour in a variable would not be.
   *
   * Replacing rather than pushing, as the scan itself does. A reader picks a
   * dozen hours in a row to compare them, and a back button that had to walk
   * out of all twelve is a back button that cannot leave the section. What
   * closes the dialog is Escape, the backdrop or the button, all three of
   * which a reader reaches for before the back button.
   */
  function pick(start: string): void {
    // To the minute, which is how this section names an instant everywhere
    // else — `time=04:10` in a link to a board, `…T04:10@qian` in the
    // shortlist. A run's own `start` carries seconds, milliseconds and an
    // offset, and the address is shorter and legible without them.
    at = start.slice(0, 16);
    mark();
  }

  function choose(event: MouseEvent, start: string): void {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    pick(start);
  }

  function unpick(): void {
    at = '';
    mark();
  }

  /**
   * Setting an hour aside, or taking it back.
   *
   * The same shallow write as `pick`, for the same reason: nothing here needs
   * the interval scanned again. The key is the minute and the palace — see
   * `keptKey` — so the row a box was ticked in and the entry in the address
   * are the same thing by construction, and a rescan finds its own boxes
   * already ticked.
   */
  const keys = $derived(new Set(kept.map((entry) => keptKey(entry.start, entry.palace))));

  const isKept = (start: string, palace: string): boolean => keys.has(keptKey(start, palace));

  function keep(start: string, palace: string): void {
    const key = keptKey(start, palace);
    kept = keys.has(key)
      ? kept.filter((entry) => keptKey(entry.start, entry.palace) !== key)
      : sortKept([...kept, { start: start.slice(0, 16), palace }]);
    mark();
  }

  function empty(): void {
    kept = [];
    mark();
  }

  /**
   * An hour set aside, said in full without an answer to read it out of.
   *
   * This is the whole reason the palace travels in the address beside the
   * minute. The entry may well not be a row any more — that is what happens
   * when the criteria are narrowed, and losing sight of what one had chosen
   * at exactly that moment is the failure the strip exists to prevent. It is
   * named from `PALACES` instead, which the engine's own list is asserted
   * against, and the whole board remains one link away.
   */
  const whenFormat = $derived(
    new Intl.DateTimeFormat(t.locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }),
  );
  const when = (start: string): string =>
    `${whenFormat.format(new Date(`${start.slice(0, 10)}T00:00:00Z`))} · ${start.slice(11, 16)}`;

  const palaceOf = (id: string): (typeof PALACES)[number] =>
    PALACES.find((palace) => palace.id === id) as (typeof PALACES)[number];

  /**
   * The list as something to paste somewhere else.
   *
   * Where "set aside" usually ends: in a message, a calendar, a notebook.
   * The address is the other way of taking it away, and the note under the
   * buttons says so — a link carries the list *and* reopens the scan behind
   * it, which no amount of text can.
   */
  let copied = $state(false);

  async function copy(): Promise<void> {
    if (!navigator.clipboard) return;

    const lines = kept.map(
      (entry) =>
        `${entry.start.slice(0, 10)} ${entry.start.slice(11, 16)} · ${palaceOf(entry.palace).number} ${gloss('palace', entry.palace)} ${palaceOf(entry.palace).hanzi}`,
    );
    await navigator.clipboard.writeText(
      [data.interval.place?.name, ...lines].filter(Boolean).join('\n'),
    );

    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  /** The choice, written where somebody can copy it out of the address bar. */
  function mark(): void {
    const next = new URL(page.url);
    if (at) next.searchParams.set('at', at);
    else next.searchParams.delete('at');

    const list = keptParam(kept);
    if (list) next.searchParams.set('kept', list);
    else next.searchParams.delete('kept');

    replaceState(next, page.state);
  }

  /**
   * What was asked for, said in the bar the fields left behind.
   *
   * The interval alone would not do here. A scan is run again and again with
   * one criterion changed, and a closed panel that showed only two dates
   * would hide the very thing being changed. Read from `data.criteria` and
   * not from `looking`: the bar reports the question that was answered, not
   * the one being typed.
   */
  const said = $derived([
    data.criteria.gate && gloss('gate', data.criteria.gate),
    data.criteria.star && gloss('star', data.criteria.star),
    data.criteria.spirit && gloss('spirit', data.criteria.spirit),
    data.criteria.minStrength && gloss('strength', data.criteria.minStrength),
    ...data.criteria.towards.map((id: string) => gloss('palace', PALACE_OF[id] as string)),
    ...data.criteria.without.map((id: string) => `− ${gloss('pattern', id)}`),
  ].filter(Boolean));
</script>

<svelte:head><title>{t('nav.moments')}</title></svelte:head>

<!-- Named, not shown: the nav says which section this is — see `.offscreen`. -->
<h1 class="offscreen">{t('nav.moments')}</h1>

<FormPanel
  {t}
  bind:this={panel}
  legend="form.interval"
  reopenLabel="form.openInterval"
  closable={scan !== undefined}
  onsubmit={submit}
>
  {#snippet fields()}
    <div class="row">
      <label>
        {t('form.from')}
        <input type="date" bind:value={asked.from} required />
      </label>
      <label>
        {t('form.to')}
        <input type="date" bind:value={asked.to} required />
      </label>
      <LocationSearch {t} bind:selected={asked.place} />
    </div>

    <fieldset>
      <legend>{t('form.looking')}</legend>

      <label class="purpose">
        {t('form.purpose')}
        <select value={purpose} onchange={(event) => choosePurpose(event.currentTarget.value)}>
          <option value="">{t('form.any')}</option>
          {#each PURPOSES as entry}
            <option value={entry.id}>{gloss('purpose', entry.id)}</option>
          {/each}
        </select>
      </label>
      <p class="note">{t('form.purposeNote')}</p>

      <!-- The four together in one row: they are asked of the same palace,
           and where there is room for four they are read as one question. -->
      <div class="row">
        <label>
          {t('cli.column.gate')}
          <select bind:value={looking.gate}>
            <option value="">{t('form.any')}</option>
            {#each GATE_IDS as id}
              <option value={id}>{gloss('gate', id)}</option>
            {/each}
          </select>
        </label>
        <label>
          {t('cli.column.star')}
          <select bind:value={looking.star}>
            <option value="">{t('form.any')}</option>
            {#each STAR_IDS as id}
              <option value={id}>{gloss('star', id)}</option>
            {/each}
          </select>
        </label>
        <label>
          {t('cli.column.spirit')}
          <select bind:value={looking.spirit}>
            <option value="">{t('form.any')}</option>
            {#each SPIRIT_IDS as id}
              <option value={id}>{gloss('spirit', id)}</option>
            {/each}
          </select>
        </label>
        <label>
          {t('form.minStrength')}
          <select bind:value={looking.minStrength}>
            <option value="">{t('form.any')}</option>
            {#each STRENGTHS as id}
              <option value={id}>{gloss('strength', id)}</option>
            {/each}
          </select>
        </label>
      </div>

      <!-- The direction is asked for in words, because it is a thing to
           choose. `se` is what travels in the address. -->
      <p class="group">{t('form.towards')}</p>
      <div class="checks">
        {#each DIRECTIONS as id}
          <label class="check">
            <input
              type="checkbox"
              checked={looking.towards.includes(id)}
              onchange={(event) =>
                (looking.towards = toggle(looking.towards, id, event.currentTarget.checked))}
            />
            {gloss('palace', PALACE_OF[id])}
          </label>
        {/each}
      </div>

      <p class="group">{t('form.without')}</p>
      <div class="checks">
        {#each PATTERN_IDS as id}
          <label class="check">
            <input
              type="checkbox"
              checked={looking.without.includes(id)}
              onchange={(event) =>
                (looking.without = toggle(looking.without, id, event.currentTarget.checked))}
            />
            {gloss('pattern', id)}
          </label>
        {/each}
      </div>

      <p class="note">{t('form.criteriaNote')}</p>
    </fieldset>

    <SubmitButton {t} label="form.scan" {busy} {needed} />
  {/snippet}
  {#snippet summary()}
    <span>{data.interval.from || '—'} → {data.interval.to || '—'}</span>
    {#if data.interval.place}<span>· {data.interval.place.name}</span>{/if}
    {#each said as criterion}<span class="criterion">{criterion}</span>{/each}
  {/snippet}
</FormPanel>

<!--
  Above the answer, and deliberately outside it.

  What is set aside outlives the scan that found it: a rescan that narrows the
  criteria is exactly how a shortlist gets built, and it may well leave an
  hour already chosen off the table. So the strip stands here, where a scan
  that matched nothing — or failed — still cannot take it away.

  A `details` and not a panel of the page's own: it opens and shuts without
  scripts, it is the one disclosure on the site nothing else has to know the
  state of, and shut it costs a single line above the count.
-->
{#if kept.length > 0}
  <details class="kept" open>
    <summary>{t('form.kept', { count: kept.length })}</summary>

    <ul>
      {#each kept as entry (keptKey(entry.start, entry.palace))}
        <li>
          <!-- The board over the strip, exactly as a row of the table opens
               it, and a link all the same — see `isPlainClick`. -->
          <a
            href={chartHref(entry.start)}
            aria-current={entry.start === at ? 'true' : undefined}
            onclick={(event) => choose(event, entry.start)}
          >
            <span>{when(entry.start)}</span>
            <span class="where">
              {palaceOf(entry.palace).number}
              {gloss('palace', entry.palace)}
              <span class="glyph">{palaceOf(entry.palace).hanzi}</span>
            </span>
          </a>
          <button
            type="button"
            aria-label={t('form.keptRemove', {
              hour: when(entry.start),
              palace: gloss('palace', entry.palace),
            })}
            onclick={() => keep(entry.start, entry.palace)}
          >
            ×
          </button>
        </li>
      {/each}
    </ul>

    <p class="actions">
      <button type="button" onclick={copy}>
        {copied ? t('form.keptCopied') : t('form.keptCopy')}
      </button>
      <button type="button" onclick={empty}>{t('form.keptClear')}</button>
    </p>
    <p class="note">{t('form.keptNote')}</p>
  </details>
{/if}

{#if failure}<p class="failure" role="alert">{failure}</p>{/if}

{#if scan}
  <div class="result" class:stale={busy} aria-busy={busy}>
    <p class="count">
      {t('form.scanned', { runs: scan.scanned, matched: scan.moments.length })}
    </p>

    {#if scan.moments.length > 0}
      <div class="scroller frame">
        <MomentTable
          moments={scan.moments}
          {t}
          href={chartHref}
          picked={at}
          onpick={pick}
          keeping={isKept}
          onkeep={keep}
        />
      </div>
    {:else}
      <p class="none">{t('cli.value.nothingAnswered')}</p>
    {/if}
  </div>
{/if}

<!--
  Outside the answer, like the strip that also opens it.

  It used to hang inside the branch that renders the table, which made a board
  something only a row could open. The board is a pure function of an instant
  and a place, and both are in the address: an hour set aside a scan ago opens
  the same way, whether or not the criteria in force still return it.

  What is worth guarding is not the *absence* of a place, which is an ordinary
  scan reckoned on the meridian of the zone, but an address that named one and
  could not find it: everything cast from that address is cast for the
  server's own zone — a chart of somewhere else, looking exactly like a chart.
  The scan already refuses; `placeLost` is how the board refuses with it.
-->
{#if at && !data.placeLost}
  <PlateDialog
    {t}
    heading={heading as string}
    plate={plateSrc as string}
    chart={chartSrc as string}
    onclosed={unpick}
  />
{/if}

<style>
  .failure { color: var(--alarm); }
  /* As many per row as the panel has room for, one when it has none: the
     criteria are `select`s holding words of very uneven length, and a fixed
     pair of columns pushed the page sideways on a phone. */
  /* The bound is on the row, so the columns stay `1fr` and a phone still gets
     fields the width of the screen — see the same note in `MomentForm`. Wide
     enough for the four criteria to stay in one row, which is the point of
     putting them in one. */
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 0.9rem;
    max-width: 60rem;
    /* Without this the cap above becomes a floor on a narrow screen — see the
       note in `MomentForm`. */
    min-inline-size: 0;
  }
  /* Fields hang from the top of the row, whatever grows below one of them. */
  .row > :global(*) { align-self: start; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  label :global(input), label :global(select) { color: var(--ink); }
  fieldset {
    border: 1px solid var(--rule);
    /* The border is inset by a rem on a page that may have three to spare. */
    padding: 0.9rem clamp(0.5rem, 3vw, 0.9rem);
    display: grid;
    gap: 0.7rem;
    /* A fieldset does not shrink below its widest child on its own. */
    min-inline-size: 0;
  }
  legend { font-size: 0.85em; color: var(--faint); padding: 0 0.35rem; }
  .group { margin: 0.3rem 0 0; font-size: 0.9em; color: var(--faint); }
  /* Above the fields it fills, and wide: these are sentences, not words —
     but a sentence in a `select` gains nothing from a line 70rem long. */
  .purpose { font-size: 0.95em; max-width: 34rem; }
  .checks { display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; }
  .check { display: flex; gap: 0.4rem; align-items: center; color: var(--ink); }
  /* Prose keeps a measure the eye can return from, whatever the panel does. */
  .note { margin: 0; color: var(--faint); font-size: 0.8em; max-width: 42rem; }
  .count { color: var(--faint); font-size: 0.9em; }
  .none { color: var(--faint); }
  /* Each criterion set off from the next, so the closed bar reads as a list
     of what was asked and not as a sentence. */
  .criterion {
    border: 1px solid var(--rule);
    border-radius: 999px;
    padding: 0.05rem 0.5rem;
    white-space: nowrap;
  }
  .result { transition: opacity 0.15s ease-out; }
  .stale { opacity: 0.5; }
  /*
   * The one table on the site that scrolls in both directions.
   *
   * Elsewhere `.scroller` is a frame the page scrolls past; here the answer
   * is hundreds of rows and the column names, the day and the hour stay in
   * view while they go by — which they can only do if this box is what
   * scrolls, since a sticky cell sticks to its nearest scroll container and
   * a frame the height of its content never scrolls vertically at all. The
   * height is a share of the window rather than a measurement, so the panel
   * above stays readable on whatever the window is; below this there is
   * nothing but the page's foot, so the scrolling does not strand anything.
   */
  .frame { max-height: 70vh; }

  /*
   * The shortlist: a rule and a heading, and nothing that competes with the
   * panel above it. It is not a second form — it is a note the reader wrote
   * on the side of the answer, and it should read like one.
   */
  .kept { border-top: 1px solid var(--rule); padding-top: 0.6rem; margin-bottom: 1.6rem; }
  .kept summary { color: var(--faint); font-size: 0.9em; cursor: pointer; }
  .kept ul {
    list-style: none;
    margin: 0.6rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    /* Twenty hours are a shortlist somebody is still narrowing, and they are
       not worth half the window. Past a few rows of them it scrolls. */
    max-height: 11rem;
    overflow-y: auto;
  }
  /*
   * One hour to a pill: the whole of what was chosen, and the way back to the
   * board it stands in. The date leads and the palace is under it, which is
   * the order the table reads in — the same answer, gathered rather than
   * spread over a fortnight.
   */
  .kept li {
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
    border: 1px solid var(--rule);
    border-radius: 6px;
    padding: 0.25rem 0.35rem 0.25rem 0.55rem;
  }
  .kept li a { text-decoration: none; display: grid; font-size: 0.9em; }
  .kept li a:hover { text-decoration: underline; text-underline-offset: 0.2em; }
  .kept .where { color: var(--faint); font-size: 0.85em; }
  .kept li button {
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    font: inherit;
    padding: 0 0.15rem;
    line-height: 1.2;
  }
  .kept li button:hover { color: var(--alarm); background: none; }
  .actions { display: flex; gap: 0.5rem; margin: 0.6rem 0 0; }
  .actions button { font-size: 0.85em; cursor: pointer; padding: 0.15rem 0.5rem; }
  /*
   * The board is over the list and not in it — see `PlateDialog`.
   *
   * Sharing the page between them was tried and does not fit: the list asks
   * for some 55rem of content before it starts scrolling inside its frame,
   * the narrowest board in which the glyphs can still be read is another 17,
   * and the shell's measure is 72rem for all of it. Every arrangement that
   * fitted both did it by hiding the spirit behind the board, which is the
   * one thing the scrolling frame exists to spare the reader.
   */
  @media (prefers-reduced-motion: reduce) {
    .result { transition: none; }
  }
</style>
