import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';

interface Marca {
  id: string;
  nombre: string;
  descripcion?: string;
  logo_url?: string;
  activo: boolean;
}

export const MarcasPage = () => {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/marcas');
      setMarcas(response.data.marcas || []);
    } catch (error) {
      console.error('Error cargando marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta marca?')) return;
    try {
      await api.delete(`/marcas/${id}`);
      cargarMarcas();
    } catch (error) {
      console.error('Error eliminando marca:', error);
    }
  };

  const toggleActivo = async (marca: Marca) => {
    try {
      await api.put(`/marcas/${marca.id}`, { activo: !marca.activo });
      cargarMarcas();
    } catch (error) {
      console.error('Error actualizando marca:', error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Marcas</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestión de marcas de productos</p>
          </div>
          <button
            onClick={() => { setEditingMarca(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva Marca
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-400">Cargando...</div>
          ) : marcas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">No hay marcas</div>
          ) : (
            marcas.map(marca => (
              <div
                key={marca.id}
                className={`card-p flex items-start justify-between transition-opacity ${!marca.activo ? 'opacity-50' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={16} className="text-teal-600" />
                    <h3 className="font-bold text-slate-900">{marca.nombre}</h3>
                  </div>
                  {marca.descripcion && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{marca.descripcion}</p>
                  )}
                  {marca.logo_url && (
                    <div className="mb-3">
                      <img
                        src={marca.logo_url}
                        alt={marca.nombre}
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActivo(marca)}
                      className={`text-xs px-2 py-1 rounded ${
                        marca.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {marca.activo ? '✓ Activa' : 'Inactiva'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => { setEditingMarca(marca); setShowModal(true); }}
                    className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => eliminar(marca.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <MarcaModal
            marca={editingMarca}
            onClose={() => setShowModal(false)}
            onSave={() => { setShowModal(false); cargarMarcas(); }}
          />
        )}
      </div>
    </AppLayout>
  );
};

interface MarcaModalProps {
  marca: Marca | null;
  onClose: () => void;
  onSave: () => void;
}

const MarcaModal = ({ marca, onClose, onSave }: MarcaModalProps) => {
  const [form, setForm] = useState({
    nombre: marca?.nombre || '',
    descripcion: marca?.descripcion || '',
    logo_url: marca?.logo_url || '',
    activo: marca?.activo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (marca) {
        await api.put(`/marcas/${marca.id}`, form);
      } else {
        await api.post('/marcas', form);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {marca ? 'Editar Marca' : 'Nueva Marca'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">URL del Logo</label>
            <input
              type="url"
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {form.logo_url && (
              <img src={form.logo_url} alt="Preview" className="h-12 mt-2 object-contain" onError={() => {}} />
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label className="text-sm font-medium text-teal-900 cursor-pointer">
              Marca activa
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Guardando...' : marca ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
