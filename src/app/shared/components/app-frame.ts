import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { StackFrame } from '../../core/api/models';
import { formatFrame, framePackage } from '../format';
import { CopyButton } from './copy-button';

/** "📍 seu código: Classe.metodo:linha", com o pacote recolhido e botão de copiar. */
@Component({
  selector: 'app-app-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopyButton],
  template: `
    @if (frame(); as f) {
      <span class="where">
        <span aria-hidden="true">📍</span> <em>seu código:</em>
        <code [title]="full()">{{ short() }}</code>
        @if (pkg()) {
          <span class="pkg">{{ pkg() }}</span>
        }
        <app-copy-button [text]="full()" label="Copiar" />
      </span>
    }
  `,
  styles: `
    .where { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px; background: var(--code-bg);
      padding: 4px 10px; border-radius: 8px; font-size: 13px; }
    em { font-style: normal; color: var(--text-muted); }
    code { font-weight: 600; }
    .pkg { color: var(--text-muted); font-family: var(--mono); font-size: 12px; }
  `,
})
export class AppFrame {
  readonly frame = input<StackFrame | null | undefined>();
  protected readonly short = computed(() => formatFrame(this.frame()));
  protected readonly full = computed(() => formatFrame(this.frame(), true));
  protected readonly pkg = computed(() => framePackage(this.frame()));
}
