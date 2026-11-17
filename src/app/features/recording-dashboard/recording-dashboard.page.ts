import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RecordingsApi } from '../../core/api/recordings.api';
import { RecordingDashboard } from '../../core/api/models';
import { AppConfigStore } from '../../core/config/app-config.store';
import { describeError, messageFor } from '../../core/errors/error-messages';
import { Icon } from '../../shared/components/icon';
import { formatCount, formatDuration } from '../../shared/format';
import { ErrorState, LoadingState } from '../../shared/components/states';
import { TopNSelect } from '../../shared/components/topn-select';
import { BytesPipe, DurationPipe } from '../../shared/pipes/format.pipes';
import { Remote } from '../../shared/state/remote';
import { CoveragePanel } from '../dashboard/blocks/coverage-panel';
import { DashboardSummary, SummaryFact } from '../dashboard/blocks/dashboard-summary';
import { SectionNav } from '../dashboard/blocks/section-nav';
import { DiagnosisList } from '../dashboard/blocks/diagnosis-list';
import { FindingsList } from '../dashboard/blocks/findings-list';
import { MetricsBlocks } from '../dashboard/blocks/metrics-blocks';
import { RECORDING_SECTIONS, fromRecording } from '../dashboard/dashboard-model';
import { scrollToFragmentWhenReady } from '../dashboard/anchor-scroll';
import { resolveTopN } from '../dashboard/top-n';

/** Dashboard de uma gravação (RF-W03). */
@Component({
  selector: 'app-recording-dashboard-page',
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
    BytesPipe,
    DurationPipe,
  ],
  templateUrl: './recording-dashboard.page.html',
  styleUrl: '../dashboard/dashboard-page.scss',
})
export class RecordingDashboardPage {
  private readonly api = inject(RecordingsApi);
  private readonly router = inject(Router);
  protected readonly configStore = inject(AppConfigStore);

  readonly recordingId = input.required<string>();
  readonly topN = input<string>();

  protected readonly remote = new Remote<RecordingDashboard>();
  protected readonly effectiveTopN = computed(() => resolveTopN(this.topN(), this.configStore.config()));
  protected readonly model = computed(() => {
    const data = this.remote.data();
    return data ? fromRecording(data) : null;
  });
  protected readonly sections = RECORDING_SECTIONS;
  protected readonly facts = computed<SummaryFact[]>(() => {
    const meta = this.remote.data()?.metadata;
    return [
      { label: 'Duração', value: formatDuration(meta?.durationMs), sub: 'de gravação' },
      { label: 'Eventos', value: formatCount(meta?.eventCount), sub: 'lidos da gravação' },
    ];
  });
  protected readonly notReady = computed(() => this.remote.error()?.code === 'NOT_READY');
  protected readonly notReadyText = computed(() => {
    const error = this.remote.error();
    const code = error?.properties['errorCode'];
    return typeof code === 'string' ? messageFor(code) : messageFor('NOT_READY');
  });
  protected readonly errorText = computed(() => {
    const error = this.remote.error();
    return error ? describeError(error) : '';
  });

  constructor() {
    effect(() => this.load());
    scrollToFragmentWhenReady(() => this.model() !== null);
  }

  load(): void {
    this.remote.run(this.api.dashboard(this.recordingId(), this.effectiveTopN()));
  }

  changeTopN(value: number): void {
    void this.router.navigate([], { queryParams: { topN: value }, queryParamsHandling: 'merge' });
  }
}
