import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  whatsapp: string;
};

export const SignUpStep1Page = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: '', password: '', full_name: '', whatsapp: '' },
  });
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    setError(null);
    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      // Guardar datos temporales en sessionStorage
      sessionStorage.setItem('signupStep1', JSON.stringify({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        whatsapp: data.whatsapp,
      }));

      navigate('/auth/signup-step2');
    } catch (err: any) {
      setError(err.message || 'Error al guardar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-[44%] bg-navy-700 flex-col relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-12 left-12 w-60 h-60 bg-navy-800/60 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Logo size="md" light />

          <div className="flex-1 flex flex-col justify-center max-w-xs mt-10">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-2xl mb-6">📝</div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Registro en 2 pasos
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Paso 1: Datos personales. Paso 2: Información de tu empresa.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                <span className="text-slate-200 text-sm font-medium">Datos personales (ahora)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                <span className="text-slate-400 text-sm">Datos de empresa</span>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-xs">© 2026 TARUK · RUCASH</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-slate-50 overflow-y-auto py-10">
        <div className="lg:hidden mb-6"><Logo size="sm" /></div>

        <div className="w-full max-w-md mx-auto animate-slide-up">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Crear cuenta</h2>
            <p className="text-slate-500 text-sm">Paso 1 de 2: Completa tus datos personales</p>
          </div>

          {error && (
            <div className="alert-error mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Nombre completo"
              required
              placeholder="Juan Pérez"
              icon={<User size={16} />}
              {...register('full_name', { required: 'Nombre requerido' })}
              error={errors.full_name?.message}
            />

            <Input
              label="Email"
              required
              type="email"
              placeholder="tu@email.com"
              icon={<Mail size={16} />}
              {...register('email', { required: 'Email requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
              error={errors.email?.message}
            />

            <Input
              label="WhatsApp"
              required
              type="tel"
              placeholder="+51 999 999 999"
              icon={<Phone size={16} />}
              {...register('whatsapp', { required: 'WhatsApp requerido' })}
              error={errors.whatsapp?.message}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Input
              label="Confirmar contraseña"
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              {...register('confirmPassword', { required: 'Confirma tu contraseña' })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Siguiente paso'} <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-slate-600 text-sm mt-6">
            ¿Ya tienes cuenta? <a href="/auth/login" className="text-teal-500 font-medium hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
};
