import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Seletor de quantos itens os rankings mostram. */
@Component({
  selector: 'app-topn-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="topn">
      Itens por ranking
      <select [value]="value()" (change)="changed.emit(toNumber($event))">
        @for (option of options(); track option) {
          <option [value]="option" [selected]="option === value()">{{ option }}</option>
        }
      </select>
    </label>
  `,
  styles: `
    .topn { font-size: 13px; color: var(--text-muted); display: inline-flex; gap: 6px; align-items: center; }
    select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 4px 8px; }
  `,
})
export class TopNSelect {
  readonly value = input.required<number>();
  readonly options = input<number[]>([10, 20, 50]);
  readonly changed = output<number>();

  protected toNumber(event: Event): number {
    return Number((event.target as HTMLSelectElement).value);
  }
}
