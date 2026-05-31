import { Navigate } from 'react-router-dom';

// El registro ahora usa el flujo 2-pasos: /auth/signup-step1 → /auth/signup-step2
export const SignUpPage = () => <Navigate to="/auth/signup-step1" replace />;
