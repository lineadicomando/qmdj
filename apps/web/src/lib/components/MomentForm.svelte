<script lang="ts">
  import type { Translator } from '@qimendunjia/i18n';
  import type { Location } from '$lib/moment';
  import LocationSearch from './LocationSearch.svelte';

  let {
    t,
    date = $bindable(''),
    time = $bindable(''),
    place = $bindable<Location | undefined>(undefined),
    trueSolarTime = $bindable(true),
    dayBoundary = $bindable('zishi'),
  }: {
    t: Translator;
    date?: string;
    time?: string;
    place?: Location | undefined;
    trueSolarTime?: boolean;
    dayBoundary?: string;
  } = $props();
</script>

  <div class="row">
    <label>
      {t('cli.column.day')}
      <!-- ISO whatever the locale: a shared address must mean one thing. -->
      <input type="date" bind:value={date} />
    </label>
    <label>
      {t('cli.column.hour')}
      <input type="time" bind:value={time} />
    </label>
  </div>

  <LocationSearch {t} bind:selected={place} />

  <details>
    <summary>{t('cli.note.methodOnly')}</summary>
    <label class="check">
      <input type="checkbox" bind:checked={trueSolarTime} />
      {t('cli.field.solar')}
    </label>
    <label>
      {t('cli.field.local')}
      <select bind:value={dayBoundary}>
        <option value="zishi">zishi — 23:00</option>
        <option value="midnight">midnight — 00:00</option>
      </select>
    </label>
  </details>

<style>
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
  label { display: grid; gap: 0.2rem; font-size: 0.9em; color: var(--faint); }
  label :global(input), label :global(select) { font: inherit; color: var(--ink); }
  .check { display: flex; gap: 0.45rem; align-items: center; }
  summary { cursor: pointer; color: var(--faint); font-size: 0.85em; }
  details { display: grid; gap: 0.6rem; }
</style>
