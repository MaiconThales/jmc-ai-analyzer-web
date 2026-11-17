import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ThemeService } from '../../core/theme/theme.service';
import { ChartUnit, RankingItem, rankingOptions, summarizeRanking } from './chart-options';
import { readChartColors } from './chart-theme';

/** Barras horizontais com resumo em texto; itens do código da aplicação ficam na cor da marca. */
@Component({
  selector: 'app-ranking-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <p class="summary">{{ summary() }}</p>
    @if (items().length) {
      <div echarts class="chart" [style.height.px]="height()" [options]="options()" [attr.aria-label]="ariaLabel()"
        role="img"></div>
    }
  `,
  styles: `
    .chart { width: 100%; }
    .summary { color: var(--text-muted); font-size: 13px; margin: 0 0 8px; }
  `,
})
export class RankingBarChart {
  private readonly theme = inject(ThemeService);
  readonly items = input<RankingItem[]>([]);
  readonly unit = input<ChartUnit>('count');
  readonly ariaLabel = input('Gráfico de barras');

  protected readonly height = computed(() => Math.max(120, this.items().length * 28 + 24));
  protected readonly summary = computed(() => summarizeRanking(this.items(), this.unit()));
  protected readonly options = computed(() => {
    this.theme.dark();
    return rankingOptions(this.items(), this.unit(), readChartColors());
  });
}
