<!--
  What stands under a board, and what stands beside it.

  Two groups, named apart, because they are two relations and not one list.
  The **calendar** is what the chart was cast *from*: the term decides the ju,
  the jie opens the month the pillars are read by. The **almanac** is the page
  the chart was read *against* — no part of the board, answering nothing, the
  same page for everybody who opens it on that date.

  They used to be neither. The calendar was absent from the page altogether,
  and the almanac was a run of glyphs under the pillars with nothing to say
  which layer it belonged to — so a reader met 定 dìng beside 庚戌 and had no
  way to tell a second art from another field of the first. That is the exact
  mistake this project refuses everywhere else, and it was sitting in the
  markup.

  One component, used by both boards and by the pillars, because there were
  two copies of it and the copy that drifts is never the one being looked at.
-->
<script lang="ts">
  import type { MessageKey, Translator } from '@qimendunjia/i18n';

  /**
   * The moment as data, not as a type: the client imports only types from
   * `core`, and what arrives here has crossed HTTP as JSON in any case.
   *
   * `almanac` is false in one place, the Four Pillars, and the reason is the
   * one this component was written to enforce rather than an exception to it.
   * The calendar belongs there more than it belongs here — the 節 is what the
   * month pillar turns at, so a birth three hours from 立秋 has a column that
   * hangs on it. The almanac does not: 曆注 is 擇日, a day weighed as the
   * occasion of an undertaking, and a birth is not an undertaking. Beside four
   * pillars read as a person it would be read as a remark about the person,
   * and three things make that certain rather than likely — 建除 is a function
   * of the month and day branches printed a hand's width above, 天德 月德 天馬
   * 劫煞 三合 六合 太陰 白虎 大耗 are all names the 八字 tradition also uses and
   * derives otherwise, and no source reads this page against a nativity. That
   * is the graft the natal Qi Men was made of. See `docs/history/` phase 15.
   */
  let { moment, t, almanac = true }: { moment: any; t: Translator; almanac?: boolean } = $props();

  /**
   * Every field is guarded on its own, and the guard is not superstition.
   *
   * A chart is cached `private` for a day, so the first thing a field added to
   * the engine meets is an answer cast before it existed. One guard round the
   * whole block would throw the calendar away to protect a 神煞.
   */
  const page = $derived(almanac ? moment?.almanac : undefined);
</script>

