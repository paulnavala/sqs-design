import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Start from local test page that uses global loaders
    await page.goto('/test/index-auto.html');
  });

  test('fortune-peach reveals a fortune', async ({ page }) => {
    // Click the explicit CTA button to avoid strict mode ambiguity
    await page.locator('#flwTap').click();
    await expect(page.getByRole('heading', { name: /Your Fortune/i })).toBeVisible();
  });

  test('portfolio modal opens and closes', async ({ page }) => {
    const open = page.getByRole('button', { name: /Open fullscreen prototype/i }).first();
    await open.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('twin-gallery has two panels', async ({ page }) => {
    const images = page.locator('.twin-gallery .panel');
    await expect(images).toHaveCount(2);
  });
});
