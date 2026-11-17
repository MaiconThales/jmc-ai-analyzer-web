import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CoverageItemView, CoverageView } from '../../../core/api/models';
import { CopyButton } from '../../../shared/components/copy-button';
import { Icon } from '../../../shared/components/icon';
import { COVERAGE_META } from '../../../shared/health';

/** Cobertura da gravação: o que não dá para diagnosticar e como gravar melhor. */
@Component({
  selector: 'app-coverage-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CopyButton, Icon],
  template: `
    <section id="coverage" class="panel" aria-labelledby="coverage-title">
      <header class="block-head">
        <h2 id="coverage-title" class="title-with-icon">
          <span class="icon-tile"><app-icon name="shield" [size]="18" /></span> Cobertura da gravação
        </h2>
        <span class="kpis">{{ okCount() }} de {{ total() }} domínios com dados</span>
      </header>
      @if (problems().length) {
        <ul class="cov">
          @for (item of problems(); track item.domain) {
            <li [class]="meta(item).css">
              <span class="icon" aria-hidden="true">{{ meta(item).icon }}</span>
              <span><strong>{{ item.domain }}</strong>&nbsp;<span class="state">({{ meta(item).label }})</span> — {{ item.reason }}
                @if (item.recommendation) {
                  <span class="muted rec">→ {{ item.recommendation }}</span>
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
  protected readonly total = computed(() => (this.coverage()?.items ?? []).length);
  protected readonly okCount = computed(() => this.total() - this.problems().length);
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
