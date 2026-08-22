<script lang="ts">
  import type { MessageKey, Translator } from '@shipan/i18n';
  import { onMount } from 'svelte';
  import {
    applyColorScheme,
    nextColorScheme,
    readColorScheme,
    type ColorScheme,
  } from '$lib/color-scheme';
  import { appearance, syncAppearance } from '$lib/appearance.svelte';
  import { toggleRain } from '$lib/rain.svelte';

  let { t }: { t: Translator } = $props();

  /**
   * A circle that fills, rather than a sun and a moon.
   *
   * The circle says the one thing the button controls — how much light the
   * page has — and says it in no language, which suits a control that sits
   * beside a language switch.
   */
  let scheme = $state<ColorScheme>('auto');

  // The server cannot know what the reader chose, so the markup starts at
  // `auto`. The attribute on `<html>` was already set by the script in
  // `app.html`; this reads it back as soon as the page comes alive.
  onMount(() => {
    scheme = readColorScheme();
    syncAppearance();
  });

  const name = (value: ColorScheme): string => t(`scheme.${value}` as MessageKey);

  /**
   * The way round, quickly, and something else falls out of it.
   *
   * There are three appearances, so three presses land on the one they
   * started from: the gesture spends nothing and leaves the reader exactly
   * where they were, which is what makes it usable as a second meaning for a
   * button that already has one. A double click could not be — two of its
   * presses are cycles that happened, and the appearance would be two steps
   * from where it was before anything else could fire. Nor would it reach the
   * keyboard, and this does: three presses are three presses whether they
   * came from a pointer or from a space bar.
   *
   * Nothing is announced. Something found is not a setting, and a control
   * that offered it in its label would be offering a joke as a feature.
   */
  const ROUND = 3;
  /** Long enough not to catch somebody choosing an appearance twice over. */
  const QUICKLY = 1200;
  let presses: number[] = [];

  function cycle(): void {
    scheme = nextColorScheme(scheme);
    applyColorScheme(scheme);
    // Anything that cannot read the attribute — the drawing, which is an
    // image — has to be told separately.
    appearance.current = scheme;

    const now = Date.now();
    presses = [...presses, now].filter((at) => now - at < QUICKLY);
    if (presses.length < ROUND) return;
    presses = [];
    toggleRain();
  }
</script>

<button
  type="button"
  onclick={cycle}
  aria-label={t('scheme.switch', { current: name(scheme), next: name(nextColorScheme(scheme)) })}
  title="{t('scheme.label')}: {name(scheme)}"
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {#if scheme === 'dark'}
      <circle cx="12" cy="12" r="9" fill="currentColor" />
    {:else if scheme === 'auto'}
      <!-- Half filled: half of whatever light the system is giving. -->
      <path d="M12 3 a9 9 0 0 1 0 18 z" fill="currentColor" />
    {/if}
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.75" />
  </svg>
</button>

<style>
  button {
    display: inline-flex;
    padding: 0.25rem;
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    line-height: 0;
  }
  button:hover, button:focus-visible { color: var(--ink); background: none; }
  svg { width: 1.15rem; height: 1.15rem; }
</style>
