import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUS_LABEL } from '../health';
import { Icon, IconName } from './icon';

const ICONS: Record<string, IconName> = {
  PENDING: 'clock',
  PROCESSING: 'loader',
  COMPLETED: 'check-circle',
  PARTIAL: 'alert-triangle',
  FAILED: 'x-circle',
};

/** Estado de lote ou gravação com ícone e texto. */
@Component({
  selector: 'app-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <span class="status" [class]="css()">
      @if (icon(); as name) {
        <app-icon [name]="name" [size]="14" />
      }
      {{ label() }}
    </span>
  `,
  styles: `
    .status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; white-space: nowrap;
      padding: 3px 10px; border-radius: 999px; color: var(--text-muted); background: var(--surface-2); }
    .completed { color: var(--health-ok); background: var(--health-ok-soft); }
    .failed { color: var(--prio-alta); background: var(--prio-alta-soft); }
    .partial, .processing, .pending { color: var(--prio-media); background: var(--prio-media-soft); }
    .processing app-icon { animation: spin 1s linear infinite; }
  `,
})
export class StatusChip {
  readonly status = input<string | null | undefined>();
  protected readonly css = computed(() => (this.status() ?? '').toLowerCase());
  protected readonly label = computed(() => STATUS_LABEL[this.status() ?? ''] ?? this.status() ?? '—');
  protected readonly icon = computed(() => ICONS[this.status() ?? ''] ?? null);
}
