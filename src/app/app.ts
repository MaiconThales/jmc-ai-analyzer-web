import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiStatusService } from './core/services/api-status.service';

@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive], templateUrl: './app.html', styleUrl: './app.css' })
export class App {
  readonly apiStatus = signal<'online' | 'offline'>('online');
  constructor(status: ApiStatusService) { status.state$.subscribe(value => this.apiStatus.set(value)); }
}
