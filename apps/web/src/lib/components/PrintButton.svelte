<!--
  Onto a sheet, which is the one way out of here that owes nothing to anybody's
  account.

  Its own component because three sections offer it and a fourth will, and
  because what it prints is decided by each page's `@media print` rather than
  here: this only opens the dialog.
-->
<script lang="ts">
  import type { Translator } from '@qimendunjia/i18n';
  import Icon from './Icon.svelte';

  let { t }: { t: Translator } = $props();
</script>

<button type="button" onclick={() => window.print()}>
  <Icon name="print" />
  {t('form.print')}
</button>

<style>
  button {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4em;
    font: inherit;
    font-size: 0.9em;
    color: var(--faint);
    background: none;
    border: 0;
    padding: 0 0.2rem;
    cursor: pointer;
  }
  button:hover { color: var(--ink); }
</style>
