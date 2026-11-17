import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StackFrame } from '../../core/api/models';
import { FramePipe } from '../pipes/format.pipes';

/** Pilha recolhível (até 5 frames), destacando o frame da aplicação. */
@Component({
  selector: 'app-stack-trace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FramePipe],
  template: `
    @if (frames().length) {
      <details>
        <summary>pilha ({{ frames().length }})</summary>
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
    summary { cursor: pointer; color: var(--brand); font-size: 13px; font-weight: 600; }
    ol { margin: 6px 0 0; padding-left: 20px; }
    li { font-size: 12px; color: var(--text-muted); }
    li.app { color: var(--text); font-weight: 600; }
    .tag { margin-left: 6px; font-size: 11px; color: var(--brand); }
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
