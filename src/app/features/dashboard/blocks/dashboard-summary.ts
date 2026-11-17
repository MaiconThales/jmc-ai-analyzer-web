import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { DiagnosisView } from '../../../core/api/models';
import { RouterLink } from '@angular/router';
import { HealthBadge } from '../../../shared/components/health-badge';
import { healthBand } from '../../../shared/health';
import { countByPriority } from '../dashboard-model';

export interface SummaryFact {
  label: string;
  value: string;
  sub?: string;
}

/** Resumo de relance: nota de saúde, quantos itens por prioridade e fatos da gravação/lote. */
@Component({
  selector: 'app-dashboard-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HealthBadge],
  template: `
    <section class="kpi-grid summary" aria-label="Resumo">
      <div class="kpi health reveal" [class]="band()">
        <span class="kpi-label">Saúde</span>
        <app-health-badge [score]="healthScore()" />
      </div>
      <a class="kpi alta reveal" style="--i: 1" [routerLink]="[]" fragment="diagnosis" queryParamsHandling="preserve">
        <span class="kpi-label">Prioridade alta</span>
        <span class="kpi-value">{{ counts().ALTA }}</span>
        <span class="kpi-sub">{{ counts().ALTA ? 'arrumar primeiro' : 'nada urgente' }}</span>
      </a>
      <div class="kpi media reveal" style="--i: 2">
        <span class="kpi-label">Prioridade média</span>
        <span class="kpi-value">{{ counts().MEDIA }}</span>
        <span class="kpi-sub">planejar</span>
      </div>
      <div class="kpi baixa reveal" style="--i: 3">
        <span class="kpi-label">Prioridade baixa</span>
        <span class="kpi-value">{{ counts().BAIXA }}</span>
        <span class="kpi-sub">quando der</span>
      </div>
      @for (f of facts(); track f.label; let i = $index) {
        <div class="kpi neutral reveal" [style.--i]="i + 4">
          <span class="kpi-label">{{ f.label }}</span>
          <span class="kpi-value small">{{ f.value }}</span>
          @if (f.sub) {
            <span class="kpi-sub">{{ f.sub }}</span>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host { display: block; margin-bottom: 16px; }
    .summary { grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); }
    a.kpi { color: inherit; text-decoration: none; }
    .health::before { display: none; }
    .health { gap: 6px; grid-column: span 2; }
    .kpi-value.small { font-size: 18px; color: var(--text); }
    .kpi-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (max-width: 639px) {
      .summary { grid-template-columns: 1fr 1fr; gap: 8px; }
      .health { grid-column: 1 / -1; }
    }
  `,
})
export class DashboardSummary {
  readonly healthScore = input<number | null | undefined>();
  readonly diagnosis = input<DiagnosisView[]>([]);
  readonly facts = input<SummaryFact[]>([]);
  protected readonly counts = computed(() => countByPriority(this.diagnosis()));
  protected readonly band = computed(() => {
    const score = this.healthScore();
    return score === null || score === undefined ? 'neutral' : healthBand(score);
  });
}
