import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ThemeService } from '../../core/theme/theme.service';
import { RankingBarChart } from './ranking-bar-chart';
import { TimeSeriesChart } from './time-series-chart';

function withoutEcharts<T>(type: Type<T>) {
  TestBed.overrideComponent(type, {
    remove: { imports: [NgxEchartsDirective] },
    add: { schemas: [NO_ERRORS_SCHEMA] },
  });
}

describe('componentes de gráfico', () => {
  beforeEach(() => {
    withoutEcharts(TimeSeriesChart);
    withoutEcharts(RankingBarChart);
  });

  it('série temporal mostra resumo e só desenha com dados', () => {
    const fixture = TestBed.createComponent(TimeSeriesChart);
    fixture.componentRef.setInput('series', [{ name: 'CPU', points: [{ ts: '2026-01-01T00:00:00Z', avg: 0.5, max: 0.5 }] }]);
    fixture.componentRef.setInput('unit', 'fraction');
    fixture.componentRef.setInput('markLine', { label: 'x', value: 1 });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CPU: média 50,0%');
    expect(el.querySelector('[echarts]')).not.toBeNull();
    TestBed.inject(ThemeService).choice.set('dark');
    fixture.componentRef.setInput('series', [{ name: 'CPU', points: [] }]);
    fixture.detectChanges();
    expect(el.querySelector('[echarts]')).toBeNull();
  });

  it('ranking ajusta a altura à quantidade de itens', () => {
    const fixture = TestBed.createComponent(RankingBarChart);
    fixture.componentRef.setInput('items', Array.from({ length: 10 }, (_, i) => ({ label: `m${i}`, value: i })));
    fixture.detectChanges();
    const chart = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[echarts]')!;
    expect(chart.style.height).toBe('304px');
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sem itens.');
  });
});
