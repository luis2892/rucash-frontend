import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ResponsiveModal } from '../../components/ui/ResponsiveModal';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { AppLayout } from '../../components/Layout/AppLayout';
import { api } from '../../services/api';

interface Proveedor {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  activo: boolean;
}

export const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Proveedor>();

  useEffect(() => {
    const loadProveedores = async () => {
      try {
        const response = await api.get('/proveedores');
        setProveedores(response.data.proveedores || []);
      } catch (err) {
        setError('Error al cargar proveedores');
      } finally {
        setIsLoading(false);
      }
    };

    loadProveedores();
  }, []);

  const onSubmit = async (data: Proveedor) => {
    try {
      if (editingId) {
        const response = await api.patch(`/proveedores/${editingId}`, data);
        setProveedores(prev => prev.map(p => p.id === editingId ? response.data.proveedor : p));
      } else {
        const response = await api.post('/proveedores', data);
        setProveedores([...proveedores, response.data.proveedor]);
      }
      setIsModalOpen(false);
      reset();
      setEditingId(null);
    } catch (err) {
      setError('Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;

    try {
      await api.delete(`/proveedores/${id}`);
      setProveedores(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Error al eliminar proveedor');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-slate-400 text-sm">Cargando proveedores...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-600 mt-2">Gestiona tu lista de proveedores</p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setIsModalOpen(true); reset(); setEditingId(null); }}
        >
          <Plus size={16} /> Nuevo proveedor
        </Button>
      </div>

      {error && (
        <div className="alert-error mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Card className="p-6">
        <ResponsiveTable
          columns={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'email', label: 'Email' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'ciudad', label: 'Ciudad' },
          ]}
          data={proveedores.filter(p => p.activo)}
          actions={(p) => [
            {
              label: 'Editar',
              icon: Edit2,
              onClick: () => {
                reset(p);
                setEditingId(p.id);
                setIsModalOpen(true);
              },
            },
            {
              label: 'Eliminar',
              icon: Trash2,
              onClick: () => handleDelete(p.id),
              variant: 'danger',
            },
          ]}
        />
      </Card>

      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar proveedor' : 'Nuevo proveedor'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            required
            {...register('nombre', { required: 'Nombre requerido' })}
            error={errors.nombre?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Teléfono"
            {...register('telefono')}
            error={errors.telefono?.message}
          />
          <Input
            label="Ciudad"
            {...register('ciudad')}
            error={errors.ciudad?.message}
          />

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
    </AppLayout>
  );
};
