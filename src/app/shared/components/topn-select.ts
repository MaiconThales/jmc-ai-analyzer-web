import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Seletor de quantos itens os rankings mostram. */
@Component({
  selector: 'app-topn-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="field-label">
      Itens por ranking
      <select class="control" [value]="value()" (change)="changed.emit(toNumber($event))">
        @for (option of options(); track option) {
          <option [value]="option" [selected]="option === value()">{{ option }}</option>
        }
      </select>
    </label>
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
