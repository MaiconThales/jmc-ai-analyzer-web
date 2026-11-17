import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppFrame } from '../../../shared/components/app-frame';
import { Icon } from '../../../shared/components/icon';
import { StackTrace } from '../../../shared/components/stack-trace';
import { RankingItem } from '../../../shared/charts/chart-options';
import { RankingBarChart } from '../../../shared/charts/ranking-bar-chart';
import { TimeSeriesChart } from '../../../shared/charts/time-series-chart';
import { simpleClassName } from '../../../shared/format';
import {
  BytesPipe,
  CountPipe,
  DateTimePipe,
  DurationPipe,
  FractionPipe,
  PercentPipe,
} from '../../../shared/pipes/format.pipes';
import { DashboardModel } from '../dashboard-model';

const IO_LABEL: Record<string, string> = {
  FILE_READ: 'Leitura de arquivo',
  FILE_WRITE: 'Escrita de arquivo',
  SOCKET_READ: 'Leitura de rede',
  SOCKET_WRITE: 'Escrita de rede',
};

const LOCK_LABEL: Record<string, string> = {
  MONITOR_ENTER: 'Espera por synchronized',
  MONITOR_WAIT: 'wait()',
  THREAD_PARK: 'Thread estacionada',
};

/** Blocos de métricas por domínio, cada um com âncora igual ao domainRef do diagnóstico. */
@Component({
  selector: 'app-metrics-blocks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgTemplateOutlet,
    TimeSeriesChart,
    RankingBarChart,
    AppFrame,
    Icon,
    StackTrace,
    BytesPipe,
    CountPipe,
    DateTimePipe,
    DurationPipe,
    FractionPipe,
    PercentPipe,
  ],
  templateUrl: './metrics-blocks.html',
  styleUrl: './blocks.scss',
})
export class MetricsBlocks {
  readonly model = input.required<DashboardModel>();
  protected readonly ioLabel = IO_LABEL;
  protected readonly lockLabel = LOCK_LABEL;
  protected readonly simpleClassName = simpleClassName;

  protected readonly heapMarkLine = computed(() => {
    const max = this.model().heap.maxBytes;
    return max ? { label: 'heap máximo', value: max } : undefined;
  });

  protected readonly hotItems = computed<RankingItem[]>(() =>
    (this.model().hotMethods?.top ?? []).map((m) => ({ label: m.method ?? '', value: m.samples ?? 0, highlight: !!m.appFrame })),
  );

  protected readonly allocationItems = computed<RankingItem[]>(() =>
    (this.model().allocation?.top ?? []).map((a) => ({
      label: a.className ?? '',
      value: a.weightBytes ?? 0,
      highlight: !!a.appFrame,
    })),
  );

  protected readonly exceptionItems = computed<RankingItem[]>(() =>
    (this.model().exceptions?.top ?? []).map((e) => ({ label: e.className ?? '', value: e.count ?? 0, highlight: !!e.appFrame })),
  );

  protected readonly threadCpuItems = computed<RankingItem[]>(() =>
    (this.model().threadCpu?.top ?? []).map((t) => ({ label: t.threadName ?? '', value: t.cpuAvg ?? 0 })),
  );

  protected readonly ioTotals = computed(() =>
    Object.entries(this.model().io?.totals ?? {}).map(([type, total]) => ({ type, ...total })),
  );
}
