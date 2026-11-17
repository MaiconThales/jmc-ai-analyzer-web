import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Priority } from '../../core/api/models';
import { PRIORITY_META } from '../health';

/** Chip de prioridade: ícone + texto + cor (nunca só cor). */
@Component({
  selector: 'app-priority-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [class]="meta().css"><span class="ico" aria-hidden="true">{{ meta().icon }}</span>{{ meta().label }}</span>`,
  styles: `
    .chip { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; padding: 3px 10px;
      border-radius: 999px; letter-spacing: 0.06em; white-space: nowrap; border: 1px solid transparent; }
    .ico { font-size: 9px; }
    .alta { color: var(--prio-alta); background: var(--prio-alta-soft); border-color: color-mix(in srgb, var(--prio-alta) 30%, transparent); }
    .media { color: var(--prio-media); background: var(--prio-media-soft); border-color: color-mix(in srgb, var(--prio-media) 30%, transparent); }
    .baixa { color: var(--prio-baixa); background: var(--prio-baixa-soft); border-color: color-mix(in srgb, var(--prio-baixa) 25%, transparent); }
  `,
})
export class PriorityChip {
  readonly priority = input.required<Priority>();
  protected readonly meta = computed(() => PRIORITY_META[this.priority()]);
}
