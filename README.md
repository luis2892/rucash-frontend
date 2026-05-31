# RUCASH Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Interfaz web de RUCASH — Sistema POS + Gestión Financiera SaaS**

</div>

---

## Stack

| Tecnología | Uso |
|---|---|
| React 18 + TypeScript | UI + tipado estático |
| Vite | Bundler y dev server |
| TailwindCSS 3 | Estilos utility-first |
| Zustand | Estado global (auth) |
| React Router v6 | Navegación SPA |
| Axios | Cliente HTTP con interceptors JWT |
| Lucide React | Iconos |

---

## Design System

### Colores principales

| Token | Color | Hex |
|---|---|---|
| `navy-700` | Azul oscuro principal | `#172B4D` |
| `teal-500` | Verde/teal acento | `#00C9A7` |
| `slate-*` | Grises neutros | Escala Tailwind |

### Componentes reutilizables

```
src/components/
├── ui/
│   ├── Button.tsx       # Variantes: primary, secondary, ghost
│   ├── Input.tsx        # Input con icono y estados de error
│   ├── Card.tsx         # Card base con hover shadow
│   └── Logo.tsx         # Logo RUCASH
└── Layout/
    ├── AppLayout.tsx    # Wrapper principal con sidebar
    ├── Sidebar.tsx      # Navegación lateral con módulos
    └── Header.tsx       # Header con info de usuario
```

### Clases CSS custom

```css
.btn-primary      /* Botón navy relleno */
.btn-secondary    /* Botón borde gris */
.card             /* Card base con sombra */
.card-p           /* Card con padding p-6 */
.badge            /* Badge pill */
.badge-navy       /* Badge azul oscuro */
.badge-teal       /* Badge teal */
.text-2xs         /* Fuente 11px / line-height 16px */
```

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── Layout/           # Sidebar, Header, AppLayout
│   └── ui/               # Button, Input, Card, Logo
├── pages/
│   ├── auth/             # Login, Signup, ForgotPassword, ResetPassword, Enable2FA
│   ├── dashboard/        # DashboardPage con módulos
│   ├── pos/              # POSPage — punto de venta
│   └── inventario/       # InventarioPage, ProductoDetailPage
├── services/
│   └── api.ts            # Axios instance + interceptor JWT refresh
├── store/
│   └── authStore.ts      # Zustand — usuario, cliente, tokens
└── types/                # Tipos compartidos con el backend
```

---

## Páginas y Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | Login con email + password | Público |
| `/signup` | Registro de nueva cuenta | Público |
| `/forgot-password` | Solicitar reset de contraseña | Público |
| `/reset-password` | Nueva contraseña con token | Público |
| `/enable-2fa` | Activar autenticación 2FA | Autenticado |
| `/dashboard` | Panel principal con módulos | Autenticado |
| `/pos` | Punto de Venta (carrito, ventas) | Autenticado |
| `/inventario` | Listado y gestión de productos | Autenticado |
| `/inventario/:id` | Detalle, stock y auditoría del producto | Autenticado |

---

## Módulos

| Módulo | Estado | Ruta |
|---|---|---|
| 🛒 Punto de Venta | ✅ Disponible | `/pos` |
| 📦 Inventario | ✅ Disponible | `/inventario` |
| 💸 Financiero | 🔜 Próximamente | — |
| 🎯 Metas | 🔜 Próximamente | — |
| 📊 Reportes | 🔜 Próximamente | — |

---

## Funcionalidades Clave

### Autenticación
- Login / Signup con validación
- JWT con refresh automático (interceptor Axios)
- 2FA con TOTP — código QR + verificación
- Reset de contraseña por email

### Punto de Venta (POS)
- Búsqueda por nombre o código de barras
- Carrito con soporte dual moneda (USD / SOL)
- IGV 18% automático
- Métodos de pago: Efectivo, Tarjeta, Yape/Plin
- Cálculo de vuelto

### Inventario
- Búsqueda en tiempo real (nombre, código, descripción)
- Filtros por categoría
- Métricas: valor inventario, sin stock, stock bajo
- Modal crear/editar productos con auto-calc precio SOL
- Exportar a CSV
- Detalle con margen de ganancia y valor total
- Ajuste de stock tienda/almacén con notas
- Auditoría: historial de cambios con antes/después

---

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

### Variables de Entorno

```env
VITE_API_URL=http://localhost:3001
```

---

## Sprints Completados

| Sprint | Módulo | Estado |
|---|---|---|
| Sprint 1 | Auth base + JWT | ✅ |
| Sprint 2 | Auth avanzada (2FA, sessions) | ✅ |
| Sprint 3 | POS básico + UI Redesign (navy + teal) | ✅ |
| Sprint 4 | Inventario completo | ✅ |
| Sprint 5 | Gestión Financiera | 🔜 |

---

<div align="center">
  <sub>Desarrollado por <strong>Luis Felix Rosas</strong> · TARUK Soluciones Tecnológicas · 2026</sub>
</div>
