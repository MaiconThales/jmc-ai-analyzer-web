import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'upload' },
  {
    path: 'upload',
    title: 'Enviar gravações · JMC AI Analyzer',
    loadComponent: () => import('./features/upload/upload.page').then((m) => m.UploadPage),
  },
  {
    path: 'batches/:batchId',
    title: 'Status do lote · JMC AI Analyzer',
    loadComponent: () => import('./features/batch-status/batch-status.page').then((m) => m.BatchStatusPage),
  },
  {
    path: 'batches/:batchId/dashboard',
    title: 'Dashboard do lote · JMC AI Analyzer',
    loadComponent: () => import('./features/batch-dashboard/batch-dashboard.page').then((m) => m.BatchDashboardPage),
  },
  {
    path: 'recordings/:recordingId',
    title: 'Dashboard da gravação · JMC AI Analyzer',
    loadComponent: () =>
      import('./features/recording-dashboard/recording-dashboard.page').then((m) => m.RecordingDashboardPage),
  },
  {
    path: 'history',
    title: 'Histórico · JMC AI Analyzer',
    loadComponent: () => import('./features/history/history.page').then((m) => m.HistoryPage),
  },
  {
    path: 'software',
    title: 'Softwares · JMC AI Analyzer',
    loadComponent: () => import('./features/software/software.page').then((m) => m.SoftwarePage),
  },
  {
    path: '**',
    title: 'Não encontrado · JMC AI Analyzer',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
