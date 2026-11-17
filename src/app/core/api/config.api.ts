import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigResponse } from './models';

/** Configuração pública da API e do container do front. */
@Injectable({ providedIn: 'root' })
export class ConfigApi {
  private readonly http = inject(HttpClient);

  apiConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>('/api/v1/config');
  }

  runtimeConfig(): Observable<RuntimeConfig> {
    return this.http.get<RuntimeConfig>('/runtime-config.json');
  }
}

/** Gerado pelo container do front a partir das variáveis de ambiente. */
export interface RuntimeConfig {
  pollingIntervalMs?: number;
}
