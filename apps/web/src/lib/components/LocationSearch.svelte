<script lang="ts">
  import type { Translator } from '@qimendunjia/i18n';
  import type { Location } from '$lib/moment';

  let {
    t,
    selected = $bindable<Location | undefined>(undefined),
  }: { t: Translator; selected?: Location | undefined } = $props();

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
    candidates = [];
    query = '';
  }
</script>

<div class="search">
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
        onclick={() => (selected = undefined)}
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

<style>
  /* The same label as the fields it stands beside: this one is a component
     of its own, so it says so itself. */
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  .search { position: relative; }
  input { width: 100%; }
  /*
   * The candidates hang over the form rather than pushing it down.
   *
   * In the flow they made the row they sit in taller with every keystroke —
   * the fields beside them jumped, and everything below moved by the height
   * of a list that is gone a moment later. A list of candidates is a thing
   * offered over the page, not a part of it; `.search` has been positioned
   * for this all along.
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
</style>
