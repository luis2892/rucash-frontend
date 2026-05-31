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

test.describe('Performance', () => {
  test('Login page carga < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('Dashboard carga < 3s', async ({ page }) => {
    await login(page);
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('POS carga < 3s', async ({ page }) => {
    await login(page);
    const start = Date.now();
    await page.goto('/pos');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test('No hay errores JS en consola en login', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('DevTools'))).toHaveLength(0);
  });
});
