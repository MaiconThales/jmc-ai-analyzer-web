import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { messageFor } from '../../core/errors/error-messages';
import { StatusChip } from '../../shared/components/status-chip';
import { ErrorState, LoadingState } from '../../shared/components/states';
import { BytesPipe, DateTimePipe } from '../../shared/pipes/format.pipes';
import { BatchStatusStore } from './batch-status.store';

/** Acompanhamento do processamento de um lote (RF-W02). */
@Component({
  selector: 'app-batch-status-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BatchStatusStore],
  imports: [RouterLink, MatButtonModule, StatusChip, ErrorState, LoadingState, BytesPipe, DateTimePipe],
  templateUrl: './batch-status.page.html',
  styles: `
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .err { color: var(--prio-alta); font-size: 13px; }
    .actions { margin-top: 16px; }
    .crumb { margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; }
  `,
})
export class BatchStatusPage {
  protected readonly store = inject(BatchStatusStore);
  readonly batchId = input.required<string>();

  protected readonly hasCompleted = computed(() =>
    (this.store.batch()?.recordings ?? []).some((r) => r.status === 'COMPLETED'),
  );
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
