import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { EMPTY, Subscription, catchError, exhaustMap, filter, takeWhile, tap, timer } from 'rxjs';
import { AnalysesApi } from '../../core/api/analyses.api';
import { BatchResponse } from '../../core/api/models';
import { AppConfigStore } from '../../core/config/app-config.store';
import { ApiError, isApiError } from '../../core/errors/api-error';

export const MAX_FAILURES = 3;

/** Status do lote com polling até sair de PROCESSING; pausa com a aba oculta. */
@Injectable()
export class BatchStatusStore {
  private readonly api = inject(AnalysesApi);
  private readonly config = inject(AppConfigStore).config;
  private readonly document = inject(DOCUMENT);
  private subscription?: Subscription;
  private failures = 0;

  readonly batch = signal<BatchResponse | null>(null);
  readonly error = signal<ApiError | null>(null);
  readonly polling = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  start(batchId: string): void {
    this.stop();
    this.failures = 0;
    this.error.set(null);
    this.polling.set(true);
    this.subscription = timer(0, this.config().pollingIntervalMs)
      .pipe(
        filter(() => this.document.visibilityState !== 'hidden'),
        exhaustMap(() =>
          this.api.status(batchId).pipe(
            catchError((error: unknown) => {
              this.onFailure(isApiError(error) ? error : ApiError.network());
              return EMPTY;
            }),
          ),
        ),
        tap((batch) => {
          this.failures = 0;
          this.batch.set(batch);
        }),
        takeWhile((batch) => batch.status === 'PROCESSING', true),
      )
      .subscribe({ complete: () => this.polling.set(false) });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.polling.set(false);
  }

  private onFailure(error: ApiError): void {
    this.failures++;
    if (error.code === 'NOT_FOUND' || this.failures >= MAX_FAILURES) {
      this.error.set(error);
      this.stop();
    }
  }
}
