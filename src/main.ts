import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err: unknown) => {
  // Falha na inicialização: o console é o único canal disponível.
  console.error(err); // eslint-disable-line no-console
});
