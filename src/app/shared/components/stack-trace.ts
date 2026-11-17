import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StackFrame } from '../../core/api/models';
import { FramePipe } from '../pipes/format.pipes';
import { Icon } from './icon';

/** Pilha recolhível (até 5 frames): frames do JDK/bibliotecas atenuados, frame da aplicação destacado. */
@Component({
  selector: 'app-stack-trace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FramePipe, Icon],
  template: `
    @if (frames().length) {
      <details>
        <summary><app-icon name="chevron-down" [size]="14" />pilha ({{ frames().length }})</summary>
        <ol>
          @for (f of frames(); track $index) {
            <li [class.app]="isApp(f)">
              <code>{{ f | frame: true }}</code>
              @if (isApp(f)) {
                <span class="tag">seu código</span>
              }
            </li>
          }
        </ol>
      </details>
    }
  `,
  styles: `
    :host { display: block; }
    summary { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: var(--brand); font-size: 12px;
      font-weight: 600; list-style: none; border-radius: 6px; padding: 2px 4px; margin-left: -4px; }
    summary::-webkit-details-marker { display: none; }
    summary:hover { background: var(--brand-soft); }
    summary app-icon { transform: rotate(-90deg); transition: transform var(--dur-fast) var(--ease); }
    details[open] summary app-icon { transform: none; }
    ol { list-style: none; margin: 6px 0 0; padding: 8px; display: grid; gap: 2px; background: var(--code-bg);
      border: 1px solid var(--border); border-radius: 8px; animation: fade-in var(--dur) var(--ease) backwards; }
    li { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 3px 8px; border-radius: 6px;
      font-size: 12px; color: var(--text-muted); opacity: 0.85; }
    li code { font-size: 12px; overflow-wrap: anywhere; }
    li.app { color: var(--text); opacity: 1; font-weight: 600; background: var(--brand-soft);
      border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent); }
    .tag { flex: none; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--surface);
      background: var(--brand); border-radius: 4px; padding: 1px 6px; }
  `,
})
export class StackTrace {
  readonly frames = input<StackFrame[]>([]);
  readonly appFrame = input<StackFrame | null | undefined>();

  isApp(frame: StackFrame): boolean {
    const app = this.appFrame();
    return !!app && app.c === frame.c && app.m === frame.m && app.l === frame.l;
  }
}
