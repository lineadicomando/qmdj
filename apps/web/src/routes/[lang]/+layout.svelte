<script lang="ts">
  import ColorSchemeToggle from '$lib/components/ColorSchemeToggle.svelte';
  import GlyphRain from '$lib/components/GlyphRain.svelte';
  import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
  import SectionsNav from '$lib/components/SectionsNav.svelte';
  import { rain } from '$lib/rain.svelte';

  let { data, children } = $props();
  const t = $derived(data.t);
</script>

<!-- Mounted only while it falls, so that the page ships with no canvas, no
     loop and no listeners until somebody has gone looking. -->
{#if rain.falling}
  <GlyphRain />
{/if}

<div class="shell" class:veiled={rain.falling}>
  <header>
    <!-- The wordmark is not the page's title: each section carries its own
         `h1`, so the mark can stay the same on all of them. -->
    <a class="mark" href="/{t.locale}" aria-label="shipan 式盤 shìpán">
      <img src="/seal.svg" alt="" />
      <span class="name">
        <span class="word">shipan</span>
        <!-- A name carries its reading, on the mark as everywhere else. -->
        <span class="reading">式盤 · shìpán</span>
      </span>
    </a>

    <!-- One line for both: where the reader can go, and the two settings that
         say how they are reading it. The switches earn the end of that line
         rather than a row of their own, now that they are two letters and a
         circle — and they keep it on a phone, where the sections fold and they
         do not: two letters and a circle cost the line almost nothing, and an
         appearance buried behind a press is harder to reach than it is now. -->
    <div class="bar">
      <SectionsNav {t} />

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

  /*
   * What the page is read off while the rain falls behind it.
   *
   * Not a panel with an edge — a ground laid over the weather, ten per cent
   * short of opaque, so the glyphs are perceptible under the text without
   * competing with it. The measure of it is the disclaimer: the quietest
   * thing in the shell is `--faint` on `--ground`, and a veil thin enough to
   * put that below the contrast the rest of the stylesheet argues for would
   * be a veil that costs somebody the one line they must be able to read.
   *
   * Only the shell takes it. Outside 72rem the margins are bare, which is
   * where the rain is actually visible — and where nothing is being read.
   */
  .veiled {
    background: color-mix(in srgb, var(--ground) 90%, transparent);
  }

  header { margin-bottom: 2rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule); }
  /*
   * The mark sits above the line, centred, where the page has no margin to
   * put it in. Fitted to its content rather than stretched: an `<a>` as wide
   * as the header would be a click target the width of the page.
   */
  .mark { margin: 0 auto 1.1rem; width: fit-content; }

  /*
   * Where the reader can go, and how they are reading it, on one line.
   *
   * On the nav's own baseline rather than floating above its underline — and
   * said as the baseline rather than as the foot, which is what it used to
   * say. A foot is the same thing as a baseline only while the nav is one
   * line: folded open on a phone the nav is eight, its foot is under `Ba Zi`,
   * and the two switches went down there with it. The baseline is the first
   * one either way, which is the button when there is a button and the first
   * section when there is not.
   */
  .bar {
    display: flex;
    align-items: baseline;
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
  /* Height, never width: a seal is as wide as the name in it. One character
     stands upright at about 1:1.6 and two side by side run wider than tall,
     so a square box here would squash whichever the project ends up called. */
  .mark img { display: block; height: 34px; width: auto; }
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
      /* The shell's own top padding: the seal starts where the nav's line
         starts, rather than hanging below it. */
      top: 1rem;
      /* 6.5rem wide, half a rem clear of the shell's edge — which also leaves
         a rem of air outside it at exactly 88rem, where the margin is 8. */
      left: calc(50% - 36rem - 7rem);
      margin: 0;
      width: 6.5rem;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
    }
    .mark img { height: 76px; }
    .name { align-items: center; }
  }

  /* A sheet does not scroll, and a fixed element on one either repeats on
     every page or lands off it. */
  @media print {
    .mark { position: static; width: fit-content; flex-direction: row; margin: 0 auto 0.6rem; }
    .mark img { height: 34px; }
  }
  .controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }

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
    /* The nav hides itself: a scoped selector here no longer reaches a
       `<nav>` that is rendered in a component of its own. */
    .controls { display: none; }
    .mark { text-decoration: none; }
    header { margin-bottom: 1rem; }
    /* Close under what it qualifies, and never split: the disclaimer is two
       lines and half a disclaimer is worse than none. Tight, because it is
       what decides whether a report runs to one sheet more than it needs. */
    footer { margin-top: 0.8rem; break-inside: avoid; }
  }
</style>
