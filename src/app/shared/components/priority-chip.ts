import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Priority } from '../../core/api/models';
import { PRIORITY_META } from '../health';

/** Chip de prioridade: ícone + texto + cor (nunca só cor). */
@Component({
  selector: 'app-priority-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [class]="meta().css">{{ meta().icon }} {{ meta().label }}</span>`,
  styles: `
    .chip { font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.04em;
      white-space: nowrap; }
    .alta { color: var(--prio-alta); background: var(--prio-alta-soft); }
    .media { color: var(--prio-media); background: var(--prio-media-soft); }
    .baixa { color: var(--prio-baixa); background: var(--prio-baixa-soft); }
  `,
})
export class PriorityChip {
  readonly priority = input.required<Priority>();
  protected readonly meta = computed(() => PRIORITY_META[this.priority()]);
}
