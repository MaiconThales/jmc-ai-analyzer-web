import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUS_LABEL } from '../health';

const ICONS: Record<string, string> = { PENDING: '…', PROCESSING: '⟳', COMPLETED: '✓', PARTIAL: '◐', FAILED: '✗' };

/** Estado de lote ou gravação com ícone e texto. */
@Component({
  selector: 'app-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="status" [class]="css()">{{ icon() }} {{ label() }}</span>`,
  styles: `
    .status { font-weight: 600; white-space: nowrap; }
    .completed { color: var(--health-ok); }
    .failed { color: var(--prio-alta); }
    .partial, .processing, .pending { color: var(--prio-media); }
  `,
})
export class StatusChip {
  readonly status = input<string | null | undefined>();
  protected readonly css = computed(() => (this.status() ?? '').toLowerCase());
  protected readonly label = computed(() => STATUS_LABEL[this.status() ?? ''] ?? this.status() ?? '—');
  protected readonly icon = computed(() => ICONS[this.status() ?? ''] ?? '');
}
