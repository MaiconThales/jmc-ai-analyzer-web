import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ApiStatusService {
  private readonly subject = new BehaviorSubject<'online'|'offline'>('online'); readonly state$ = this.subject.asObservable();
  constructor(http: HttpClient) { timer(0, 30000).subscribe(() => http.get(`${environment.apiUrl}/health`).pipe(map(() => 'online' as const), catchError(() => of('offline' as const))).subscribe(v => this.subject.next(v))); }
}
