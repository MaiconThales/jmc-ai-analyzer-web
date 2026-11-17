import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FindingView } from '../../../core/api/models';
import { Icon } from '../../../shared/components/icon';

const SEVERITY_LABEL: Record<string, string> = { WARNING: 'Aviso', INFO: 'Informação', OK: 'OK' };

/** Achados originais do JMC (texto em inglês, HTML sanitizado pelo Angular). */
@Component({
  selector: 'app-findings-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <section id="findings" class="panel" aria-labelledby="findings-title">
      <details class="collapsible">
        <summary>
          <h2 id="findings-title" class="title-with-icon">
            <span class="icon-tile"><app-icon name="list" [size]="18" /></span> Achados do JMC ({{ findings().length }})
          </h2>
          <app-icon class="chev" name="chevron-down" [size]="20" />
        </summary>
        <p class="muted">Texto original das regras do Java Mission Control.</p>
        <ul class="findings">
          @for (f of findings(); track f.ruleId) {
            <li>
              <details>
                <summary>
                  <span class="sev" [class]="(f.severity ?? '').toLowerCase()">{{ severity(f.severity) }}</span>
                  <strong>{{ f.name }}</strong>
                  @if (f.score !== null && f.score !== undefined) {
                    <span class="muted">score {{ f.score.toFixed(0) }}</span>
                  }
                  @if (f.recordingIds?.length) {
                    <span class="muted">· {{ f.recordingIds?.length }} gravação(ões)</span>
                  }
                </summary>
                @if (f.summary) {
                  <div class="html" [innerHTML]="f.summary"></div>
                }
                @if (f.explanation) {
                  <div class="html muted" [innerHTML]="f.explanation"></div>
                }
                @if (f.solution) {
                  <div class="html"><strong>Solução:</strong> <span [innerHTML]="f.solution"></span></div>
                }
              </details>
            </li>
          }
        </ul>
      </details>
    </section>
  `,
  styleUrl: './blocks.scss',
})
export class FindingsList {
  readonly findings = input<FindingView[]>([]);

  protected severity(value: string | undefined): string {
    return SEVERITY_LABEL[value ?? ''] ?? value ?? '';
  }
}
