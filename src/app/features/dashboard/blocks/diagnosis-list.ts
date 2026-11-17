import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DiagnosisView, Priority } from '../../../core/api/models';
import { AppFrame } from '../../../shared/components/app-frame';
import { Icon } from '../../../shared/components/icon';
import { EmptyState } from '../../../shared/components/states';
import { PriorityChip } from '../../../shared/components/priority-chip';
import { StackTrace } from '../../../shared/components/stack-trace';
import { CATEGORY_LABEL, PRIORITY_META } from '../../../shared/health';
import { countByPriority } from '../dashboard-model';

type Filter = Priority | 'ALL';

/** "O que arrumar": cartões priorizados com evidência, local no código e ação; filtro por prioridade. */
@Component({
  selector: 'app-diagnosis-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PriorityChip, AppFrame, StackTrace, EmptyState, Icon],
  template: `
    <section id="diagnosis" aria-labelledby="diagnosis-title">
      <header class="head">
        <h2 id="diagnosis-title" class="title-with-icon">
          <span class="icon-tile"><app-icon name="wrench" [size]="18" /></span> O que arrumar ({{ items().length }})
        </h2>
        @if (items().length) {
          <div class="filter" role="group" aria-label="Filtrar por prioridade">
            @for (f of filters(); track f.value) {
              <button type="button" [class]="'f-' + f.css" [class.on]="filter() === f.value" [attr.aria-pressed]="filter() === f.value"
                (click)="filter.set(f.value)" [disabled]="!f.count">
                {{ f.label }} <span class="n">{{ f.count }}</span>
              </button>
            }
          </div>
        }
      </header>
      @for (item of visible(); track $index; let i = $index) {
        <article class="card reveal" [class]="(item.priority ?? 'BAIXA').toLowerCase()" [style.--i]="i">
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
              @if (loc.thread || loc.target) {
                <div class="tags">
                  @if (loc.thread) {
                    <span class="tag">thread <code>{{ loc.thread }}</code></span>
                  }
                  @if (loc.target) {
                    <span class="tag">alvo <code>{{ loc.target }}</code></span>
                  }
                </div>
              }
              <app-stack-trace [frames]="loc.stackFrames ?? []" [appFrame]="loc.appFrame" />
            </div>
          }
          @if (item.action) {
            <div class="action">
              <span class="action-label"><app-icon name="arrow-right" [size]="14" /> Como arrumar</span>
              <p>{{ item.action }}</p>
            </div>
          }
          <div class="links">
            @if (item.domainRef) {
              <a [routerLink]="[]" [fragment]="item.domainRef" queryParamsHandling="preserve">ver dados ↓</a>
            }
            @for (id of item.recordingIds ?? []; track id) {
              <a [routerLink]="['/recordings', id]" class="rec">{{ names()[id] ?? 'gravação' }}</a>
            }
          </div>
        </article>
      } @empty {
        <div class="panel">
          <app-empty-state title="Nenhum problema encontrado" message="Nenhuma regra apontou algo a arrumar nesta análise." />
        </div>
      }
    </section>
  `,
  styleUrl: './diagnosis-list.scss',
})
export class DiagnosisList {
  readonly items = input<DiagnosisView[]>([]);
  readonly names = input<Record<string, string>>({});
  /** Total de gravações do lote (0 no dashboard da gravação). */
  readonly totalRecordings = input(0);
  protected readonly filter = signal<Filter>('ALL');
  protected readonly counts = computed(() => countByPriority(this.items()));
  protected readonly filters = computed(() => {
    const counts = this.counts();
    const byPriority = (['ALTA', 'MEDIA', 'BAIXA'] as Priority[]).map((p) => ({
      value: p as Filter,
      label: PRIORITY_META[p].label,
      css: PRIORITY_META[p].css,
      count: counts[p],
    }));
    return [{ value: 'ALL' as Filter, label: 'Todas', css: 'all', count: this.items().length }, ...byPriority];
  });
  protected readonly visible = computed(() => {
    const filter = this.filter();
    return filter === 'ALL' ? this.items() : this.items().filter((i) => i.priority === filter);
  });

  protected category(value: string | undefined): string {
    return value ? (CATEGORY_LABEL[value] ?? value) : '';
  }
}
