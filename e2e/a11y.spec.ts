import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { exampleFiles, uniqueSoftware, uploadAndWait } from './support';

test('CA-W12: axe sem violações graves nas 6 telas e nos dois temas', async ({ page }) => {
  const statusUrl = await uploadAndWait(page, uniqueSoftware('e2e-a11y'), exampleFiles().slice(0, 1));
  const recordingUrl = await page.getByRole('link', { name: 'Ver dashboard', exact: true }).getAttribute('href');
  const pages = ['/upload', new URL(statusUrl).pathname, `${new URL(statusUrl).pathname}/dashboard`, recordingUrl!, '/history', '/software'];
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${scheme} ${url}: ${v.id} (${v.nodes.length})`)).toEqual([]);
    }
  }
});
