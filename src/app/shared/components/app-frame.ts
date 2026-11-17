import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { StackFrame } from '../../core/api/models';
import { formatFrame, framePackage } from '../format';
import { CopyButton } from './copy-button';
import { Icon } from './icon';

/** "seu código: Classe.metodo:linha", destacado, com o pacote recolhido e botão de copiar. */
@Component({
  selector: 'app-app-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopyButton, Icon],
  template: `
    @if (frame(); as f) {
      <span class="where">
        <app-icon name="map-pin" [size]="14" />
        <em>seu código:</em>
        <code [title]="full()">{{ short() }}</code>
        @if (pkg()) {
          <span class="pkg">{{ pkg() }}</span>
        }
        <app-copy-button [text]="full()" label="Copiar" />
      </span>
    }
  `,
  styles: `
    :host { display: inline-block; max-width: 100%; }
    .where { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; padding: 6px 10px; border-radius: 8px;
      font-size: 13px; background: var(--brand-soft); border: 1px solid color-mix(in srgb, var(--brand) 25%, transparent); }
    app-icon { color: var(--brand); }
    em { font-style: normal; color: var(--text-muted); }
    code { font-weight: 700; color: var(--text); overflow-wrap: anywhere; }
    .pkg { color: var(--text-muted); font-family: var(--mono); font-size: 12px; overflow-wrap: anywhere; }
  `,
})
export class AppFrame {
  readonly frame = input<StackFrame | null | undefined>();
  protected readonly short = computed(() => formatFrame(this.frame()));
  protected readonly full = computed(() => formatFrame(this.frame(), true));
  protected readonly pkg = computed(() => framePackage(this.frame()));
}
