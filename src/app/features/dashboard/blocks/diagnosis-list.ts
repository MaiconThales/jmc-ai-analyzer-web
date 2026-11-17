import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DiagnosisView } from '../../../core/api/models';
import { AppFrame } from '../../../shared/components/app-frame';
import { EmptyState } from '../../../shared/components/states';
import { PriorityChip } from '../../../shared/components/priority-chip';
import { StackTrace } from '../../../shared/components/stack-trace';
import { CATEGORY_LABEL } from '../../../shared/health';
import { countByPriority } from '../dashboard-model';

/** "O que arrumar": cartões priorizados com evidência, local no código e ação. */
@Component({
  selector: 'app-diagnosis-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PriorityChip, AppFrame, StackTrace, EmptyState],
  template: `
    <section id="diagnosis" aria-labelledby="diagnosis-title">
      <header class="head">
        <h2 id="diagnosis-title">O que arrumar ({{ items().length }})</h2>
        <span class="muted">ALTA {{ counts().ALTA }} · MÉDIA {{ counts().MEDIA }} · BAIXA {{ counts().BAIXA }}</span>
      </header>
      @for (item of items(); track $index) {
        <article class="card" [class]="(item.priority ?? 'BAIXA').toLowerCase()">
          <div class="meta">
            <app-priority-chip [priority]="item.priority ?? 'BAIXA'" />
            <span class="cat">{{ category(item.category) }}</span>
            @if (totalRecordings() && item.recordingIds?.length) {
              <span class="spread">em {{ item.recordingIds?.length }} de {{ totalRecordings() }} gravações</span>
            }
          </div>
          <h3>{{ item.title }}</h3>
          @if (item.evidence) {
            <p class="evidence">{{ item.evidence }}</p>
          }
          @if (item.location; as loc) {
            <div class="loc">
              @if (loc.appFrame) {
                <app-app-frame [frame]="loc.appFrame" />
              }
              @if (loc.thread) {
                <span class="tag">thread <code>{{ loc.thread }}</code></span>
              }
              @if (loc.target) {
                <span class="tag">alvo <code>{{ loc.target }}</code></span>
              }
              <app-stack-trace [frames]="loc.stackFrames ?? []" [appFrame]="loc.appFrame" />
            </div>
          }
          @if (item.action) {
            <p class="action"><span aria-hidden="true">➜</span> {{ item.action }}</p>
          }
          <div class="links">
            @if (item.domainRef) {
              <a [routerLink]="[]" [fragment]="item.domainRef" queryParamsHandling="preserve">ver dados ↓</a>
            }
            @for (id of item.recordingIds ?? []; track id) {
              <a [routerLink]="['/recordings', id]">{{ names()[id] ?? 'gravação' }}</a>
            }
          </div>
        </article>
      } @empty {
        <app-empty-state title="Nenhum problema encontrado" message="Nenhuma regra apontou algo a arrumar nesta análise." />
      }
    </section>
  `,
  styleUrl: './blocks.scss',
})
export class DiagnosisList {
  readonly items = input<DiagnosisView[]>([]);
  readonly names = input<Record<string, string>>({});
  /** Total de gravações do lote (0 no dashboard da gravação). */
  readonly totalRecordings = input(0);
  protected readonly counts = computed(() => countByPriority(this.items()));

  protected category(value: string | undefined): string {
    return value ? (CATEGORY_LABEL[value] ?? value) : '';
  }
}
