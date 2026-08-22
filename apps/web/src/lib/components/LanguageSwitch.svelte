<script lang="ts">
  import { page } from '$app/state';
  import type { MessageKey, Translator } from '@shipan/i18n';

  let { t }: { t: Translator } = $props();

  const LOCALES = ['en', 'it'] as const;

  /**
   * The same page in the other language, not the front page of it.
   *
   * Only the first segment of the path is the language, so swapping it keeps
   * the reader where they were — which is the whole point of switching.
   */
  function sibling(locale: string): string {
    const rest = page.url.pathname.split('/').slice(2).join('/');
    return `${rest ? `/${locale}/${rest}` : `/${locale}`}${page.url.search}`;
  }
</script>

<!--
  The code alone, because a flag names a country and not a language: `it` is
  Italian wherever it is spoken, and a tricolour says Italy, which is a claim
  about a place nobody switching languages is making. There were two marks
  here saying different things, and the one the eye found first was the one
  that was not true. The language's own name — what a reader would say out
  loud — stays on the label for anyone not reading by sight.
-->
<ul>
  {#each LOCALES as locale (locale)}
    {@const current = t.locale === locale}
    <li>
      <a
        href={sibling(locale)}
        hreflang={locale}
        aria-current={current ? 'true' : undefined}
        class:current
        title={t('lang.switch', { language: t(`lang.${locale}` as MessageKey) })}
        aria-label={t('lang.switch', { language: t(`lang.${locale}` as MessageKey) })}
      >
        {locale}
      </a>
    </li>
  {/each}
</ul>

<style>
  ul { display: flex; gap: 0.75rem; list-style: none; margin: 0; padding: 0; }
  /* The code, not a word: two letters carry the same fact in a quarter of the
     room, which is what lets the switch sit on the nav's own line. Lower case
     and unspaced, so it reads as the tag it is rather than as an initialism
     shouted next to a nav set in words. */
  a {
    color: var(--faint);
    text-decoration: none;
    font-size: 0.9em;
  }
  a.current { color: var(--ink); }
  a:hover { color: var(--ink); }
</style>
