import { expect, test } from '@playwright/test';
import { exampleFiles, truncatedJfr, uniqueSoftware, uploadAndWait } from './support';

test.describe('fluxos principais', () => {
  test('CA-W01 a CA-W05: upload, status, dashboards, cobertura e "ver dados"', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await uploadAndWait(page, uniqueSoftware('e2e-ex'), exampleFiles());

    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.getByText('Concluído').first()).toBeVisible();
    await page.getByRole('link', { name: 'Ver dashboard' }).first().click();

    const diagnosis = page.locator('#diagnosis');
    await expect(diagnosis.getByText('Flag da JVM limita o compilador ao C1')).toBeVisible();
    await expect(diagnosis.getByText('JVM limitada a menos processadores que a máquina')).toBeVisible();
    await expect(diagnosis.getByText('Thread com maior volume de alocação')).toBeVisible();
    await expect(diagnosis.getByText('seu código:').first()).toBeVisible();

    const coverage = page.locator('#coverage');
    await expect(coverage.getByText('EXCEPTIONS')).toBeVisible();
    await expect(coverage.getByText('FILE_IO')).toBeVisible();
    await coverage.getByRole('button', { name: /Copiar comando/ }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('-XX:StartFlightRecording');

    await diagnosis.locator('article', { hasText: 'Taxa de alocação alta' }).getByRole('link', { name: 'ver dados ↓' }).click();
    await expect(page).toHaveURL(/#allocation$/);
    await expect(page.locator('#allocation')).toBeInViewport();
    await expect(page.locator('#cpu canvas').first()).toBeVisible();

    await page.getByRole('link', { name: 'Ver o lote completo' }).click();
    await expect(page.getByRole('heading', { name: 'Comparativo' })).toBeVisible();
    await expect(page.locator('#comparison tbody tr')).toHaveCount(3);
    await expect(page.getByText(/em \d de 3 gravações/).first()).toBeVisible();
  });

  test('CA-W07: lote parcial mostra a falha traduzida e o aviso no consolidado', async ({ page }) => {
    const [first] = exampleFiles();
    await uploadAndWait(page, uniqueSoftware('e2e-partial'), [first, truncatedJfr()]);
    await expect(page.getByText('Parcial')).toBeVisible();
    await expect(page.getByText(/Não foi possível ler este arquivo JFR/)).toBeVisible();
    await page.getByRole('link', { name: 'Ver dashboard do lote' }).click();
    await expect(page.getByText(/ficaram fora do consolidado/)).toBeVisible();
  });

  test('CA-W06: arquivos e software inválidos são barrados antes do envio', async ({ page }) => {
    await page.goto('/upload');
    await page.getByTestId('file-input').setInputFiles([{ name: 'dump.txt', mimeType: 'text/plain', buffer: Buffer.from('x') }]);
    await expect(page.getByText('Não é um arquivo .jfr.')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Enviar/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Remover dump.txt' }).click();
    await page.getByTestId('file-input').setInputFiles(exampleFiles().slice(0, 1));
    await page.getByLabel('Software').fill('Software Inválido');
    await page.getByRole('button', { name: /^Enviar/ }).click();
    await expect(page.getByText('Use minúsculas, números e hífen')).toBeVisible();
    await expect(page).toHaveURL(/\/upload$/);
  });

  test('CA-W08: histórico filtra e pagina pela URL', async ({ page }) => {
    const software = uniqueSoftware('e2e-hist');
    await uploadAndWait(page, software, exampleFiles().slice(0, 1));
    await page.goto('/history');
    await page.getByTestId('software-filter').selectOption(software);
    await expect(page).toHaveURL(new RegExp(`software=${software}`));
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await page.reload();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByTestId('software-filter')).toHaveValue(software);
  });

  test('CA-W09: pacotes da aplicação mudam o "seu código" das análises antigas', async ({ page }) => {
    const software = uniqueSoftware('e2e-pkg');
    await uploadAndWait(page, software, exampleFiles().slice(0, 1));
    const recordingUrl = await page.getByRole('link', { name: 'Ver dashboard', exact: true }).getAttribute('href');
    await page.goto(recordingUrl!);
    const allocation = page.locator('#diagnosis article', { hasText: 'Taxa de alocação alta' });
    await expect(allocation.locator('app-app-frame code').first()).toHaveText('HexaUtil.converteString:23');

    await page.goto('/software');
    await page.getByRole('button', { name: `Editar ${software}` }).click();
    await page.getByLabel('Novo pacote').fill('br.com.sascar.core.tacweb.bean');
    await page.getByRole('button', { name: 'adicionar' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.goto(recordingUrl!);
    await expect(allocation.locator('app-app-frame code').first()).toHaveText(/^Tac\.getComando:\d+$/);
  });
});

test.describe('configuração e falhas', () => {
  test('CA-W13: limites vêm da API sem rebuild', async ({ page }) => {
    await page.route('**/api/v1/config', (route) =>
      route.fulfill({
        json: { upload: { maxFiles: 1, maxFileSizeBytes: 1024, maxRequestSizeBytes: 2048, allowedExtension: '.jfr' }, dashboard: { defaultTopN: 10, maxTopN: 50 } },
      }),
    );
    await page.goto('/upload');
    await expect(page.getByText(/Envie até 1 arquivos .jfr de até 1,0 KB/)).toBeVisible();
    await page.getByTestId('file-input').setInputFiles(exampleFiles().slice(0, 1));
    await expect(page.getByText(/Acima do limite de 1,0 KB/)).toBeVisible();
  });

  test('CA-W14: API fora do ar mostra o aviso e "tentar de novo"', async ({ page }) => {
    await page.route('**/actuator/health', (route) => route.abort());
    await page.route('**/api/v1/analyses?*', (route) => route.abort());
    await page.goto('/history');
    await expect(page.getByText('A API está fora do ar. Algumas telas podem não carregar.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
  });
});
