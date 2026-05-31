import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { SignUpPayload } from '../../types';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

type FormData = SignUpPayload & { confirmPassword: string; terms: boolean };

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: '', password: '', full_name: '', whatsapp: '', confirmPassword: '' },
  });
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    setLocalError(null);
    clearError();
    try {
      const { confirmPassword, terms, ...payload } = data;
      await signup(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Error al crear cuenta');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — Branding ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-navy-700 flex-col relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-12 left-12 w-60 h-60 bg-navy-800/60 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Logo size="md" light />

          <div className="flex-1 flex flex-col justify-center max-w-xs mt-10">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-2xl mb-6">🚀</div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Empieza tu prueba gratuita
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              7 días gratis, sin tarjeta de crédito. Cancela cuando quieras.
            </p>

            {/* Steps */}
            <div className="space-y-5">
              {[
                { n: '1', t: 'Crea tu cuenta en 30 segundos' },
                { n: '2', t: 'Agrega tus productos y precios' },
                { n: '3', t: 'Empieza a vender desde el POS' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {s.n}
                  </div>
                  <span className="text-slate-200 text-sm">{s.t}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-xs">© 2026 TARUK · RUCASH</p>
        </div>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-slate-50 overflow-y-auto py-10">
        <div className="lg:hidden mb-6"><Logo size="sm" /></div>

        <div className="w-full max-w-md mx-auto animate-slide-up">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Crear cuenta</h2>
            <p className="text-slate-500 text-sm">Completa los datos para empezar</p>
          </div>

          {displayError && (
            <div className="alert-error mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Nombre completo" required
              placeholder="Juan Pérez"
              icon={<User size={16} />}
              error={errors.full_name?.message}
              {...register('full_name', { required: 'El nombre es requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
            />

            <Input
              label="Email corporativo" required
              type="email"
              placeholder="tu@empresa.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
            />

            <Input
              label="WhatsApp" required
              type="tel"
              placeholder="+51 987 654 321"
              icon={<Phone size={16} />}
              error={errors.whatsapp?.message}
              hint="Para notificaciones y soporte"
              {...register('whatsapp', {
                required: 'El WhatsApp es requerido',
                pattern: { value: /^[0-9+\-() ]+$/, message: 'Formato inválido' },
              })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Contraseña <span className="text-red-500">*</span></label>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                icon={<Lock size={16} />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                hint="Incluye mayúsculas, minúsculas y números"
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Incluye mayúsculas, minúsculas y números' },
                })}
              />
            </div>

            <Input
              label="Confirmar contraseña" required
              type="password"
              placeholder="Repite tu contraseña"
              icon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: v => v === password || 'Las contraseñas no coinciden',
              })}
            />

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-teal-500"
                {...register('terms', { required: true })} />
              <span className="text-sm text-slate-600">
                Acepto los{' '}
                <a href="#" className="text-teal-600 hover:underline font-medium">términos y condiciones</a>
                {' '}y la{' '}
                <a href="#" className="text-teal-600 hover:underline font-medium">política de privacidad</a>
              </span>
            </label>
            {errors.terms && <p className="field-error">Debes aceptar los términos</p>}

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}
              iconRight={<ArrowRight size={16} />} className="mt-1">
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
