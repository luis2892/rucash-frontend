import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

interface Form { password: string; confirmPassword: string; }

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({ defaultValues: { password: '', confirmPassword: '' } });
  const password = watch('password');

  useEffect(() => { if (!token) setError('Token inválido o expirado'); }, [token]);

  const onSubmit = async (data: Form) => {
    if (!token) return;
    setIsLoading(true); setError(null);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e: any) { setError(e.response?.data?.message || 'Error actualizando contraseña'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4">
      <div className="w-full max-w-sm mx-auto animate-slide-up">
        <div className="mb-8 flex justify-center"><Logo size="md" /></div>

        {success ? (
          <div className="card-p text-center">
            <CheckCircle2 className="mx-auto mb-4 text-teal-500" size={48} />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Contraseña actualizada</h2>
            <p className="text-slate-500 text-sm">Redirigiendo al login en unos segundos...</p>
          </div>
        ) : (
          <div className="card-p">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nueva contraseña</h2>
            <p className="text-slate-500 text-sm mb-6">Elige una contraseña segura para tu cuenta.</p>

            {error && !token && (
              <div className="alert-error mb-5">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {token && (
              <>
                {error && <div className="alert-error mb-5"><AlertCircle size={16} className="flex-shrink-0" /><span>{error}</span></div>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <Input label="Nueva contraseña" type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres" icon={<Lock size={16} />}
                    iconRight={<button type="button" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                    error={errors.password?.message}
                    {...register('password', { required: 'Requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                  />
                  <Input label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" icon={<Lock size={16} />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', { required: 'Confirma tu contraseña', validate: v => v === password || 'No coinciden' })}
                  />
                  <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </Button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
