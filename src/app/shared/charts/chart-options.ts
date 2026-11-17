import type { EChartsCoreOption } from 'echarts/core';
import type { Point } from '../../core/api/models';
import { formatBytes, formatCount, formatDateTime, formatFraction } from '../format';
import { ChartColors } from './chart-theme';

export type ChartUnit = 'fraction' | 'bytes' | 'count';

export interface ChartSeries {
  name: string;
  points: Point[];
}

export interface RankingItem {
  label: string;
  value: number;
  /** Item com frame da aplicação ("seu código"). */
  highlight?: boolean;
}

export function formatUnit(value: number | null | undefined, unit: ChartUnit): string {
  switch (unit) {
    case 'fraction':
      return formatFraction(value);
    case 'bytes':
      return formatBytes(value);
    default:
      return formatCount(value);
  }
}

/** Séries temporais: média como linha; o máximo aparece no tooltip. */
export function timeSeriesOptions(
  series: ChartSeries[],
  unit: ChartUnit,
  colors: ChartColors,
  markLine?: { label: string; value: number },
): EChartsCoreOption {
  return {
    aria: { enabled: true },
    color: colors.series,
    grid: { left: 64, right: 16, top: 32, bottom: 56 },
    legend: { top: 0, textStyle: { color: colors.text } },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => formatUnit(value, unit),
    },
    xAxis: {
      type: 'time',
      axisLabel: { color: colors.muted },
      axisLine: { lineStyle: { color: colors.border } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: markLine ? (extent: { max: number }) => Math.max(extent.max, markLine.value) : undefined,
      axisLabel: { color: colors.muted, formatter: (value: number) => formatUnit(value, unit) },
      splitLine: { lineStyle: { color: colors.border } },
    },
    dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 8 }],
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line',
      showSymbol: false,
      smooth: false,
      data: s.points.map((p) => [p.ts, p.avg]),
      ...(index === 0 && markLine
        ? {
            markLine: {
              symbol: 'none',
              label: { formatter: markLine.label, color: colors.muted },
              lineStyle: { type: 'dashed', color: colors.muted },
              data: [{ yAxis: markLine.value }],
            },
          }
        : {}),
    })),
  };
}

/** Barras horizontais ordenadas, com destaque para itens do código da aplicação. */
export function rankingOptions(items: RankingItem[], unit: ChartUnit, colors: ChartColors): EChartsCoreOption {
  const sorted = [...items].sort((a, b) => a.value - b.value);
  return {
    aria: { enabled: true },
    grid: { left: 8, right: 72, top: 8, bottom: 8, containLabel: true },
    tooltip: { trigger: 'item', valueFormatter: (value: number) => formatUnit(value, unit) },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: sorted.map((i) => truncate(i.label, 48)),
      axisLabel: { color: colors.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 18,
        data: sorted.map((i) => ({
          value: i.value,
          name: i.label,
          itemStyle: { color: i.highlight ? colors.series[0] : colors.muted, borderRadius: 4 },
        })),
        label: { show: true, position: 'right', color: colors.text, formatter: ({ value }: { value: number }) => formatUnit(value, unit) },
      },
    ],
  };
}

/** Resumo em texto de uma série (acessibilidade e leitura rápida). */
export function summarizeSeries(series: ChartSeries[], unit: ChartUnit): string {
  const parts = series
    .filter((s) => s.points.length)
    .map((s) => {
      const avg = s.points.reduce((sum, p) => sum + (p.avg ?? 0), 0) / s.points.length;
      const max = Math.max(...s.points.map((p) => p.max ?? p.avg ?? 0));
      const peak = s.points.find((p) => (p.max ?? p.avg) === max);
      const when = peak?.ts ? ` às ${formatDateTime(peak.ts)}` : '';
      return `${s.name}: média ${formatUnit(avg, unit)}, pico ${formatUnit(max, unit)}${when}`;
    });
  return parts.length ? `${parts.join('; ')}.` : 'Sem dados na série.';
}

/** Resumo em texto de um ranking. */
export function summarizeRanking(items: RankingItem[], unit: ChartUnit): string {
  if (!items.length) {
    return 'Sem itens.';
  }
  const top = [...items].sort((a, b) => b.value - a.value).slice(0, 3);
  const listed = top.map((i) => `${i.label} (${formatUnit(i.value, unit)})`).join('; ');
  return `Maiores: ${listed}.`;
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `…${text.slice(text.length - max + 1)}` : text;
}
