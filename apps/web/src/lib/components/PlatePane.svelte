<!--
  The board for one hour of a scan, shown above the scan that found it.

  A reader who has found four candidate hours wants to look at each of them
  and still have the list. Sending them to the chart section for that costs
  the list, and coming back costs the whole interval a second time — so the
  board comes to the list instead.

  It is a pane and not a modal on purpose: there is nothing here to dismiss
  before carrying on. The list stays live behind no overlay, the keyboard
  keeps its place in it, and moving the choice from one hour to the next
  redraws this in place, which is how two hours get compared.

  What it does not hold — the palaces in full, the stepper, the form — is one
  link away, and that link is the whole point of `form.openChart`.
-->
<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';
  import { sayFailure, type Failure } from '$lib/moment';

  interface Props {
    t: Translator;
    /** The hour this is the board of, said in words: it names the pane. */
    heading: string;
    /** The drawing. */
    plate: string;
    /** The same chart as data, for what a drawing cannot carry. */
    chart: string;
    /** The whole section, for what this pane cannot carry. */
    href: string;
    onclose: () => void;
  }

  let { t, heading, plate, chart, href, onclose }: Props = $props();

  /** One `id` per instance, since the heading is what names the region. */
  const named = $props.id();

  /**
   * The data beside the picture.
   *
   * The rule the chart section states and this obeys: a drawing carries the
   * glyphs but not the warnings, so it is never shown on its own. The scan's
   * own row already says where the gates and stars stand; what is missing
   * from it is the ju and the patterns, and that is what this fetches.
   *
   * Asked for from the browser, not from `load`: the drawing beside it is an
   * `<img>` the browser fetches anyway, so there is nothing to be gained by
   * having the server wait on the same answer — and picking an hour must not
   * run the page's `load`, which would rescan the interval.
   */
  const asked = $derived(read(chart));

  async function read(from: string): Promise<any> {
    const response = await fetch(from);
    const body = await response.json();
    if (!response.ok) throw new Error(sayFailure(t, body as Failure));
    return body.chart;
  }

  /**
   * The drawing that is on screen, as against the one that was asked for.
   *
   * The same reason as in the chart section: `src` changes before a pixel of
   * the new picture exists, and the browser holds the old board up in the
   * meantime with nothing to say it is last question's answer.
   */
  let drawn = $state('');
</script>

<section class="pane" aria-labelledby={named}>
  <div class="head">
    <h2 id={named}>{heading}</h2>
    <button type="button" onclick={onclose} aria-label={t('form.close')}>×</button>
  </div>

  <img
    src={plate}
    alt=""
    width="640"
    height="640"
    class:settling={drawn !== plate}
    onload={() => (drawn = plate)}
  />

  {#await asked}
    <p class="note">{t('form.working')}</p>
  {:then found}
    <p class="ju">
      {found.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')}
      {found.ju.number} · {t(`label.yuan.${found.ju.yuan}` as MessageKey)}
    </p>

    {#if found.patterns.length > 0}
      <ul class="patterns">
        {#each found.patterns as pattern}
          <li>
            {t(`label.pattern.${pattern.id}` as MessageKey)}
            {#if pattern.palace}— {pattern.palace}{/if}
            <span class="glyph">{pattern.hanzi}</span>
          </li>
        {/each}
      </ul>
    {/if}
  {:catch failure}
    <p class="failure" role="alert">{failure.message}</p>
  {/await}

  <a class="whole" {href}>{t('form.openChart')}</a>
</section>

<style>
  .pane {
    border: 1px solid var(--rule);
    border-radius: 8px;
    background: var(--tint);
    padding: 0.8rem 0.9rem 1rem;
    display: grid;
    gap: 0.7rem;
    /* A grid item does not shrink below its widest child on its own, and the
       drawing would happily be as wide as the column it was given. */
    min-inline-size: 0;
    /*
     * Above the list, where the width is the page's, the board is still a
     * glance and not the reading: left to fill it, the drawing came out
     * taller than the screen and the list it belongs to was nowhere. The
     * chart section is where a board is looked at full size, and it is one
     * link from here.
     */
    max-inline-size: 30rem;
  }
  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
  h2 { font-size: 0.9rem; font-weight: 400; margin: 0; }
  .head button {
    border: 0;
    background: none;
    color: var(--faint);
    cursor: pointer;
    font: inherit;
    padding: 0 0.2rem;
  }
  .head button:hover { color: var(--ink); background: none; }
  /* The drawing fills the pane, whatever the pane was given — which is less
     than the chart section gives it, and that is the trade: this is the
     board at a glance, and the section is where it is read closely. */
  img { display: block; width: 100%; height: auto; transition: opacity 0.15s ease-out; }
  .settling { opacity: 0.35; }
  @media (prefers-reduced-motion: reduce) {
    img { transition: none; }
  }
  .ju { margin: 0; font-size: 0.95em; }
  .note, .failure { margin: 0; font-size: 0.85em; }
  .note { color: var(--faint); }
  .failure { color: var(--alarm); }
  .patterns { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.2rem; font-size: 0.85em; }
  .glyph { margin-left: 0.4rem; color: var(--faint); font-size: 0.9em; }
  .whole { color: var(--faint); font-size: 0.85em; justify-self: start; }
</style>
