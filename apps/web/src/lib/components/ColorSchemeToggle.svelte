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

  function cycle(): void {
    scheme = nextColorScheme(scheme);
    applyColorScheme(scheme);
    // Anything that cannot read the attribute — the drawing, which is an
    // image — has to be told separately.
    appearance.current = scheme;
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
