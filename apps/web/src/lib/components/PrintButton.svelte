<!--
  Onto a sheet, which is the one way out of here that owes nothing to anybody's
  account.

  Its own component because three sections offer it and a fourth will, and
  because what it prints is decided by each page's `@media print` rather than
  here: this only opens the dialog.
-->
<script lang="ts">
  import type { Translator } from '@shipan/i18n';
  import Icon from './Icon.svelte';

  let { t }: { t: Translator } = $props();
</script>

<button type="button" class="quiet-button" onclick={() => window.print()}>
  <Icon name="print" />
  {t('form.print')}
</button>

<style>
  /* The look is `.quiet-button` in `app.css`, shared with the copy button
     beside it: this one had `border: 0` and was the odd one of the pair. */
  button { display: inline-flex; align-items: baseline; gap: 0.4em; font: inherit; }
</style>
