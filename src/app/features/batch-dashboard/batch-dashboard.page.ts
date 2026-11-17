import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AnalysesApi } from '../../core/api/analyses.api';
import { BatchDashboard } from '../../core/api/models';
import { AppConfigStore } from '../../core/config/app-config.store';
import { Icon } from '../../shared/components/icon';
import { formatCount, formatDuration } from '../../shared/format';
import { ErrorState, LoadingState } from '../../shared/components/states';
import { TopNSelect } from '../../shared/components/topn-select';
import { Remote } from '../../shared/state/remote';
import { ComparisonTable } from '../dashboard/blocks/comparison-table';
import { CoveragePanel } from '../dashboard/blocks/coverage-panel';
import { DashboardSummary, SummaryFact } from '../dashboard/blocks/dashboard-summary';
import { SectionNav } from '../dashboard/blocks/section-nav';
import { DiagnosisList } from '../dashboard/blocks/diagnosis-list';
import { FindingsList } from '../dashboard/blocks/findings-list';
import { MetricsBlocks } from '../dashboard/blocks/metrics-blocks';
import { BATCH_SECTIONS, fromBatch } from '../dashboard/dashboard-model';
import { scrollToFragmentWhenReady } from '../dashboard/anchor-scroll';
import { resolveTopN } from '../dashboard/top-n';

/** Dashboard consolidado do lote (RF-W04). */
@Component({
  selector: 'app-batch-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Icon,
    DashboardSummary,
    SectionNav,
    TopNSelect,
    ErrorState,
    LoadingState,
    DiagnosisList,
    CoveragePanel,
    MetricsBlocks,
    FindingsList,
    ComparisonTable,
  ],
  templateUrl: './batch-dashboard.page.html',
  styleUrl: '../dashboard/dashboard-page.scss',
})
export class BatchDashboardPage {
  private readonly api = inject(AnalysesApi);
  private readonly router = inject(Router);
  protected readonly configStore = inject(AppConfigStore);

  readonly batchId = input.required<string>();
  readonly topN = input<string>();

  protected readonly remote = new Remote<BatchDashboard>();
  protected readonly effectiveTopN = computed(() => resolveTopN(this.topN(), this.configStore.config()));
  protected readonly model = computed(() => {
    const data = this.remote.data();
    return data ? fromBatch(data) : null;
  });
  protected readonly sections = BATCH_SECTIONS;
  protected readonly facts = computed<SummaryFact[]>(() => {
    const data = this.remote.data();
    return [
      { label: 'Gravações', value: formatCount(data?.metadata?.recordingCount), sub: 'concluídas no lote' },
      { label: 'Tempo gravado', value: formatDuration(data?.metadata?.totalDurationMs), sub: 'soma das gravações' },
    ];
  });
  protected readonly totalRecordings = computed(() => this.remote.data()?.includedRecordings?.length ?? 0);

  constructor() {
    effect(() => this.load());
    scrollToFragmentWhenReady(() => this.model() !== null);
  }

  load(): void {
    this.remote.run(this.api.dashboard(this.batchId(), this.effectiveTopN()));
  }

  changeTopN(value: number): void {
    void this.router.navigate([], { queryParams: { topN: value }, queryParamsHandling: 'merge' });
  }
}
