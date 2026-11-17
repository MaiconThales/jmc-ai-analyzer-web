/** Cores lidas dos tokens CSS, para os gráficos acompanharem o tema. */
export interface ChartColors {
  text: string;
  muted: string;
  border: string;
  surface: string;
  series: string[];
}

const FALLBACK: ChartColors = {
  text: '#14232a',
  muted: '#4e626b',
  border: '#dde5e8',
  surface: '#ffffff',
  series: ['#0b5563', '#7a5aa6', '#2f7ec1', '#a0558d', '#4c7a2e', '#8c6d3f'],
};

export function readChartColors(element: Element | null = globalThis.document?.documentElement ?? null): ChartColors {
  if (!element || typeof getComputedStyle !== 'function') {
    return FALLBACK;
  }
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    text: read('--text', FALLBACK.text),
    muted: read('--text-muted', FALLBACK.muted),
    border: read('--border', FALLBACK.border),
    surface: read('--surface', FALLBACK.surface),
    series: FALLBACK.series.map((color, i) => read(`--series-${i + 1}`, color)),
  };
}
