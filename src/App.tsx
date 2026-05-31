import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import {
  LoginPage, SignUpPage,
  ForgotPasswordPage, ResetPasswordPage, Enable2FAPage,
  DashboardPage,
} from './pages';
import { POSPage } from './pages/pos/POSPage';

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

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
