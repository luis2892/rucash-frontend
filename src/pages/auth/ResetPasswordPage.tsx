import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface ResetPasswordForm { password: string; confirmPassword: string; }

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = watch('password');

  useEffect(() => { if (!token) setError('Token no proporcionado'); }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;
    setIsLoading(true); setError(null);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error reseteando contraseña');
    } finally { setIsLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contraseña Actualizada</h2>
            <p className="text-gray-600">Serás redirigido al login en 3 segundos...</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nueva Contraseña</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!error && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    {...register('password', { required: 'Contraseña requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                    type="password" placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    {...register('confirmPassword', { required: 'Confirma tu contraseña', validate: v => v === password || 'Las contraseñas no coinciden' })}
                    type="password" placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
                {isLoading ? <><Loader size={20} className="animate-spin" /> Actualizando...</> : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
