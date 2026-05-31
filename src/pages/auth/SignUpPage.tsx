import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { SignUpPayload } from '../../types';
import { Mail, Lock, User, Phone, AlertCircle, Loader } from 'lucide-react';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpPayload & { confirmPassword: string }>({
    defaultValues: { email: '', password: '', full_name: '', whatsapp: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: SignUpPayload & { confirmPassword: string }) => {
    try {
      if (!acceptedTerms) {
        setLocalError('Debes aceptar los términos y condiciones');
        return;
      }
      setLocalError(null);
      clearError();
      const { confirmPassword, ...payload } = data;
      await signup(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">💰 RUCASH</h1>
          <p className="text-gray-600">Tu RUC, Tu Negocio</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Crear Cuenta
          </h2>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error || localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('full_name', {
                    required: 'El nombre es requerido',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  })}
                  type="text"
                  placeholder="Juan Pérez"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email inválido',
                    },
                  })}
                  type="email"
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('whatsapp', {
                    required: 'El WhatsApp es requerido',
                    pattern: {
                      value: /^[0-9+\-() ]+$/,
                      message: 'Formato de teléfono inválido',
                    },
                  })}
                  type="tel"
                  placeholder="+51 987 654 321"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Debe incluir mayúsculas, minúsculas y números',
                    },
                  })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: (value) =>
                      value === password || 'Las contraseñas no coinciden',
                  })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded mt-1"
              />
              <span className="text-sm text-gray-600">
                Acepto los términos y condiciones
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !acceptedTerms}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-gray-600 text-sm">
          © 2026 RUCASH. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
