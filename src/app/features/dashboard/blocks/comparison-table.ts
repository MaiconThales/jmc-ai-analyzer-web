import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ComparisonRow } from '../../../core/api/models';
import { HealthBadge } from '../../../shared/components/health-badge';
import { Icon } from '../../../shared/components/icon';
import { DurationPipe, FractionPipe } from '../../../shared/pipes/format.pipes';

/** Comparativo do lote: uma linha por gravação. */
@Component({
  selector: 'app-comparison-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HealthBadge, Icon, DurationPipe, FractionPipe],
  template: `
    <section id="comparison" class="panel" aria-labelledby="comparison-title">
      <header class="block-head">
        <h2 id="comparison-title" class="title-with-icon">
          <span class="icon-tile"><app-icon name="chart" [size]="18" /></span> Comparativo
        </h2>
        <span class="kpis">uma linha por gravação do lote</span>
      </header>
      <div class="table-wrap" tabindex="0" role="region" aria-label="Tabela com rolagem horizontal">
      <table class="data compact">
        <thead>
          <tr>
            <th scope="col">Gravação</th>
            <th scope="col" class="num">Duração</th>
            <th scope="col" class="num">CPU média (JVM)</th>
            <th scope="col" class="num">Pausa máx. de GC</th>
            <th scope="col">Saúde</th>
            <th scope="col" class="num">Itens ALTA</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.recordingId) {
            <tr>
              <td><a [routerLink]="['/recordings', row.recordingId]">{{ row.originalName }}</a></td>
              <td class="num">{{ row.durationMs | duration }}</td>
              <td class="num">{{ row.cpuJvmAvg | fraction }}</td>
              <td class="num">{{ row.gcPauseMaxMs | duration }}</td>
              <td><app-health-badge [score]="row.healthScore" [compact]="true" /></td>
              <td class="num">{{ row.highPriorityItems }}</td>
            </tr>
          }
        </tbody>
      </table>
      </div>
    </section>
  `,
  styleUrl: './blocks.scss',
})
export class ComparisonTable {
  readonly rows = input<ComparisonRow[]>([]);
}
