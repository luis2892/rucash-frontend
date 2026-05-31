import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/api';

type ConfigData = {
  nombre_empresa: string;
  numero_whatsapp: string;
  numero_whatsapp_alternativo: string;
  email_soporte: string;
  telefono_soporte: string;
  precio_hobby_mensual: number;
  precio_pro_mensual: number;
  precio_pro_anual: number;
  precio_enterprise_mensual: number;
  precio_enterprise_anual: number;
};

export const AdminConfigPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConfigData>();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await api.get('/config/sistema');
        const config = response.data.config || {};
        reset(config);
      } catch (err) {
        setError('Error al cargar configuración');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [reset]);

  const onSubmit = async (data: ConfigData) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await api.patch('/config/sistema', data);
      setSuccess('Configuración actualizada correctamente');
      reset(response.data.config);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={32} className="text-teal-500" />
          Configuración del Sistema
        </h1>
        <p className="text-slate-600 mt-2">Solo administrador: Configura precios, contacto y empresa</p>
      </div>

      {error && (
        <div className="alert-error mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert-success mb-6">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Empresa */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Información de Empresa</h2>
          <div className="space-y-4">
            <Input
              label="Nombre de empresa"
              {...register('nombre_empresa')}
              error={errors.nombre_empresa?.message}
            />
          </div>
        </Card>

        {/* Contacto */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Principal"
              placeholder="+51 999 999 999"
              {...register('numero_whatsapp')}
              error={errors.numero_whatsapp?.message}
            />
            <Input
              label="WhatsApp Alternativo"
              placeholder="+51 999 999 999"
              {...register('numero_whatsapp_alternativo')}
              error={errors.numero_whatsapp_alternativo?.message}
            />
            <Input
              label="Email de soporte"
              type="email"
              {...register('email_soporte')}
              error={errors.email_soporte?.message}
            />
            <Input
              label="Teléfono de soporte"
              {...register('telefono_soporte')}
              error={errors.telefono_soporte?.message}
            />
          </div>
        </Card>

        {/* Precios */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Planes y Precios</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Plan Hobby</h3>
              <Input
                label="Precio mensual"
                type="number"
                step="0.01"
                {...register('precio_hobby_mensual', { valueAsNumber: true })}
                error={errors.precio_hobby_mensual?.message}
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Plan Pro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Precio mensual"
                  type="number"
                  step="0.01"
                  {...register('precio_pro_mensual', { valueAsNumber: true })}
                  error={errors.precio_pro_mensual?.message}
                />
                <Input
                  label="Precio anual"
                  type="number"
                  step="0.01"
                  {...register('precio_pro_anual', { valueAsNumber: true })}
                  error={errors.precio_pro_anual?.message}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Plan Enterprise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Precio mensual"
                  type="number"
                  step="0.01"
                  {...register('precio_enterprise_mensual', { valueAsNumber: true })}
                  error={errors.precio_enterprise_mensual?.message}
                />
                <Input
                  label="Precio anual"
                  type="number"
                  step="0.01"
                  {...register('precio_enterprise_anual', { valueAsNumber: true })}
                  error={errors.precio_enterprise_anual?.message}
                />
              </div>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  );
};
