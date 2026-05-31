import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

interface Form { email: string; }

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ defaultValues: { email: '' } });

  const onSubmit = async (data: Form) => {
    setIsLoading(true); setError(null);
    try { await api.post('/auth/forgot-password', data); setSuccess(true); }
    catch (e: any) { setError(e.response?.data?.message || 'Error enviando email'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4">
      <div className="w-full max-w-sm mx-auto animate-slide-up">
        <div className="mb-8 flex justify-center"><Logo size="md" /></div>

        {success ? (
          <div className="card-p text-center">
            <CheckCircle2 className="mx-auto mb-4 text-teal-500" size={48} />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Revisa tu email</h2>
            <p className="text-slate-500 text-sm mb-6">
              Si el email existe en nuestro sistema, recibirás un enlace de recuperación. Expira en 1 hora.
            </p>
            <Link to="/login" className="text-teal-600 hover:text-teal-700 text-sm font-semibold transition-colors">
              Volver al login
            </Link>
          </div>
        ) : (
          <div className="card-p">
            <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-6 transition-colors">
              <ArrowLeft size={14} /> Volver al login
            </Link>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Recuperar contraseña</h2>
            <p className="text-slate-500 text-sm mb-6">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

            {error && (
              <div className="alert-error mb-5">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input label="Email" type="email" placeholder="tu@empresa.com" icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email', { required: 'El email es requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
              />
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
