import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';
import { routes } from './app.routes';
import { AppConfigStore } from './core/config/app-config.store';
import { problemJsonInterceptor } from './core/interceptors/problem-json.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([problemJsonInterceptor])),
    provideEchartsCore({ echarts: () => import('./shared/charts/echarts-setup') }),
    provideAppInitializer(() => inject(AppConfigStore).load()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