<div class="beside">
  <!--
    The calendar: what the chart was cast from. The term is first because it is
    what the ju is counted from, and the jie beside it because that is the one
    the month pillar turns at — a reader who sees only «term» cannot tell which
    of the two moved their chart.

    Neither carries the instant it began. The CLI prints it and this does not:
    the moment arrives here as JSON, where a term is a Julian day and turning
    one into a local time needs the date library the client does not load. The
    first attempt printed the chart's own instant beside the jie instead, which
    is not a mistake a reader could have caught — it is a plausible number in
    the right place.
  -->
  <section>
    <h3>{t('web.calendar.heading')}</h3>
    <dl>
      {#if moment?.solarTerm}
        <dt>{t('cli.field.term')}</dt>
        <dd>
          <span class="glyph">{moment.solarTerm.term.hanzi} {moment.solarTerm.term.pinyin}</span>
          {t(`label.term.${moment.solarTerm.term.id}` as MessageKey)}
        </dd>
      {/if}
      {#if moment?.jie}
        <dt>{t('cli.field.jie')}</dt>
        <dd>
          <span class="glyph">{moment.jie.term.hanzi} {moment.jie.term.pinyin}</span>
          {t(`label.term.${moment.jie.term.id}` as MessageKey)}
        </dd>
      {/if}
      {#if moment?.lunar}
        <dt>{t('cli.field.lunar')}</dt>
        <dd>
          {moment.lunar.year} ·
          {#if moment.lunar.leap}{t('cli.value.leapMonth')}{/if}
          {moment.lunar.month}/{moment.lunar.day}
        </dd>
      {/if}
    </dl>
  </section>

  <!--
    The almanac: the page the board was read against, and never a field of it.
    Its own ganzhi is printed beside the officer because the page's day need
    not be the chart's — it turns on 120°E and on the date, where the pillars
    turn on the zone and the hour, so in the 子 hours and before a 節 strikes
    the two differ and each is right about a different question.
  -->
  {#if page}
    <section>
      <h3>
        {t('web.almanac.heading')}
        <span class="glyph">曆注 lìzhù</span>
      </h3>
      <dl>
        <dt>{t('cli.field.jianchu')}</dt>
        <dd>
          <span class="glyph">{page.officer.hanzi} {page.officer.pinyin}</span>
          {t(`label.officer.${page.officer.id}` as MessageKey)}
          · <span class="glyph">{page.day.hanzi}</span>
          {#if page.doubled}<span class="note">({t('cli.value.jianchuDoubled')})</span>{/if}
        </dd>

        <dt>{t('cli.field.lodge')}</dt>
        <dd>
          <span class="glyph">{page.lodge.hanzi}{page.lodge.planet.hanzi} {page.lodge.pinyin}</span>
          {t(`label.lodge.${page.lodge.id}` as MessageKey)}
        </dd>

        <dt>{t('cli.field.dayGod')}</dt>
        <dd>
          <span class="glyph">{page.god.hanzi} {page.god.pinyin}</span>
          {t(`label.daygod.${page.god.id}` as MessageKey)}
          <span class="glyph">{page.god.valence.hanzi}</span>
        </dd>

        {#if page.monthGods}
          <dt>{t('cli.field.monthGods')}</dt>
          <dd>
            {#each page.monthGods as god}
              <span class="entry">
                <span class="glyph" class:onday={god.onDay}>{god.hanzi}</span>
                {god.seat
                  ? god.seat.kind === 'stem'
                    ? t(`label.stem.${god.seat.stem.id}` as MessageKey)
                    : t(`label.palace.${god.seat.trigram.id}` as MessageKey)
                  : '—'}
              </span>
            {/each}
          </dd>
        {/if}

        {#if page.shensha?.some((god: any) => god.onDay)}
          <dt>{t('cli.field.shensha')}</dt>
          <dd>
            {#each page.shensha.filter((god: any) => god.onDay) as god}
              <span class="entry">
                <span class="glyph">{god.hanzi}</span>
                {t(`label.shensha.${god.id}` as MessageKey)}
                <span class="glyph">{god.valence.hanzi}</span>
              </span>
            {/each}
          </dd>
        {/if}

        {#if page.yearGods}
          <dt>{t('cli.field.yearGods')} <span class="glyph">{page.year.hanzi}</span></dt>
          <dd>
            {#each page.yearGods as god}
              <span class="entry">
                <span class="glyph">{god.hanzi}</span>
                {god.seat.kind === 'branch'
                  ? t(`label.branch.${god.seat.branch.id}` as MessageKey)
                  : god.seat.kind === 'stem'
                    ? t(`label.stem.${god.seat.stem.id}` as MessageKey)
                    : god.seat.kind === 'trigram'
                      ? t(`label.palace.${god.seat.trigram.id}` as MessageKey)
                      : god.seat.branches
                          .map((b: any) => t(`label.branch.${b.id}` as MessageKey))
                          .join(', ')}
              </span>
            {/each}
          </dd>
        {/if}
      </dl>
    </section>
  {/if}
</div>

<style>
  /*
   * Quieter than the board and clearly not it. Two sections side by side where
   * there is room and stacked where there is not — the almanac is the longer
   * of the two and must be free to run on without stretching the calendar.
   */
  .beside {
    display: grid;
    gap: 1rem 2rem;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
    margin-block-start: 1rem;
    font-size: 0.85em;
    color: var(--faint);
  }
  h3 {
    font-size: 1em;
    font-weight: 500;
    margin: 0 0 0.35rem;
    color: var(--ink);
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.15rem 0.75rem;
    margin: 0;
  }
  dt { grid-column: 1; white-space: nowrap; }
  dd { grid-column: 2; margin: 0; }
  /* A run of gods wraps as a run, and no entry is ever split across a line. */
  .entry { display: inline-block; margin-inline-end: 0.6rem; white-space: nowrap; }
  /* The virtue the day actually holds is the news. Weight, not colour, so the
     mark survives a sheet of paper. */
  .onday { font-weight: 600; }
  .note { opacity: 0.75; }

  /* On paper it belongs with the board it stands beside. */
  @media print {
    .beside { break-inside: avoid; }
  }
</style>
