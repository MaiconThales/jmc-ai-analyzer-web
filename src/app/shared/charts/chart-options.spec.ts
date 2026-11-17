import { readChartColors } from './chart-theme';
import {
  formatUnit,
  rankingOptions,
  summarizeRanking,
  summarizeSeries,
  timeSeriesOptions,
  truncate,
} from './chart-options';

const colors = readChartColors(null);
const points = [
  { ts: '2026-11-13T19:50:15Z', avg: 0.1, max: 0.2 },
  { ts: '2026-11-13T19:50:16Z', avg: 0.3, max: 0.5 },
];

describe('chart-options', () => {
  it('formata pela unidade', () => {
    expect(formatUnit(0.5, 'fraction')).toBe('50,0%');
    expect(formatUnit(1024, 'bytes')).toBe('1,0 KB');
    expect(formatUnit(1500, 'count')).toBe('1.500');
  });

  it('monta séries temporais com linha de referência opcional', () => {
    const options = timeSeriesOptions([{ name: 'CPU', points }, { name: 'Outra', points }], 'fraction', colors, {
      label: 'máximo',
      value: 0.9,
    }) as { series: { data: unknown[]; markLine?: unknown }[]; yAxis: { max: (e: { max: number }) => number; axisLabel: { formatter: (v: number) => string } }; tooltip: { valueFormatter: (v: number) => string } };
    expect(options.series).toHaveLength(2);
    expect(options.series[0].data).toEqual([[points[0].ts, 0.1], [points[1].ts, 0.3]]);
    expect(options.series[0].markLine).toBeDefined();
    expect(options.series[1].markLine).toBeUndefined();
    expect(options.yAxis.max({ max: 0.5 })).toBeCloseTo(0.9);
    expect(options.yAxis.axisLabel.formatter(0.25)).toBe('25,0%');
    expect(options.tooltip.valueFormatter(0.25)).toBe('25,0%');
    const plain = timeSeriesOptions([{ name: 'A', points }], 'count', colors) as { yAxis: { max: unknown } };
    expect(plain.yAxis.max).toBeUndefined();
  });

  it('monta rankings ordenados e destaca o código da aplicação', () => {
    const options = rankingOptions(
      [
        { label: 'b', value: 5, highlight: true },
        { label: 'a', value: 10 },
      ],
      'count',
      colors,
    ) as { yAxis: { data: string[] }; series: { data: { itemStyle: { color: string } }[]; label: { formatter: (p: { value: number }) => string } }[]; tooltip: { valueFormatter: (v: number) => string } };
    expect(options.yAxis.data).toEqual(['b', 'a']);
    expect(options.series[0].data[0].itemStyle.color).toBe(colors.series[0]);
    expect(options.series[0].data[1].itemStyle.color).toBe(colors.muted);
    expect(options.series[0].label.formatter({ value: 3 })).toBe('3');
    expect(options.tooltip.valueFormatter(3)).toBe('3');
  });

  it('gera resumos em texto', () => {
    expect(summarizeSeries([{ name: 'CPU', points }], 'fraction')).toMatch(/^CPU: média 20,0%, pico 50,0% às/);
    expect(summarizeSeries([{ name: 'Vazia', points: [] }], 'count')).toBe('Sem dados na série.');
    expect(summarizeSeries([{ name: 'S', points: [{ avg: 1 }] }], 'count')).toBe('S: média 1, pico 1.');
    expect(summarizeRanking([], 'count')).toBe('Sem itens.');
    expect(summarizeRanking([{ label: 'a', value: 1 }, { label: 'b', value: 3 }], 'count')).toBe('Maiores: b (3); a (1).');
  });

  it('trunca textos longos pelo início', () => {
    expect(truncate('abc', 5)).toBe('abc');
    expect(truncate('abcdefgh', 5)).toBe('…efgh');
  });

  it('lê as cores dos tokens CSS, com padrão quando ausentes', () => {
    const element = document.createElement('div');
    element.style.setProperty('--text', '#123456');
    document.body.appendChild(element);
    expect(readChartColors(element).text).toBe('#123456');
    expect(readChartColors(element).muted).toBe('#4e626b');
    expect(readChartColors().series).toHaveLength(6);
    element.remove();
  });
});
