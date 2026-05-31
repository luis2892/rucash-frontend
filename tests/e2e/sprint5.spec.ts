import { test, expect } from '@playwright/test';

const EMAIL = 'luis.felix.rosas@gmail.com';
const PASSWORD = 'Rucash.2026*';

// ── Helpers ──────────────────────────────────────────────
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

// ── 5.1 REGISTRO 2 PASOS ─────────────────────────────────
test.describe('5.1 Registro 2 pasos', () => {
  test('Paso 1 — formulario renderiza campos correctos', async ({ page }) => {
    await page.goto('/auth/signup-step1');
    await expect(page.locator('input[placeholder*="Juan"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('Paso 1 — validación requerida muestra errores', async ({ page }) => {
    await page.goto('/auth/signup-step1');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/requerido/i').first()).toBeVisible();
  });

  test('Paso 1 → redirige a Paso 2', async ({ page }) => {
    await page.goto('/auth/signup-step1');
    await page.fill('input[placeholder*="Juan"]', 'Test User');
    await page.fill('input[type="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[type="tel"]', '+51 999 123 456');
    await page.locator('input[type="password"]').first().fill('TestPass123');
    await page.locator('input[type="password"]').nth(1).fill('TestPass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/signup-step2/);
  });

  test('Paso 2 — formulario renderiza campos empresa', async ({ page }) => {
    // Simular que hay datos en sessionStorage
    await page.goto('/auth/signup-step1');
    await page.evaluate(() => {
      sessionStorage.setItem('signupStep1', JSON.stringify({
        email: 'test@test.com',
        password: 'Pass1234',
        full_name: 'Test User',
        whatsapp: '+51999999',
      }));
    });
    await page.goto('/auth/signup-step2');
    await expect(page.locator('input[placeholder*="tienda"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="RUC"]')).toBeVisible({ timeout: 3000 });
  });

  test('Paso 2 — botón Volver regresa al paso 1', async ({ page }) => {
    await page.goto('/auth/signup-step2');
    await page.click('button:has-text("Volver")');
    await expect(page).toHaveURL(/signup-step1/);
  });
});

// ── 5.3 ADMIN CONFIG ─────────────────────────────────────
test.describe('5.3 Administración — Config Sistema', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Ruta /admin/configuracion carga la página', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('text=/Configuración del Sistema/i')).toBeVisible({ timeout: 8000 });
  });

  test('Sección Contacto muestra campo WhatsApp', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('input[placeholder*="+51"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('Sección Precios muestra campos Hobby, Pro, Enterprise', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('text=/Plan Hobby/i')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/Plan Pro/i')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/Plan Enterprise/i')).toBeVisible({ timeout: 8000 });
  });

  test('Botón Guardar existe y es clicable', async ({ page }) => {
    await page.goto('/admin/configuracion');
    const btn = page.locator('button:has-text("Guardar")');
    await expect(btn).toBeVisible({ timeout: 8000 });
    await expect(btn).toBeEnabled();
  });
});

// ── 5.2 ADMIN SUSCRIPCIONES ──────────────────────────────
test.describe('5.2 Administración — Suscripciones', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Ruta /admin/suscripciones carga la página', async ({ page }) => {
    await page.goto('/admin/suscripciones');
    await expect(page.locator('text=/Gestión de Suscripciones/i')).toBeVisible({ timeout: 8000 });
  });

  test('Botón Nueva suscripción está visible', async ({ page }) => {
    await page.goto('/admin/suscripciones');
    await expect(page.locator('button:has-text("Nueva suscripción")')).toBeVisible({ timeout: 8000 });
  });
});

// ── 5.5 PROVEEDORES CRUD ─────────────────────────────────
test.describe('5.5 Proveedores CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Página /inventario/proveedores carga', async ({ page }) => {
    await page.goto('/inventario/proveedores');
    await expect(page.locator('text=/Proveedores/i')).toBeVisible({ timeout: 8000 });
  });

  test('Botón Nuevo proveedor abre modal', async ({ page }) => {
    await page.goto('/inventario/proveedores');
    await page.click('button:has-text("Nuevo proveedor")');
    await expect(page.locator('input[placeholder*="nombre"], input[label*="Nombre"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Formulario tiene campos requeridos', async ({ page }) => {
    await page.goto('/inventario/proveedores');
    await page.click('button:has-text("Nuevo proveedor")');
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=/requerido/i').first()).toBeVisible({ timeout: 3000 });
  });
});

// ── 5.6 FINANCIERO ───────────────────────────────────────
test.describe('5.6 Financiero Base', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Dashboard /finanzas carga con KPIs', async ({ page }) => {
    await page.goto('/finanzas');
    await expect(page.locator('text=/Total Deudas/i')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/Saldo en Cuentas/i')).toBeVisible({ timeout: 8000 });
  });

  test('Links quick access funcionan', async ({ page }) => {
    await page.goto('/finanzas');
    await expect(page.locator('text=/Deudas/').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/Cuentas/')).toBeVisible({ timeout: 8000 });
  });

  test('Página /finanzas/cuentas carga', async ({ page }) => {
    await page.goto('/finanzas/cuentas');
    await expect(page.locator('text=/Cuentas Bancarias/i')).toBeVisible({ timeout: 8000 });
  });

  test('Página /finanzas/cuentas — botón Nueva cuenta', async ({ page }) => {
    await page.goto('/finanzas/cuentas');
    await expect(page.locator('button:has-text("Nueva cuenta")')).toBeVisible({ timeout: 8000 });
  });

  test('Página /finanzas/deudas carga', async ({ page }) => {
    await page.goto('/finanzas/deudas');
    await expect(page.locator('text=/Deuda/i').first()).toBeVisible({ timeout: 8000 });
  });
});

// ── BACKEND API HEALTH ───────────────────────────────────
test.describe('API endpoints Sprint 5', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('GET /api/proveedores responde sin error', async ({ request, page }) => {
    await login(page);
    const token = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      return state?.state?.accessToken;
    });

    const resp = await request.get('http://localhost:3001/api/proveedores', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.status()).toBeLessThan(500);
  });

  test('GET /api/config/sistema responde sin error 500', async ({ request, page }) => {
    await login(page);
    const token = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      return state?.state?.accessToken;
    });

    const resp = await request.get('http://localhost:3001/api/config/sistema', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.status()).toBeLessThan(500);
  });
});
