import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';

/** Botão que copia um texto e confirma por 2 s. */
@Component({
  selector: 'app-copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="copy" (click)="copy()" [attr.aria-label]="label() + ': ' + text()">
      {{ copied() ? 'Copiado ✓' : label() }}
    </button>
  `,
  styles: `
    .copy { font: inherit; font-size: 12px; font-weight: 600; color: var(--brand); background: transparent;
      border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; cursor: pointer; white-space: nowrap; }
    .copy:hover { background: var(--brand-soft); }
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
