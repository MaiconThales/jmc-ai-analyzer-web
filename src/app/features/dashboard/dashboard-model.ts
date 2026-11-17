import type {
  AllocationView,
  BatchDashboard,
  BatchSeries,
  CoverageView,
  DiagnosisView,
  ExceptionsView,
  FindingView,
  GcView,
  HotMethodsView,
  IoView,
  LeaksView,
  LocksView,
  MetricSeries,
  MetricType,
  Point,
  Priority,
  RecordingDashboard,
  ThreadCpuView,
} from '../../core/api/models';
import type { ChartSeries } from '../../shared/charts/chart-options';

/** Visão única usada pelos dois dashboards (gravação e lote). */
export interface DashboardModel {
  healthScore?: number;
  diagnosis: DiagnosisView[];
  coverage?: CoverageView;
  cpu: { available: boolean; jvmAvg?: number; jvmMax?: number; machineAvg?: number; machineMax?: number; series: ChartSeries[] };
  heap: {
    available: boolean;
    initialBytes?: number;
    maxBytes?: number;
    usedPeakBytes?: number;
    youngCollector?: string;
    oldCollector?: string;
    series: ChartSeries[];
  };
  threads: { available: boolean; peak?: number; daemonPeak?: number; started?: number; ended?: number; series: ChartSeries[] };
  gc?: GcView;
  locks?: LocksView;
  hotMethods?: HotMethodsView;
  allocation?: AllocationView;
  exceptions?: ExceptionsView;
  io?: IoView;
  leakSuspects?: LeaksView;
  threadCpu?: ThreadCpuView;
  findings: FindingView[];
  /** Nome do arquivo por recordingId (lote), para legendas e "em N de M". */
  recordingNames: Record<string, string>;
}

export const METRIC_LABEL: Record<MetricType, string> = {
  CPU_JVM_USER: 'JVM (usuário)',
  CPU_JVM_SYSTEM: 'JVM (sistema)',
  CPU_MACHINE: 'Máquina',
  HEAP_USED: 'Usado',
  HEAP_COMMITTED: 'Comprometido',
  THREADS_ACTIVE: 'Ativas',
  THREADS_DAEMON: 'Daemon',
};

export function fromRecording(d: RecordingDashboard): DashboardModel {
  return {
    healthScore: d.healthScore,
    diagnosis: d.diagnosis ?? [],
    coverage: d.coverage,
    cpu: { ...d.cpu, available: !!d.cpu?.available, series: metricSeries(d.cpu?.series, ['CPU_JVM_USER', 'CPU_JVM_SYSTEM', 'CPU_MACHINE']) },
    heap: { ...d.heap, available: !!d.heap?.available, series: metricSeries(d.heap?.series, ['HEAP_USED', 'HEAP_COMMITTED']) },
    threads: {
      ...d.threads,
      available: !!d.threads?.available,
      series: metricSeries(d.threads?.series, ['THREADS_ACTIVE', 'THREADS_DAEMON']),
    },
    gc: d.gc,
    locks: d.locks,
    hotMethods: d.hotMethods,
    allocation: d.allocation,
    exceptions: d.exceptions,
    io: d.io,
    leakSuspects: d.leakSuspects,
    threadCpu: d.threadCpu,
    findings: d.findings ?? [],
    recordingNames: {},
  };
}

export function fromBatch(d: BatchDashboard): DashboardModel {
  const names: Record<string, string> = {};
  (d.includedRecordings ?? []).forEach((r) => {
    if (r.id) {
      names[r.id] = r.originalName ?? r.id;
    }
  });
  return {
    healthScore: d.healthScore,
    diagnosis: d.diagnosis ?? [],
    coverage: d.coverage,
    cpu: { ...d.cpu, available: !!d.cpu?.available, series: perRecording(d.cpu?.series, ['CPU_JVM_USER', 'CPU_JVM_SYSTEM'], names) },
    heap: { ...d.heap, available: !!d.heap?.available, series: perRecording(d.heap?.series, ['HEAP_USED'], names) },
    threads: { ...d.threads, available: !!d.threads?.available, series: perRecording(d.threads?.series, ['THREADS_ACTIVE'], names) },
    gc: d.gc,
    locks: d.locks,
    hotMethods: d.hotMethods,
    allocation: d.allocation,
    exceptions: d.exceptions,
    io: d.io,
    leakSuspects: d.leakSuspects,
    threadCpu: d.threadCpu,
    findings: d.findings ?? [],
    recordingNames: names,
  };
}

/** Uma série por métrica (dashboard da gravação). */
export function metricSeries(series: MetricSeries | undefined, metrics: MetricType[]): ChartSeries[] {
  return metrics.map((m) => ({ name: METRIC_LABEL[m], points: series?.[m] ?? [] })).filter((s) => s.points.length);
}

/**
 * Uma série por gravação (dashboard do lote). Com mais de uma métrica, os valores são somados ponto a ponto
 * (ex.: CPU da JVM = usuário + sistema).
 */
export function perRecording(series: BatchSeries | undefined, metrics: MetricType[], names: Record<string, string>): ChartSeries[] {
  return Object.entries(series ?? {})
    .map(([recordingId, byMetric]) => ({ name: names[recordingId] ?? recordingId, points: sumPoints(metrics.map((m) => byMetric[m] ?? [])) }))
    .filter((s) => s.points.length);
}

export function sumPoints(lists: Point[][]): Point[] {
  const [first, ...rest] = lists.filter((l) => l.length);
  if (!first) {
    return [];
  }
  return first.map((p, i) => ({
    ts: p.ts,
    avg: rest.reduce((sum, l) => sum + (l[i]?.avg ?? 0), p.avg ?? 0),
    max: rest.reduce((sum, l) => sum + (l[i]?.max ?? 0), p.max ?? 0),
  }));
}

/** Contagem do diagnóstico por prioridade. */
export function countByPriority(items: DiagnosisView[]): Record<Priority, number> {
  const counts: Record<Priority, number> = { ALTA: 0, MEDIA: 0, BAIXA: 0 };
  items.forEach((item) => {
    if (item.priority) {
      counts[item.priority]++;
    }
  });
  return counts;
}
