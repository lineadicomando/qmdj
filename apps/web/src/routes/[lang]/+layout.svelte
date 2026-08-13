<script lang="ts">
  import { page } from '$app/state';
  import ColorSchemeToggle from '$lib/components/ColorSchemeToggle.svelte';
  import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
  import { SECTIONS, carriedSearch, href, isCurrent } from '$lib/navigation';

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
              href={href(t.locale, section.slug, carriedSearch(page.url.search))}
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
    <!-- First of the three, and not in the small print at the end of them:
         it is the one line here that is about what to do with any of this. -->
    <p class="disclaimer">{t('footer.disclaimer')}</p>
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
  /* The gutter narrows with the screen: at 1.25rem a side, a phone spends a
     tenth of its width on margins. */
  .shell { max-width: 72rem; margin: 0 auto; padding: 1rem clamp(0.75rem, 4vw, 1.25rem) 3rem; }

  header { margin-bottom: 2rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule); }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem 1rem;
    flex-wrap: wrap;
  }
  .mark { font-size: 1.05rem; letter-spacing: 0.02em; text-decoration: none; }
  .controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

  /* Three sections and two words apiece: on a narrow screen they wrap rather
     than scroll off the edge. */
  nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.4rem;
    list-style: none;
    margin: 0.9rem 0 0;
    padding: 0;
  }
  nav a { color: var(--faint); text-decoration: none; padding-bottom: 0.35rem; }
  nav a:hover { color: var(--ink); }
  nav a.current { color: var(--ink); border-bottom: 2px solid var(--ink); }

  /*
   * Centred, and across the whole shell.
   *
   * Three short lines set flush left under a page of tables read as a fourth
   * column of it. Centred they read as what they are — the foot of the page,
   * and not the last thing the chart had to say.
   *
   * No measure on them either. A `max-width` here is the width of a paragraph
   * somebody reads through, and these are not that: bounded to 62ch the
   * disclaimer broke into three ragged lines in the middle of a shell twice
   * as wide, which is a line break the reader has to account for and cannot.
   */
  footer {
    margin-top: 4rem;
    padding-top: 1rem;
    border-top: 1px solid var(--rule);
    color: var(--faint);
    font-size: 0.85em;
    text-align: center;
  }
  /* Darker than the two lines under it. A disclaimer set in the same grey as
     a licence notice is a disclaimer nobody reads, and this one is the reason
     the other two are allowed to be quiet. */
  .disclaimer { color: var(--ink); }
  footer p { margin: 0.3rem 0; }
</style>
