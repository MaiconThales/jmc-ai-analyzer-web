import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RecordingDashboard } from './models';

/** Dashboard de uma gravação. */
@Injectable({ providedIn: 'root' })
export class RecordingsApi {
  private readonly http = inject(HttpClient);

  dashboard(recordingId: string, topN: number): Observable<RecordingDashboard> {
    return this.http.get<RecordingDashboard>(`/api/v1/recordings/${recordingId}/dashboard`, { params: { topN } });
  }
}
