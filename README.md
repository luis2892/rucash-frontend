# 💰 RUCASH Frontend

Frontend web responsivo para RUCASH — Sistema de gestión POS y financiera para negocios.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 22+
- npm 9+

### Instalación

```bash
git clone https://github.com/luis2892/rucash-frontend.git
cd rucash-frontend
npm install
cp .env.local .env.local   # Editar con tus credenciales
npm run dev
```

### Acceso
- **Desarrollo:** http://localhost:5173
- **Producción:** https://rucash.taruk.tech

## 📁 Estructura

```
src/
├── components/
│   ├── ui/           # Button, Card, Input (Design System)
│   └── Layout/       # Header responsive
├── pages/
│   ├── auth/         # Login, Signup, ForgotPassword, ResetPassword, 2FA
│   ├── pos/          # Interfaz Punto de Venta
│   └── dashboard/    # Dashboard principal
├── services/         # api.ts (Axios + interceptors)
├── store/            # Zustand (authStore)
├── types/            # TypeScript interfaces
├── styles/           # Design System CSS
└── App.tsx
```

## 🎨 Design System

- **Color primario:** Azul Indigo `#4F46E5`
- **Tipografía:** Inter + Fira Code
- **Componentes:** `Button` (4 variantes), `Card`, `Input`, badges, alerts
- **Responsive:** Mobile-first (320px → 1536px)

## 🔐 Autenticación (Sprint 1-2)

| Página | Ruta |
|--------|------|
| Login | `/login` |
| Signup | `/signup` |
| Recuperar contraseña | `/forgot-password` |
| Reset contraseña | `/reset-password?token=` |
| Habilitar 2FA | `/enable-2fa` |

## 💳 POS (Sprint 3)

- Búsqueda de productos por nombre o código de barras
- Carrito con control de cantidad
- Selector de moneda USD / SOL con tipo de cambio configurable
- Métodos de pago: Efectivo / Tarjeta
- Cálculo automático de cambio + IGV 18%
- Decremente automático de stock tras venta

## 🛠️ Scripts

```bash
npm run dev       # Desarrollo en localhost:5173
npm run build     # Build producción
npm run preview   # Preview del build
npm run lint      # ESLint
```

## 🔗 Repos relacionados

- [Backend](https://github.com/luis2892/rucash-backend)
- [Base de Datos](https://github.com/luis2892/rucash-database)
- [Documentación](https://github.com/luis2892/rucash-docs)

---
© 2026 TARUK · Desarrollado por Luis Felix Rosas
