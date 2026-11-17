import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { HealthApi } from '../api/health.api';

export interface ApiHealth {
  up: boolean;
  /** Componentes fora do ar (ex.: db, blobStorage). */
  down: string[];
}

export const HEALTH_INTERVAL_MS = 30_000;

/** Consulta /actuator/health a cada 30 s. */
@Injectable({ providedIn: 'root' })
export class ApiHealthStore {
  private readonly api = inject(HealthApi);
  readonly health = signal<ApiHealth | null>(null);

  constructor() {
    const subscription = timer(0, HEALTH_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.api.health().pipe(
            map((h): ApiHealth => ({
              up: h.status === 'UP',
              down: Object.entries(h.components ?? {})
                .filter(([, c]) => c.status !== 'UP')
                .map(([name]) => name),
            })),
            catchError(() => of<ApiHealth>({ up: false, down: [] })),
          ),
        ),
      )
      .subscribe((h) => this.health.set(h));
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }
}
