import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Icon } from './icon';

/** Botão que copia um texto e confirma por 2 s. */
@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <button type="button" class="copy" [class.done]="copied()" (click)="copy()" [attr.aria-label]="label() + ': ' + text()">
      <app-icon [name]="copied() ? 'check' : 'copy'" [size]="14" />
      <span>{{ copied() ? 'Copiado' : label() }}</span>
    </button>
  `,
  styles: `
    .copy { display: inline-flex; align-items: center; gap: 6px; font: inherit; font-size: 12px; font-weight: 600;
      color: var(--brand); background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 4px 10px; cursor: pointer; white-space: nowrap;
      transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
    .copy:hover { background: var(--brand-soft); }
    .done { color: var(--health-ok); border-color: var(--health-ok); }
    .done app-icon { animation: scale-in var(--dur) var(--ease) backwards; }
  `,
})
export class CopyButton {
  private readonly clipboard = inject(Clipboard);
  readonly text = input.required<string>();
  readonly label = input('Copiar');
  protected readonly copied = signal(false);

  copy(): void {
    this.copied.set(this.clipboard.copy(this.text()));
    setTimeout(() => this.copied.set(false), 2000);
  }
}
