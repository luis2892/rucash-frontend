import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Mail, AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface ForgotPasswordForm { email: string; }

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error enviando email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Enviado</h2>
            <p className="text-gray-600 mb-6">
              Revisa tu email para el enlace de reset. El enlace expira en 1 hora.
            </p>
            <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">💰 RUCASH</h1>
          <p className="text-gray-600">Tu RUC, Tu Negocio</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Recuperar Contraseña
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                  })}
                  type="email"
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader size={20} className="animate-spin" /> Enviando...</> : 'Enviar Email de Reset'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            <Link to="/login" className="text-indigo-600 hover:underline">Volver al login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
