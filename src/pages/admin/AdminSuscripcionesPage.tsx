import { useState, useEffect } from 'react';
import { Plus, Edit2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { AppLayout } from '../../components/Layout/AppLayout';
import { api } from '../../services/api';

interface Suscripcion {
  id: string;
  cliente_id: string;
  plan: string;
  estado: string;
  fecha_vencimiento: string;
  clientes?: { nombre: string };
}

export const AdminSuscripcionesPage = () => {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSuscripciones = async () => {
      try {
        const response = await api.get('/suscripciones/todas');
        setSuscripciones(response.data.suscripciones || []);
      } catch (err) {
        setError('Error al cargar suscripciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadSuscripciones();
  }, []);

  const handleBloquear = async (clienteId: string) => {
    try {
      await api.patch(`/suscripciones/${clienteId}`, { estado: 'BLOQUEADO' });
      setSuscripciones(prev =>
        prev.map(s => s.cliente_id === clienteId ? { ...s, estado: 'BLOQUEADO' } : s)
      );
    } catch (err) {
      setError('Error al bloquear suscripción');
    }
  };

  if (isLoading) {
    return <AppLayout><div className="p-6">Cargando...</div></AppLayout>;
  }

  const columns = [
    { key: 'clientes', label: 'Empresa', render: (s: Suscripcion) => s.clientes?.nombre || 'N/A' },
    { key: 'plan', label: 'Plan' },
    { key: 'estado', label: 'Estado', render: (s: Suscripcion) => (
      <span className={`badge ${s.estado === 'ACTIVO' ? 'badge-success' : 'badge-warning'}`}>
        {s.estado}
      </span>
    )},
    { key: 'fecha_vencimiento', label: 'Vencimiento', render: (s: Suscripcion) => new Date(s.fecha_vencimiento).toLocaleDateString() },
  ];

  return (
    <AppLayout>
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Suscripciones</h1>
          <p className="text-slate-600 mt-2">Administra las suscripciones de todos los clientes</p>
        </div>
        <Button variant="primary">
          <Plus size={16} /> Nueva suscripción
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
          columns={columns}
          data={suscripciones}
          actions={(s) => [
            { label: 'Editar', icon: Edit2, onClick: () => {} },
            { label: 'Bloquear', icon: Lock, onClick: () => handleBloquear(s.cliente_id), variant: 'danger' },
          ]}
        />
      </Card>
    </div>
    </AppLayout>
  );
};
