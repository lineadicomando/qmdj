import { chartLabels, computeQimenChart, sayGanzhi } from '@qimendunjia/core';
import { createTranslator } from '@qimendunjia/i18n';
import { renderChartSvg } from '@qimendunjia/plate';
import { momentIsFixed, readLocale, readMoment } from '$lib/server/params';
import { isHttpError, toHttpError } from '$lib/server/errors';
import type { RequestHandler } from './$types';

/**
 * `GET /api/chart/plate?date=2024-06-15&time=14:00&locationId=1816670`
 *
 * The chart as a picture. It carries the note that it is not a reading,
 * because a picture travels further than the page it was made on — but it
 * does not carry the warnings, so a surface showing it should show the data
 * too.
 */
export const GET: RequestHandler = ({ url, request, setHeaders }) => {
  try {
    const locale = readLocale(url.searchParams, request.headers.get('accept-language'));
    const t = createTranslator(locale);
    const { moment } = readMoment(url.searchParams);
    const chart = computeQimenChart(moment, moment.options);

    // The intrinsic size, which the page overrides with CSS anyway. It
    // matters to whoever saves the file or drops it somewhere unstyled.
    const size = Math.min(2048, Math.max(240, Number(url.searchParams.get('size') ?? 900)));
    const labels = chartLabels(t);
    const PILLARS = [
      moment.pillars.year,
      moment.pillars.month,
      moment.pillars.day,
      moment.pillars.hour,
    ]
      // The word and the name it renders, as everywhere else on the board.
      .map((pair) => `${sayGanzhi(pair, t)} ${pair.hanzi}`)
      // A visible separator, not spaces: SVG collapses runs of whitespace,
      // so four pillars set three spaces apart arrive as one long phrase.
      .join(' / ');

    // `auto` emits both schemes behind a media query, which is right for a
    // drawing dropped into a page nobody controls. A page that knows what its
    // reader picked asks for that one instead.
    const asked = url.searchParams.get('scheme');
    const scheme = asked === 'light' || asked === 'dark' ? asked : 'auto';

    const svg = renderChartSvg(chart, {
      size,
      scheme,
      labels,
      captions: {
        ju: `${chart.ju.yang ? t('cli.value.yangDun') : t('cli.value.yinDun')} ${chart.ju.number}`,
        pillars: PILLARS,
        chief: `${t('cli.field.chief')} ${labels.star[chart.chief.star.id]} ${chart.chief.star.hanzi}`,
        chiefGate: `${t('cli.field.chiefGate')} ${labels.gate[chart.chiefGate.gate.id]} ${chart.chiefGate.gate.hanzi}`,
      },
    });

    setHeaders({
      'cache-control': momentIsFixed(url.searchParams) ? 'private, max-age=86400' : 'no-store',
    });
    return new Response(svg, { headers: { 'content-type': 'image/svg+xml; charset=utf-8' } });
  } catch (cause) {
    if (isHttpError(cause)) throw cause;
    toHttpError(cause);
  }
};
