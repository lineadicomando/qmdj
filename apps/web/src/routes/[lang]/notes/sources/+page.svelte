<!--
  What each quantity stands on, and how strongly.

  Derived whole from `docs/sources.tsv`: a quantity added to the engine reaches
  this page by being entered in the register, which is the rule `CLAUDE.md`
  already states — a quantity with no entry is a quantity nobody can weigh.

  **The ladder is printed above the table and not assumed.** A column of
  numbers whose meaning a reader has to already know would be worse than no
  column: the rungs are seven words and they are the whole point of the page.

  **The evidence is quoted, not translated.** What a quantity stands on and
  what it was checked against are citations — texts, editions, chapter numbers,
  the names of reference implementations and the spans they were run over — and
  this project keeps its register in English, the language of its source. The
  frame around them is the reader's: the ladder, what each rung means, what
  each layer is. That division is stated on the page rather than left for
  somebody to notice, because a reader who meets an English sentence on `/it`
  without being told why has met a bug.
-->
<script lang="ts">
  import type { MessageKey } from '@shipan/i18n';
  import { INSTRUMENTS } from '$lib/instruments';

  let { data } = $props();
  const t = $derived(data.t);

  const nameOf = (id: string): { hanzi: string; pinyin: string } | undefined =>
    INSTRUMENTS.find((instrument) => instrument.id === id)?.name;

  /** `0` to `5` and the dash, which is a value and not a blank. */
  const RUNGS = ['0', '1', '2', '3', '4', '5', '-'];
  const key = (rung: string): string => (rung === '-' ? 'none' : rung);
</script>

<svelte:head><title>{t('notes.sources.title')}</title></svelte:head>

<article>
  <h1>{t('notes.sources.title')}</h1>
  <p class="lead">{t('notes.sources.lead')}</p>

  <section class="ladder">
    <h2>{t('notes.ladder.title')}</h2>
    <p>{t('notes.ladder.lead')}</p>
    <dl>
      {#each RUNGS as rung (rung)}
        {@const held = data.tally.find((entry) => entry.rung === rung)?.count ?? 0}
        <dt>
          <span class="rung">{rung}</span>
          {t(`notes.rung.${key(rung)}` as MessageKey)}
          <span class="held">{t('notes.held', { count: held })}</span>
        </dt>
        <dd>{t(`notes.rung.${key(rung)}.means` as MessageKey)}</dd>
      {/each}
    </dl>
    <!-- The two things a rung is not, both of which a reader will otherwise
         supply for themselves: it is not a verdict on the quantity, and it is
         not a property of it either — it moves when the shelf does. -->
    <p class="caveat">{t('notes.ladder.notAVerdict')}</p>
    <p class="caveat">{t('notes.ladder.quoted')}</p>
  </section>

  {#each data.layers as layer (layer.id)}
    {@const name = layer.name ?? nameOf(layer.id)}
    <section>
      <h2>
        {#if name}
          <span class="said">{name.pinyin}</span>
          <span class="glyph">{name.hanzi}</span>
        {:else if layer.title}
          {t(layer.title)}
        {/if}
      </h2>

      <table>
        <thead>
          <tr>
            <th scope="col">{t('notes.column.quantity')}</th>
            <th scope="col" class="numeric">{t('notes.column.rung')}</th>
            <th scope="col">{t('notes.column.standsOn')}</th>
            <th scope="col">{t('notes.column.checkedAgainst')}</th>
          </tr>
        </thead>
        <tbody>
          {#each layer.quantities as row (row.quantity)}
            <tr>
              <th scope="row" lang="en">{row.quantity}</th>
              <td class="numeric">
                <span class="rung" title={t(`notes.rung.${key(row.rung)}` as MessageKey)}>
                  {row.rung}
                </span>
              </td>
              <td lang="en">{row.standsOn}</td>
              <td lang="en">{row.checkedAgainst}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/each}
</article>

<style>
  article { max-width: 62rem; }
  h1 { font-size: 1.25rem; font-weight: 500; }
  .lead { margin: 1rem 0; max-width: 40rem; }

  section { margin-top: 2.4rem; }
  h2 {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.1rem 0.6rem;
    margin: 0 0 0.8rem;
    font-size: 1.05rem;
    font-weight: 500;
  }
  .glyph { font-size: 0.85rem; color: var(--faint); font-weight: 400; }
  .said { letter-spacing: 0.01em; }

  .ladder { max-width: 44rem; }
  .ladder p { margin: 0.6rem 0; }
  dl { margin: 1rem 0 0; }
  dt { display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.7rem; }
  dd { margin: 0.1rem 0 0 2.1rem; color: var(--faint); font-size: 0.9rem; }
  /*
   * The rung is a figure in a box, the same box in the table below.
   *
   * It has to be recognisable at a glance in a column of forty-seven rows and
   * unmistakable for the count beside it in the list, and a bare digit is
   * neither.
   */
  .rung {
    display: inline-block;
    min-width: 1.6rem;
    padding: 0.05rem 0.35rem;
    border: 1px solid var(--rule);
    border-radius: 0.2rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
  }
  .held { color: var(--faint); font-size: 0.85rem; }
  .caveat { color: var(--faint); font-size: 0.9rem; max-width: 40rem; }

  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { text-align: left; vertical-align: top; padding: 0.5rem 0.6rem 0.5rem 0; }
  thead th { font-weight: 500; color: var(--faint); border-bottom: 1px solid var(--rule); }
  tbody tr { border-bottom: 1px solid var(--rule); }
  tbody th { font-weight: 500; width: 22%; }
  .numeric { width: 3.5rem; }

  /*
   * It belongs on a sheet, and it is the page of this section most likely to
   * be printed: somebody checking this engine against another wants the
   * register beside them and the screen for the other thing. Rows are kept
   * whole — half a row is a claim with its evidence on the next page.
   */
  @media print {
    article { max-width: none; }
    section { break-inside: auto; }
    tbody tr { break-inside: avoid; }
    dt, dd { break-inside: avoid; }
    .glyph, .held, .caveat, dd { color: var(--ink); }
  }
</style>
