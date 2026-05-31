import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ResponsiveModal } from '../../components/ui/ResponsiveModal';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { api } from '../../services/api';

interface Cuenta {
  id: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  saldo: number;
  moneda: string;
  activo: boolean;
}

export const CuentasPage = () => {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Cuenta>();

  useEffect(() => {
    const loadCuentas = async () => {
      try {
        const response = await api.get('/finanzas/cuentas');
        setCuentas(response.data.cuentas || []);
      } catch (err) {
        setError('Error al cargar cuentas');
      } finally {
        setIsLoading(false);
      }
    };

    loadCuentas();
  }, []);

  const onSubmit = async (data: Cuenta) => {
    try {
      if (editingId) {
        const response = await api.patch(`/finanzas/cuentas/${editingId}`, data);
        setCuentas(prev => prev.map(c => c.id === editingId ? response.data.cuenta : c));
      } else {
        const response = await api.post('/finanzas/cuentas', data);
        setCuentas([...cuentas, response.data.cuenta]);
      }
      setIsModalOpen(false);
      reset();
      setEditingId(null);
    } catch (err) {
      setError('Error al guardar cuenta');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta cuenta?')) return;

    try {
      await api.patch(`/finanzas/cuentas/${id}`, { activo: false });
      setCuentas(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError('Error al eliminar cuenta');
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  const totalBalance = cuentas
    .filter(c => c.activo)
    .reduce((sum, c) => sum + c.saldo, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign size={32} className="text-teal-500" />
          Cuentas Bancarias
        </h1>
        <p className="text-slate-600 mt-2">Gestiona tus cuentas y saldos</p>
      </div>

      {error && (
        <div className="alert-error mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="text-slate-600 text-sm mb-2">Saldo Total</div>
          <div className="text-3xl font-bold text-slate-900">${totalBalance.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-2">{cuentas.filter(c => c.activo).length} cuentas activas</div>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Mis Cuentas</h2>
          <Button
            variant="primary"
            onClick={() => { setIsModalOpen(true); reset(); setEditingId(null); }}
          >
            <Plus size={16} /> Nueva cuenta
          </Button>
        </div>

        <ResponsiveTable
          columns={[
            { key: 'banco', label: 'Banco' },
            { key: 'tipo_cuenta', label: 'Tipo' },
            { key: 'numero_cuenta', label: 'Número' },
            { key: 'saldo', label: 'Saldo', render: (c: Cuenta) => `${c.moneda} ${c.saldo.toFixed(2)}` },
          ]}
          data={cuentas.filter(c => c.activo)}
          actions={(c) => [
            {
              label: 'Editar',
              icon: Edit2,
              onClick: () => {
                reset(c);
                setEditingId(c.id);
                setIsModalOpen(true);
              },
            },
            {
              label: 'Eliminar',
              icon: Trash2,
              onClick: () => handleDelete(c.id),
              variant: 'danger',
            },
          ]}
        />
      </Card>

      {/* Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar cuenta' : 'Nueva cuenta'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Banco"
            required
            {...register('banco', { required: 'Banco requerido' })}
            error={errors.banco?.message}
          />
          <select
            {...register('tipo_cuenta', { required: true })}
            className="input-field"
          >
            <option value="">Selecciona tipo</option>
            <option value="AHORRO">Ahorro</option>
            <option value="CORRIENTE">Corriente</option>
          </select>
          <Input
            label="Número de cuenta"
            {...register('numero_cuenta', { required: 'Número requerido' })}
            error={errors.numero_cuenta?.message}
          />
          <Input
            label="Saldo inicial"
            type="number"
            step="0.01"
            {...register('saldo', { valueAsNumber: true })}
            error={errors.saldo?.message}
          />
          <select
            {...register('moneda')}
            className="input-field"
          >
            <option value="USD">USD</option>
            <option value="SOL">SOL</option>
          </select>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              Guardar
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
};
