import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ThemeService } from '../../core/theme/theme.service';
import { ChartSeries, ChartUnit, summarizeSeries, timeSeriesOptions } from './chart-options';
import { readChartColors } from './chart-theme';

/** Série temporal com resumo em texto. */
@Component({
  selector: 'app-time-series-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <p class="summary">{{ summary() }}</p>
    @if (hasData()) {
      <div echarts class="chart" [options]="options()" [attr.aria-label]="ariaLabel()" role="img"></div>
    }
  `,
  styles: `
    .chart { height: 260px; width: 100%; }
    .summary { color: var(--text-muted); font-size: 13px; margin: 0 0 8px; }
  `,
})
export class TimeSeriesChart {
  private readonly theme = inject(ThemeService);
  readonly series = input<ChartSeries[]>([]);
  readonly unit = input<ChartUnit>('count');
  readonly ariaLabel = input('Gráfico de série temporal');
  readonly markLine = input<{ label: string; value: number } | undefined>();

  protected readonly hasData = computed(() => this.series().some((s) => s.points.length > 0));
  protected readonly summary = computed(() => summarizeSeries(this.series(), this.unit()));
  protected readonly options = computed(() => {
    this.theme.dark();
    return timeSeriesOptions(this.series(), this.unit(), readChartColors(), this.markLine());
  });
}
