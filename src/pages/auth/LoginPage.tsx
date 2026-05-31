import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { LoginPayload } from '../../types';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

const FEATURES = [
  { icon: '💳', text: 'Punto de Venta con soporte USD & SOL' },
  { icon: '📦', text: 'Gestión de inventario en tiempo real' },
  { icon: '📊', text: 'Reportes financieros automáticos' },
  { icon: '🔐', text: 'Seguridad con autenticación 2FA' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginPayload) => {
    setLocalError(null);
    clearError();
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — Branding ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-navy-700 flex-col relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-navy-800/60 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Logo size="md" light />

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mt-12">
            <span className="badge-teal badge mb-4 w-fit text-teal-400 bg-teal-500/15">
              ✦ Sistema POS SaaS
            </span>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Gestiona tu negocio con claridad
            </h1>
            <p className="text-slate-300 text-base leading-relaxed mb-10">
              RUCASH centraliza tus ventas, inventario y finanzas en una sola plataforma elegante y segura.
            </p>

            {/* Features list */}
            <ul className="space-y-4">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3.5 text-slate-200 text-sm">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-slate-500 text-xs relative z-10">
            © 2026 TARUK · RUCASH v1.0
          </p>
        </div>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-slate-50">
        {/* Logo móvil */}
        <div className="lg:hidden mb-8">
          <Logo size="sm" />
        </div>

        <div className="w-full max-w-sm mx-auto animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Bienvenido de nuevo</h2>
            <p className="text-slate-500 text-sm">Inicia sesión para continuar</p>
          </div>

          {/* Error alert */}
          {displayError && (
            <div className="alert-error mb-6">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="tu@empresa.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              iconRight={<ArrowRight size={16} />}
              className="mt-2"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              Crear cuenta gratis
            </Link>
          </p>

          {/* Trust signals */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400 mb-3">Confianza y seguridad</p>
            <div className="flex items-center justify-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-teal-500" /> SSL 256-bit</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-teal-500" /> 2FA disponible</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-teal-500" /> Datos cifrados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
