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
      candidates = [];
      return;
    }

    timer = setTimeout(async () => {
      searching = true;
      try {
        const response = await fetch(
          `/api/locations?q=${encodeURIComponent(text)}&lang=${t.locale}`,
        );
        candidates = response.ok ? ((await response.json()).results as Location[]) : [];
      } finally {
        searching = false;
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
      {#if selected.region}, {selected.region}{/if}, {selected.country}
      <span class="zone">{selected.timezone}</span>
      <button type="button" onclick={() => (selected = undefined)}>×</button>
    </p>
  {/if}

  {#if candidates.length > 0}
    <ul>
      {#each candidates as candidate (candidate.id)}
        <li>
          <button type="button" onclick={() => choose(candidate)}>
            <span>{candidate.name}</span>
            <span class="where">
              {#if candidate.region}{candidate.region}, {/if}{candidate.country}
            </span>
            <span class="zone">{candidate.timezone}</span>
          </button>
        </li>
      {/each}
    </ul>
  {:else if searching}
    <p class="quiet">…</p>
  {/if}
</div>

<style>
  .search { position: relative; }
  input { width: 100%; }
  ul {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    border: 1px solid var(--rule);
    border-radius: 6px;
    background: var(--ground);
    max-height: 16rem;
    overflow-y: auto;
  }
  li + li { border-top: 1px solid var(--rule); }
  li button {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.6rem;
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
  .where, .zone { color: var(--faint); font-size: 0.85em; }
  .chosen { display: flex; gap: 0.5rem; align-items: baseline; margin: 0.4rem 0 0; }
  .chosen button { border: 0; background: none; cursor: pointer; color: var(--faint); font-size: 1.1em; }
  .quiet { color: var(--faint); margin: 0.4rem 0 0; }
</style>
