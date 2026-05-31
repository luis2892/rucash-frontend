import { test, expect } from '@playwright/test';

const EMAIL = 'luis.felix.rosas@gmail.com';
const PASSWORD = 'Rucash.2026*';

test.describe('Autenticación', () => {
  test('Login correcto redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Login incorrecto muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/error|incorrecto|inválido/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('Ruta protegida sin login redirige a /login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/login/);
  });

  test('Recuperación de contraseña muestra confirmación', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', EMAIL);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/enviado|email|revisa/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('Logout redirige a login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.click('button[title="Cerrar sesión"], button:has-text("Cerrar"), [aria-label*="logout"]');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/login/);
  });
});
