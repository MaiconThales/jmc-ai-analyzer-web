import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'analysis/:id', loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent) },
  { path: 'history', loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent) },
  { path: '**', redirectTo: '' },
];
