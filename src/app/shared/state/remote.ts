import { DestroyRef, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiError, isApiError } from '../../core/errors/api-error';

/** Estado de uma consulta remota (dados, erro, carregando), cancelando a anterior a cada nova execução. */
export class Remote<T> {
  readonly data = signal<T | null>(null);
  readonly error = signal<ApiError | null>(null);
  readonly loading = signal(false);
  private subscription?: Subscription;

  constructor(destroyRef: DestroyRef | null = injectDestroyRef()) {
    destroyRef?.onDestroy(() => this.cancel());
  }

  run(source: Observable<T>, keepData = false): void {
    this.cancel();
    this.loading.set(true);
    this.error.set(null);
    if (!keepData) {
      this.data.set(null);
    }
    this.subscription = source.subscribe({
      next: (value) => {
        this.data.set(value);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(isApiError(error) ? error : ApiError.network());
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }
}

function injectDestroyRef(): DestroyRef | null {
  try {
    return inject(DestroyRef);
  } catch {
    return null;
  }
}
