import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AnalysesApi } from '../../core/api/analyses.api';
import { HistoryItem, HistoryPage as HistoryPageModel } from '../../core/api/models';
import { SoftwareApi } from '../../core/api/software.api';
import { HealthBadge } from '../../shared/components/health-badge';
import { Icon } from '../../shared/components/icon';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/states';
import { StatusChip } from '../../shared/components/status-chip';
import { DateTimePipe, RelativeTimePipe } from '../../shared/pipes/format.pipes';
import { Remote } from '../../shared/state/remote';

export const PAGE_SIZES = [20, 50, 100] as const;

/** Histórico paginado de lotes (RF-W05). Filtro e página ficam na URL. */
@Component({
  selector: 'app-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HealthBadge, Icon, StatusChip, EmptyState, ErrorState, LoadingState, DateTimePipe, RelativeTimePipe],
  templateUrl: './history.page.html',
  styleUrl: './history.page.scss',
})
export class HistoryPage {
  private readonly api = inject(AnalysesApi);
  private readonly router = inject(Router);

  readonly software = input<string>();
  readonly page = input<string>();
  readonly size = input<string>();

  protected readonly pageSizes = PAGE_SIZES;
  protected readonly remote = new Remote<HistoryPageModel>();
  protected readonly softwareOptions = toSignal(inject(SoftwareApi).list().pipe(catchError(() => of([]))), {
    initialValue: [],
  });
  protected readonly currentPage = computed(() => Math.max(0, Number(this.page()) || 0));
  protected readonly currentSize = computed(() => {
    const size = Number(this.size());
    return (PAGE_SIZES as readonly number[]).includes(size) ? size : PAGE_SIZES[0];
  });
  protected readonly totalPages = computed(() => this.remote.data()?.page?.totalPages ?? 0);

  constructor() {
    effect(() => this.load());
  }

  load(): void {
    this.remote.run(this.api.history({ software: this.software(), page: this.currentPage(), size: this.currentSize() }));
  }

  protected link(item: HistoryItem): unknown[] {
    return item.status === 'COMPLETED' || item.status === 'PARTIAL'
      ? ['/batches', item.batchId, 'dashboard']
      : ['/batches', item.batchId];
  }

  protected filter(event: Event): void {
    const software = (event.target as HTMLSelectElement).value || null;
    this.navigate({ software, page: null });
  }

  protected changeSize(event: Event): void {
    this.navigate({ size: Number((event.target as HTMLSelectElement).value), page: null });
  }

  protected goTo(page: number): void {
    this.navigate({ page: page > 0 ? page : null });
  }

  private navigate(queryParams: Record<string, unknown>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
