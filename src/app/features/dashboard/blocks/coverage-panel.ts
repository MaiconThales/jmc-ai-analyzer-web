import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CoverageItemView, CoverageView } from '../../../core/api/models';
import { CopyButton } from '../../../shared/components/copy-button';
import { COVERAGE_META } from '../../../shared/health';

/** Cobertura da gravação: o que não dá para diagnosticar e como gravar melhor. */
@Component({
  selector: 'app-coverage-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopyButton],
  template: `
    <section id="coverage" class="panel" aria-labelledby="coverage-title">
      <h2 id="coverage-title">Cobertura da gravação</h2>
      @if (problems().length) {
        <ul class="cov">
          @for (item of problems(); track item.domain) {
            <li [class]="meta(item).css">
              <span class="icon" aria-hidden="true">{{ meta(item).icon }}</span>
              <span><strong>{{ item.domain }}</strong>&nbsp;<span class="state">({{ meta(item).label }})</span> — {{ item.reason }}
                @if (item.recommendation) {
                  <br /><span class="muted">→ {{ item.recommendation }}</span>
                }
              </span>
            </li>
          }
        </ul>
      } @else {
        <p class="muted">A gravação tem dados para todos os domínios.</p>
      }
      <p class="muted ok-list">Com dados: {{ okDomains() || 'nenhum' }}</p>
      @if (coverage()?.suggestedCommand; as cmd) {
        <div class="cmd">
          <code>{{ cmd }}</code>
          <app-copy-button [text]="cmd" label="Copiar comando" />
        </div>
      }
    </section>
  `,
  styleUrl: './blocks.scss',
})
export class CoveragePanel {
  readonly coverage = input<CoverageView | undefined>();
  protected readonly problems = computed(() => (this.coverage()?.items ?? []).filter((i) => i.status !== 'OK'));
  protected readonly okDomains = computed(() =>
    (this.coverage()?.items ?? [])
      .filter((i) => i.status === 'OK')
      .map((i) => i.domain)
      .join(', '),
  );

  protected meta(item: CoverageItemView) {
    return COVERAGE_META[item.status ?? 'AUSENTE'];
  }
}
