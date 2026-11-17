import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';
import { ConfigApi, RuntimeConfig } from '../api/config.api';
import { ConfigResponse } from '../api/models';

export interface AppConfig {
  maxFiles: number;
  maxFileSizeBytes: number;
  maxRequestSizeBytes: number;
  allowedExtension: string;
  defaultTopN: number;
  maxTopN: number;
  pollingIntervalMs: number;
}

/** Padrões da API v0.1.0, usados se a configuração não puder ser carregada. */
export const DEFAULT_CONFIG: AppConfig = {
  maxFiles: 20,
  maxFileSizeBytes: 128 * 1024 * 1024,
  maxRequestSizeBytes: 1024 * 1024 * 1024,
  allowedExtension: '.jfr',
  defaultTopN: 10,
  maxTopN: 50,
  pollingIntervalMs: 2000,
};

/** Limites de upload e top-N (GET /api/v1/config) e opções do container (runtime-config.json). */
@Injectable({ providedIn: 'root' })
export class AppConfigStore {
  private readonly api = inject(ConfigApi);
  private readonly state = signal<AppConfig>(DEFAULT_CONFIG);
  private readonly fromApi = signal(false);

  readonly config = this.state.asReadonly();
  /** {@code true} quando os limites vieram da API (e não dos padrões). */
  readonly loadedFromApi = this.fromApi.asReadonly();
  readonly topNOptions = computed(() => [10, 20, 50].filter((n) => n <= this.state().maxTopN));

  load(): Promise<void> {
    const api$ = this.api.apiConfig().pipe(
      map((config) => ({ ok: true as const, config })),
      catchError(() => of({ ok: false as const })),
    );
    const runtime$ = this.api.runtimeConfig().pipe(catchError(() => of<RuntimeConfig>({})));
    return firstValueFrom(forkJoin([api$, runtime$])).then(([api, runtime]) => {
      this.fromApi.set(api.ok);
      this.state.set(merge(api.ok ? api.config : undefined, runtime.pollingIntervalMs));
    });
  }
}

export function merge(config: ConfigResponse | undefined, pollingIntervalMs: number | undefined): AppConfig {
  return {
    maxFiles: config?.upload?.maxFiles ?? DEFAULT_CONFIG.maxFiles,
    maxFileSizeBytes: config?.upload?.maxFileSizeBytes ?? DEFAULT_CONFIG.maxFileSizeBytes,
    maxRequestSizeBytes: config?.upload?.maxRequestSizeBytes ?? DEFAULT_CONFIG.maxRequestSizeBytes,
    allowedExtension: config?.upload?.allowedExtension ?? DEFAULT_CONFIG.allowedExtension,
    defaultTopN: config?.dashboard?.defaultTopN ?? DEFAULT_CONFIG.defaultTopN,
    maxTopN: config?.dashboard?.maxTopN ?? DEFAULT_CONFIG.maxTopN,
    pollingIntervalMs:
      pollingIntervalMs && pollingIntervalMs > 0 ? pollingIntervalMs : DEFAULT_CONFIG.pollingIntervalMs,
  };
}
