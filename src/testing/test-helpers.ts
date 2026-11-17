import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxEchartsDirective } from 'ngx-echarts';
import { RankingBarChart } from '../app/shared/charts/ranking-bar-chart';
import { TimeSeriesChart } from '../app/shared/charts/time-series-chart';

/** Remove o ECharts (canvas) dos componentes de gráfico: o jsdom não desenha. */
export function stubCharts(): void {
  for (const chart of [TimeSeriesChart, RankingBarChart] as Type<unknown>[]) {
    TestBed.overrideComponent(chart, { remove: { imports: [NgxEchartsDirective] }, add: { schemas: [NO_ERRORS_SCHEMA] } });
  }
}

export function text(element: Element | null): string {
  return (element?.textContent ?? '').replace(/\s+/g, ' ').trim();
}
