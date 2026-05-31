import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import {
  LoginPage, SignUpPage,
  ForgotPasswordPage, ResetPasswordPage, Enable2FAPage,
  DashboardPage,
} from './pages';
import { POSPage } from './pages/pos/POSPage';
import { InventarioPage } from './pages/inventario/InventarioPage';
import { ProductoDetailPage } from './pages/inventario/ProductoDetailPage';
import { ProveedoresPage } from './pages/inventario/ProveedoresPage';
import { DeudasPage } from './pages/finanzas/DeudasPage';
import { FlujoCajaPage } from './pages/finanzas/FlujoCajaPage';
import { FinancieroPage } from './pages/finanzas/FinancieroPage';
import { CuentasPage } from './pages/finanzas/CuentasPage';
import { MetasPage } from './pages/analisis/MetasPage';
import { AnalisisPage } from './pages/analisis/AnalisisPage';
import { ReportesPage } from './pages/reportes/ReportesPage';
import { ConstructorReportesPage } from './pages/reportes/ConstructorReportesPage';
import { DashboardDuenoPage } from './pages/dashboard/DashboardDuenoPage';
import { EquipoPage } from './pages/equipo/EquipoPage';
import { SignUpStep1Page } from './pages/auth/SignUpStep1Page';
import { SignUpStep2Page } from './pages/auth/SignUpStep2Page';
import { AdminConfigPage } from './pages/admin/AdminConfigPage';
import { AdminSuscripcionesPage } from './pages/admin/AdminSuscripcionesPage';

function App() {
  const { isAuthenticated, accessToken } = useAuthStore();

  const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    if (!isAuthenticated() && !accessToken) {
      return <Navigate to="/login" replace />;
    }
    return <>{element}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/auth/signup-step1" element={<SignUpStep1Page />} />
        <Route path="/auth/signup-step2" element={<SignUpStep2Page />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protegidas */}
        <Route path="/enable-2fa"  element={<ProtectedRoute element={<Enable2FAPage />} />} />
        <Route path="/dashboard"   element={<ProtectedRoute element={<DashboardPage />} />} />
        <Route path="/pos"         element={<ProtectedRoute element={<POSPage />} />} />
        <Route path="/inventario"  element={<ProtectedRoute element={<InventarioPage />} />} />
        <Route path="/inventario/:id" element={<ProtectedRoute element={<ProductoDetailPage />} />} />
        <Route path="/inventario/proveedores" element={<ProtectedRoute element={<ProveedoresPage />} />} />
        <Route path="/finanzas"    element={<ProtectedRoute element={<FinancieroPage />} />} />
        <Route path="/deudas"      element={<ProtectedRoute element={<DeudasPage />} />} />
        <Route path="/finanzas/deudas" element={<ProtectedRoute element={<DeudasPage />} />} />
        <Route path="/finanzas/cuentas" element={<ProtectedRoute element={<CuentasPage />} />} />
        <Route path="/flujo-caja"  element={<ProtectedRoute element={<FlujoCajaPage />} />} />
        <Route path="/finanzas/flujo-caja" element={<ProtectedRoute element={<FlujoCajaPage />} />} />
        <Route path="/admin/configuracion" element={<ProtectedRoute element={<AdminConfigPage />} />} />
        <Route path="/admin/suscripciones" element={<ProtectedRoute element={<AdminSuscripcionesPage />} />} />
        <Route path="/metas"                element={<ProtectedRoute element={<MetasPage />} />} />
        <Route path="/analisis"           element={<ProtectedRoute element={<AnalisisPage />} />} />
        <Route path="/reportes"           element={<ProtectedRoute element={<ReportesPage />} />} />
        <Route path="/reportes/constructor" element={<ProtectedRoute element={<ConstructorReportesPage />} />} />
        <Route path="/dashboard-dueno" element={<ProtectedRoute element={<DashboardDuenoPage />} />} />
        <Route path="/equipo"          element={<ProtectedRoute element={<EquipoPage />} />} />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
