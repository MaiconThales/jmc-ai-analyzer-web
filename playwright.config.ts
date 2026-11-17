import { defineConfig } from '@playwright/test';

/**
 * E2E contra a pilha real (Compose da API com o front). Suba antes com `npm run e2e:up`.
 * E2E_BASE_URL: endereço do front (padrão http://localhost:4200).
 * E2E_JFR_DIR: pasta com os .jfr de exemplo (padrão ../jmc-ai-analyzer-api/examples files).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
    channel: process.env['E2E_CHANNEL'] ?? 'chrome',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
});
