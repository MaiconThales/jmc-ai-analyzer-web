import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SoftwareResponse, SoftwareUpdateRequest } from './models';

/** Softwares cadastrados: retenção e pacotes da aplicação. */
@Injectable({ providedIn: 'root' })
export class SoftwareApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/software';

  list(): Observable<SoftwareResponse[]> {
    return this.http.get<SoftwareResponse[]>(this.base);
  }

  update(name: string, request: SoftwareUpdateRequest): Observable<SoftwareResponse> {
    return this.http.patch<SoftwareResponse>(`${this.base}/${encodeURIComponent(name)}`, request);
  }
}
