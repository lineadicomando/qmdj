<script lang="ts">
  import { page } from '$app/state';
  import ColorSchemeToggle from '$lib/components/ColorSchemeToggle.svelte';
  import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
  import { SECTIONS, href, isCurrent } from '$lib/navigation';

  let { data, children } = $props();
  const t = $derived(data.t);
</script>

<div class="shell">
  <header>
    <div class="top">
      <!-- The wordmark is not the page's title: each section carries its own
           `h1`, so the mark can stay the same on all of them. -->
      <a class="mark" href="/{t.locale}">qimendunjia</a>
      <div class="controls">
        <LanguageSwitch {t} />
        <ColorSchemeToggle {t} />
      </div>
    </div>

    <nav aria-label={t('nav.sections')}>
      <ul>
        {#each SECTIONS as section (section.slug)}
          {@const current = isCurrent(t.locale, section.slug, page.url.pathname)}
          <li>
            <a
              href={href(t.locale, section.slug)}
              aria-current={current ? 'page' : undefined}
              class:current
            >
              {t(section.label)}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </header>

  <main>{@render children()}</main>

  <footer>
    <p>
      {t('footer.data', { ephemeris: 'Swiss Ephemeris', geonames: 'GeoNames' })}
    </p>
    <p>
      <a href="/{t.locale}/notes">{t('footer.notes')}</a> ·
      <a href="/{t.locale}/privacy">{t('footer.privacy')}</a> ·
      {t('footer.licence')}
    </p>
  </footer>
</div>

<style>
  .shell { max-width: 72rem; margin: 0 auto; padding: 1rem 1.25rem 3rem; }

  header { margin-bottom: 2rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule); }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  .mark { font-size: 1.05rem; letter-spacing: 0.02em; text-decoration: none; }
  .controls { display: flex; align-items: center; gap: 1rem; }

  nav ul { display: flex; gap: 1.4rem; list-style: none; margin: 0.9rem 0 0; padding: 0; }
  nav a { color: var(--faint); text-decoration: none; padding-bottom: 0.35rem; }
  nav a:hover { color: var(--ink); }
  nav a.current { color: var(--ink); border-bottom: 2px solid var(--ink); }

  footer {
    margin-top: 4rem;
    padding-top: 1rem;
    border-top: 1px solid var(--rule);
    color: var(--faint);
    font-size: 0.85em;
  }
  footer p { margin: 0.3rem 0; }
</style>
