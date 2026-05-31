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

test.describe('POS - Punto de Venta', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
  });

  test('Página POS carga correctamente', async ({ page }) => {
    await expect(page.locator('h1, [data-testid="pos-title"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="buscar"], input[placeholder*="código"], input[placeholder*="Buscar"]').first()).toBeVisible();
  });

  test('Buscar producto por texto', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="código"], input[placeholder*="Buscar"]').first();
    await searchInput.fill('Laptop');
    await page.waitForTimeout(400);
    await expect(page.locator('text=/Laptop/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('Carrito vacío muestra estado vacío', async ({ page }) => {
    await expect(page.locator('text=/carrito|venta|items/i').first()).toBeVisible();
  });

  test('Total se muestra en pantalla', async ({ page }) => {
    await expect(page.locator('text=/total|Total/i').first()).toBeVisible();
  });

  test('Selector de moneda visible', async ({ page }) => {
    const usdOrSol = page.locator('text=USD, text=SOL, button:has-text("USD"), button:has-text("SOL")').first();
    await expect(usdOrSol).toBeVisible();
  });

  test('Load time POS < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });
});
