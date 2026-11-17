import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchDashboard, BatchResponse, HistoryPage, UploadForm } from './models';

/** Lotes: upload, status, dashboard consolidado e histórico. */
@Injectable({ providedIn: 'root' })
export class AnalysesApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/analyses';

  upload(form: UploadForm, files: readonly File[]): Observable<HttpEvent<BatchResponse>> {
    const body = new FormData();
    body.append('software', form.software);
    appendIfPresent(body, 'softwareVersion', form.softwareVersion);
    appendIfPresent(body, 'environment', form.environment);
    appendIfPresent(body, 'description', form.description);
    files.forEach((file) => body.append('files', file, file.name));
    return this.http.post<BatchResponse>(this.base, body, { reportProgress: true, observe: 'events' });
  }

  status(batchId: string): Observable<BatchResponse> {
    return this.http.get<BatchResponse>(`${this.base}/${batchId}`);
  }

  dashboard(batchId: string, topN: number): Observable<BatchDashboard> {
    return this.http.get<BatchDashboard>(`${this.base}/${batchId}/dashboard`, { params: { topN } });
  }

  history(query: { software?: string | null; page: number; size: number }): Observable<HistoryPage> {
    let params = new HttpParams().set('page', query.page).set('size', query.size).set('sort', 'createdAt,desc');
    if (query.software) {
      params = params.set('software', query.software);
    }
    return this.http.get<HistoryPage>(this.base, { params });
  }
}

function appendIfPresent(body: FormData, name: string, value: string | undefined): void {
  if (value?.trim()) {
    body.append(name, value.trim());
  }
}
