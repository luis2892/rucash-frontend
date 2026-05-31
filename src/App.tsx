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
import { DeudasPage } from './pages/finanzas/DeudasPage';
import { FlujoCajaPage } from './pages/finanzas/FlujoCajaPage';
import { MetasPage } from './pages/analisis/MetasPage';
import { AnalisisPage } from './pages/analisis/AnalisisPage';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protegidas */}
        <Route path="/enable-2fa"  element={<ProtectedRoute element={<Enable2FAPage />} />} />
        <Route path="/dashboard"   element={<ProtectedRoute element={<DashboardPage />} />} />
        <Route path="/pos"         element={<ProtectedRoute element={<POSPage />} />} />
        <Route path="/inventario"  element={<ProtectedRoute element={<InventarioPage />} />} />
        <Route path="/inventario/:id" element={<ProtectedRoute element={<ProductoDetailPage />} />} />
        <Route path="/deudas"      element={<ProtectedRoute element={<DeudasPage />} />} />
        <Route path="/flujo-caja"  element={<ProtectedRoute element={<FlujoCajaPage />} />} />
        <Route path="/metas"       element={<ProtectedRoute element={<MetasPage />} />} />
        <Route path="/analisis"    element={<ProtectedRoute element={<AnalisisPage />} />} />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
