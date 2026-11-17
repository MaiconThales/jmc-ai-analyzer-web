import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface HealthComponent {
  status: string;
}

export interface HealthResponse {
  status: string;
  components?: Record<string, HealthComponent>;
}

/** Saúde da API (actuator). */
@Injectable({ providedIn: 'root' })
export class HealthApi {
  private readonly http = inject(HttpClient);

  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>('/actuator/health');
  }
}
