import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { Building2, Hash, MapPin, Briefcase, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';

type FormData = {
  empresa_nombre: string;
  ruc: string;
  industria: string;
  provincia: string;
  ciudad: string;
};

export const SignUpStep2Page = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { empresa_nombre: '', ruc: '', industria: '', provincia: '', ciudad: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLocalError(null);
    clearError();

    try {
      const step1Data = sessionStorage.getItem('signupStep1');
      if (!step1Data) {
        setLocalError('Datos del paso anterior no encontrados. Comienza nuevamente.');
        navigate('/auth/signup-step1');
        return;
      }

      const step1 = JSON.parse(step1Data);
      const payload = { ...step1, ...data };

      // Hacer signup completo
      const response = await useAuthStore.getState().signup(payload);

      // Guardar empresa config
      const clienteId = useAuthStore.getState().cliente?.id;
      if (clienteId) {
        await fetch('/api/config/empresa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore.getState().accessToken}`,
          },
          body: JSON.stringify({
            moneda_preferida: 'USD',
            provincia: data.provincia,
            ciudad: data.ciudad,
            industria: data.industria,
          }),
        });
      }

      sessionStorage.removeItem('signupStep1');
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Error al completar registro');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-[44%] bg-navy-700 flex-col relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-12 left-12 w-60 h-60 bg-navy-800/60 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <Logo size="md" light />

          <div className="flex-1 flex flex-col justify-center max-w-xs mt-10">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-2xl mb-6">🏢</div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Información de empresa
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Completa los datos de tu negocio para finalizar el registro.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                <span className="text-slate-400 text-sm">Datos personales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                <span className="text-slate-200 text-sm font-medium">Datos de empresa (ahora)</span>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Información de empresa</h2>
            <p className="text-slate-500 text-sm">Paso 2 de 2: Detalles de tu negocio</p>
          </div>

          {displayError && (
            <div className="alert-error mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Nombre de empresa"
              required
              placeholder="Mi tienda"
              icon={<Building2 size={16} />}
              {...register('empresa_nombre', { required: 'Nombre requerido' })}
              error={errors.empresa_nombre?.message}
            />

            <Input
              label="RUC"
              required
              placeholder="12345678901"
              icon={<Hash size={16} />}
              {...register('ruc', { required: 'RUC requerido' })}
              error={errors.ruc?.message}
            />

            <Input
              label="Industria"
              required
              placeholder="Retail, Alimentos, etc"
              icon={<Briefcase size={16} />}
              {...register('industria', { required: 'Industria requerida' })}
              error={errors.industria?.message}
            />

            <Input
              label="Provincia"
              required
              placeholder="Lima"
              icon={<MapPin size={16} />}
              {...register('provincia', { required: 'Provincia requerida' })}
              error={errors.provincia?.message}
            />

            <Input
              label="Ciudad"
              required
              placeholder="Lima"
              {...register('ciudad', { required: 'Ciudad requerida' })}
              error={errors.ciudad?.message}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Completando...' : 'Completar registro'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/auth/signup-step1')}
            >
              <ArrowLeft size={16} /> Volver al paso anterior
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
