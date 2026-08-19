<script lang="ts">
  import { page } from '$app/state';
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

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
  A flag names a country and not a language. The code beside it names the
  language and nothing else — `it` is Italian wherever it is spoken, and no
  flag can say that. So the flag is the thing the eye finds and the code is
  the thing that is true, and the language's own name, which is what a reader
  would say out loud, stays on the label for anyone not reading by sight.
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
        <svg viewBox="0 0 9 6" aria-hidden="true">
          {#if locale === 'it'}
            <rect width="3" height="6" fill="#009246" />
            <rect x="3" width="3" height="6" fill="#fff" />
            <rect x="6" width="3" height="6" fill="#ce2b37" />
          {:else}
            <rect width="9" height="6" fill="#012169" />
            <path d="M0 0 9 6M9 0 0 6" stroke="#fff" stroke-width="1.2" />
            <path d="M0 0 9 6M9 0 0 6" stroke="#c8102e" stroke-width="0.7" />
            <path d="M4.5 0v6M0 3h9" stroke="#fff" stroke-width="2" />
            <path d="M4.5 0v6M0 3h9" stroke="#c8102e" stroke-width="1.2" />
          {/if}
        </svg>
        <span>{locale}</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  ul { display: flex; gap: 0.75rem; list-style: none; margin: 0; padding: 0; }
  a {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--faint);
    text-decoration: none;
    font-size: 0.85em;
  }
  a.current { color: var(--ink); }
  a:hover { color: var(--ink); }
  /* The code, not a word: two letters carry the same fact in a quarter of the
     room, which is what lets the switch sit on the nav's own line. */
  span { font-variant: all-small-caps; letter-spacing: 0.06em; font-size: 1.05em; }
  svg {
    width: 1.1rem;
    height: 0.74rem;
    border: 1px solid var(--rule);
    border-radius: 1px;
    /* The flag is decoration; the word beside it carries the meaning. */
    flex: none;
  }
  a.current svg { outline: 1px solid var(--ink); outline-offset: 1px; }
</style>
