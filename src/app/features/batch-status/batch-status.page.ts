import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { messageFor } from '../../core/errors/error-messages';
import { Icon } from '../../shared/components/icon';
import { StatusChip } from '../../shared/components/status-chip';
import { ErrorState, LoadingState } from '../../shared/components/states';
import { BytesPipe, DateTimePipe } from '../../shared/pipes/format.pipes';
import { BatchStatusStore } from './batch-status.store';

/** Acompanhamento do processamento de um lote (RF-W02). */
@Component({
  selector: 'app-batch-status-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BatchStatusStore],
  imports: [RouterLink, Icon, StatusChip, ErrorState, LoadingState, BytesPipe, DateTimePipe],
  templateUrl: './batch-status.page.html',
  styles: `
    .err { display: block; color: var(--prio-alta); font-size: 12px; font-weight: 600; margin-top: 2px; }
    .file { display: flex; align-items: center; gap: 8px; }
    .file app-icon { color: var(--text-muted); }
    .file code { overflow-wrap: anywhere; }
    .progress-panel { display: grid; gap: 14px; margin-bottom: 16px; }
    .progress-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
    .progress-head strong { font-family: var(--mono); font-size: 22px; }
    .pct { display: inline-flex; align-items: baseline; gap: 8px; }
    .track { height: 10px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); overflow: hidden; }
    .fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--brand), var(--accent));
      transform-origin: left; transition: width var(--dur-slow) var(--ease); }
    .fill.running { background-size: 200% 100%; animation: shimmer 1.6s linear infinite;
      background-image: linear-gradient(90deg, var(--brand), var(--accent), var(--brand)); }
    .actions { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
    .waiting { display: inline-flex; align-items: center; gap: 8px; margin: 0; }
    .waiting app-icon { animation: spin 1s linear infinite; color: var(--brand); }
  `,
})
export class BatchStatusPage {
  protected readonly store = inject(BatchStatusStore);
  readonly batchId = input.required<string>();

  protected readonly hasCompleted = computed(() =>
    (this.store.batch()?.recordings ?? []).some((r) => r.status === 'COMPLETED'),
  );
  /** Gravações que já terminaram (concluídas ou com falha) sobre o total do lote. */
  protected readonly progress = computed(() => {
    const recordings = this.store.batch()?.recordings ?? [];
    const count = (status: string) => recordings.filter((r) => r.status === status).length;
    const completed = count('COMPLETED');
    const failed = count('FAILED');
    const total = recordings.length;
    return { total, completed, failed, running: total - completed - failed, pct: total ? Math.round(((completed + failed) / total) * 100) : 0 };
  });
  protected readonly finished = computed(() => {
    const status = this.store.batch()?.status;
    return !!status && status !== 'PROCESSING';
  });

  constructor() {
    effect(() => this.store.start(this.batchId()));
  }

  protected errorText(code: string | undefined): string {
    return messageFor(code);
  }
}
