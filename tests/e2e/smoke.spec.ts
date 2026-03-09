import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Start from local test page that uses global loaders
    await page.goto('/test/index-auto.html');
  });

  // --- Tagline ---
  test('tagline renders text', async ({ page }) => {
    const lines = page.locator('.tl-line');
    await expect(lines.first()).toBeVisible({ timeout: 10_000 });
    await expect(lines.first()).not.toHaveText('');
  });

  // --- Twin Gallery ---
  test('twin-gallery has two panels', async ({ page }) => {
    const images = page.locator('.twin-gallery .panel');
    await expect(images).toHaveCount(2);
  });

  // --- Project Cards ---
  test('project cards render', async ({ page }) => {
    const cards = page.locator('.project-card');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
  });

  // --- Fortune Peach ---
  test('fortune-peach reveals a fortune', async ({ page }) => {
    // Click the explicit CTA button to avoid strict mode ambiguity
    await page.locator('#flwTap').click();
    await expect(page.getByRole('heading', { name: /Your Fortune/i })).toBeVisible();
  });

  // --- Portfolio UI/UX ---
  test('portfolio modal opens and closes', async ({ page }) => {
    const open = page.getByRole('button', { name: /Open fullscreen prototype/i }).first();
    await open.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  // --- Photography Gallery ---
  test('photography gallery renders masonry items', async ({ page }) => {
    const items = page.locator('.pg-masonry__item');
    await expect(items.first()).toBeVisible({ timeout: 15_000 });
  });

  test('photography gallery modal opens and closes', async ({ page }) => {
    const item = page.locator('.pg-masonry__item').first();
    await item.waitFor({ timeout: 15_000 });
    await item.click();
    await expect(page.locator('.pg-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.pg-modal')).toBeHidden();
  });

  // --- Logo Showcase ---
  test('logo showcase renders grid', async ({ page }) => {
    const grid = page.locator('.logo-grid');
    await expect(grid).toBeVisible({ timeout: 15_000 });
    const items = page.locator('.logo-placeholder');
    expect(await items.count()).toBeGreaterThanOrEqual(1);
  });

  test('logo showcase detail panel opens and closes', async ({ page }) => {
    const item = page.locator('.logo-placeholder').first();
    await item.waitFor({ timeout: 15_000 });
    await item.click();
    await expect(page.locator('.detail-panel')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.detail-panel')).toBeHidden();
  });

  // --- Guideline Page ---
  test('guideline page renders brand cards', async ({ page }) => {
    const cards = page.locator('.brand-card');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  });

  // --- Contact Form ---
  test('contact form renders', async ({ page }) => {
    const form = page.locator('form.contact-form-inner');
    await expect(form).toBeVisible({ timeout: 10_000 });
    // Should have input fields
    const inputs = form.locator('input, textarea');
    expect(await inputs.count()).toBeGreaterThanOrEqual(1);
  });

  test('contact form validation on empty submit', async ({ page }) => {
    const form = page.locator('form.contact-form-inner');
    await expect(form).toBeVisible({ timeout: 10_000 });
    const submitBtn = form.locator('button[type="submit"]');
    await submitBtn.click();
    // HTML5 validation should prevent submission — check that required fields exist
    const requiredFields = form.locator('[required]');
    expect(await requiredFields.count()).toBeGreaterThanOrEqual(1);
  });
});
