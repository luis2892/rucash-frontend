import { test, expect, Page } from '@playwright/test';

const EMAIL = 'luis.felix.rosas@gmail.com';
const PASSWORD = 'Rucash.2026*';

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

test.describe('Inventario', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/inventario');
    await page.waitForLoadState('networkidle');
  });

  test('Página inventario carga', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Búsqueda filtra productos', async ({ page }) => {
    const search = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
    await search.fill('Laptop');
    await page.waitForTimeout(500);
    const results = page.locator('text=/Laptop/i').first();
    await expect(results).toBeVisible({ timeout: 3000 });
  });

  test('Botón nuevo producto visible', async ({ page }) => {
    const btn = page.locator('button:has-text("Nuevo"), button:has-text("Agregar"), button:has-text("+")').first();
    await expect(btn).toBeVisible();
  });

  test('Load time inventario < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/inventario');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('Responsive mobile - página visible', async ({ page, viewport }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/inventario');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
