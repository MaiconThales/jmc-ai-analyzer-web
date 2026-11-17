import { Page, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const JFR_DIR = resolve(process.env['E2E_JFR_DIR'] ?? '../jmc-ai-analyzer-api/examples files');

export function exampleFiles(): { name: string; mimeType: string; buffer: Buffer }[] {
  return readdirSync(JFR_DIR)
    .filter((f) => f.endsWith('.jfr'))
    .sort()
    .map((name) => ({ name, mimeType: 'application/octet-stream', buffer: readFileSync(join(JFR_DIR, name)) }));
}

/** Envia arquivos pela tela de upload e espera o status do lote terminar. Devolve a URL do status. */
export async function uploadAndWait(
  page: Page,
  software: string,
  files: { name: string; mimeType: string; buffer: Buffer }[],
): Promise<string> {
  await page.goto('/upload');
  await page.getByTestId('file-input').setInputFiles(files);
  await page.getByLabel('Software').fill(software);
  await page.getByRole('button', { name: /^Enviar/ }).click();
  await expect(page).toHaveURL(/\/batches\/[0-9a-f-]+$/);
  await expect(page.getByText('Processando… a página atualiza sozinha.')).toBeHidden({ timeout: 90_000 });
  return page.url();
}

export function truncatedJfr(): { name: string; mimeType: string; buffer: Buffer } {
  const [first] = exampleFiles();
  return { name: 'broken.jfr', mimeType: 'application/octet-stream', buffer: first.buffer.subarray(0, 500_000) };
}

export function uniqueSoftware(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}
