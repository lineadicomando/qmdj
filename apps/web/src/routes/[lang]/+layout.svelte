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
    <!-- The wordmark is not the page's title: each section carries its own
         `h1`, so the mark can stay the same on all of them. -->
    <a class="mark" href="/{t.locale}" aria-label="queru 闕如 quērú">
      <img src="/seal.svg" alt="" width="34" height="34" />
      <span class="name">
        <span class="word">queru</span>
        <!-- A name carries its reading, on the mark as everywhere else. -->
        <span class="reading">闕如 · quērú</span>
      </span>
    </a>

    <!-- One line for both: where the reader can go, and the two settings that
         say how they are reading it. The switches earn the end of that line
         rather than a row of their own, now that they are two letters and a
         circle. -->
    <div class="bar">
      <nav aria-label={t('nav.sections')}>
        <ul>
          {#each SECTIONS as section, index (section.slug)}
            {@const current = isCurrent(t.locale, section.slug, page.url.pathname)}
            <!-- Space, not a rule and not a dropdown: the break between what a
                 reader does and what they look at is set in the one device this
                 page has for it. Nothing is hidden behind an interaction. -->
            <li class:opens={index > 0 && SECTIONS[index - 1].group !== section.group}>
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

      <div class="controls">
        <LanguageSwitch {t} />
        <ColorSchemeToggle {t} />
      </div>
    </div>
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
  /*
   * The mark sits above the line, centred, where the page has no margin to
   * put it in. Fitted to its content rather than stretched: an `<a>` as wide
   * as the header would be a click target the width of the page.
   */
  .mark { margin: 0 auto 1.1rem; width: fit-content; }

  /* Where the reader can go, and how they are reading it, on one line.
     Aligned at the foot so the switches sit on the nav's own baseline rather
     than floating above its underline. */
  .bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.5rem 1.5rem;
    flex-wrap: wrap;
  }
  .mark {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 1.05rem;
    letter-spacing: 0.02em;
    text-decoration: none;
    color: var(--ink);
  }
  .mark img { display: block; width: 34px; height: 34px; }
  .name { display: flex; flex-direction: column; line-height: 1.15; }
  .reading { font-size: 0.68rem; color: var(--faint); letter-spacing: 0.01em; }

  /*
   * Wide enough for a margin, and the seal goes and sits in it.
   *
   * Where a 印 belongs on a scroll: outside the field that is read, not inside
   * it — and it stays put while the page moves under it, which is the same
   * relation a stamp has to a scroll being unrolled. The threshold is the
   * shell (72rem) plus room on both sides for the mark and its gap; below it
   * there is no margin to move into and a fixed element would sit on top of
   * the text instead of beside it, so the header keeps it inline.
   *
   * The name travels with the seal. A glyph alone is unsayable to the reader
   * this is built for — the mark would become a shape nobody can search.
   */
  @media (min-width: 88rem) {
    .mark {
      position: fixed;
      top: 1.6rem;
      left: calc(50% - 36rem - 7.5rem);
      margin: 0;
      width: 6.5rem;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
    }
    .mark img { width: 76px; height: 76px; }
    .name { align-items: center; }
  }

  /* A sheet does not scroll, and a fixed element on one either repeats on
     every page or lands off it. */
  @media print {
    .mark { position: static; width: fit-content; flex-direction: row; margin: 0 auto 0.6rem; }
    .mark img { width: 34px; height: 34px; }
  }
  .controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

  /* Three sections and two words apiece: on a narrow screen they wrap rather
     than scroll off the edge. */
  nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.4rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  /* Twice the gap the list already sets, which reads as a division where
     a wider gap of the same kind would read as an accident. */
  nav li.opens { margin-inline-start: 1.6rem; }
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

  /*
   * On paper the shell keeps two of its three parts.
   *
   * The nav and the two switches are ways of going somewhere else, and a
   * sheet has nowhere else. What stays is the wordmark, because a printed
   * chart handed on should say where it was cast, and the whole footer,
   * because the disclaimer is the one line that must never be separated from
   * a chart — least of all on the copy that travels furthest from the page
   * carrying it.
   */
  @media print {
    .shell { max-width: none; padding: 0; }
    nav, .controls { display: none; }
    .mark { text-decoration: none; }
    header { margin-bottom: 1rem; }
    /* Close under what it qualifies, and never split: the disclaimer is two
       lines and half a disclaimer is worse than none. Tight, because it is
       what decides whether a report runs to one sheet more than it needs. */
    footer { margin-top: 0.8rem; break-inside: avoid; }
  }
</style>
