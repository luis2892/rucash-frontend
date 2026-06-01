import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { Plus, Edit2, Trash2, X, Settings } from 'lucide-react';

interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
  permite_edicion_almacenero?: boolean;
}

export const CategoriasPage = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      cargarCategorias();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestión de categorías de productos</p>
          </div>
          <button
            onClick={() => { setEditingCategoria(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva Categoría
          </button>
        </div>

        {/* Tabla */}
        <div className="card-p overflow-hidden p-0">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Cargando...</div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No hay categorías</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Icono</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Color</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Edición Almacenero</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map(categoria => (
                    <tr key={categoria.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{categoria.nombre}</td>
                      <td className="px-4 py-3 text-slate-600">{categoria.icono || '—'}</td>
                      <td className="px-4 py-3">
                        {categoria.color ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border border-slate-200"
                              style={{ backgroundColor: categoria.color }}
                            />
                            <code className="text-2xs text-slate-500">{categoria.color}</code>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {categoria.permite_edicion_almacenero ? (
                          <span className="badge badge-teal text-2xs">✓ Permitido</span>
                        ) : (
                          <span className="badge badge-slate text-2xs">Solo ADMIN</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setEditingCategoria(categoria); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => eliminar(categoria.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <CategoriaModal
            categoria={editingCategoria}
            onClose={() => setShowModal(false)}
            onSave={() => { setShowModal(false); cargarCategorias(); }}
          />
        )}
      </div>
    </AppLayout>
  );
};

interface CategoriaModalProps {
  categoria: Categoria | null;
  onClose: () => void;
  onSave: () => void;
}

const CategoriaModal = ({ categoria, onClose, onSave }: CategoriaModalProps) => {
  const [form, setForm] = useState({
    nombre: categoria?.nombre || '',
    icono: categoria?.icono || '',
    color: categoria?.color || '',
    permite_edicion_almacenero: categoria?.permite_edicion_almacenero || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (categoria) {
        await api.put(`/categorias/${categoria.id}`, form);
      } else {
        await api.post('/categorias', form);
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
            {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
            <label className="text-xs font-medium text-slate-600 mb-1 block">Icono (emoji)</label>
            <input
              type="text"
              name="icono"
              value={form.icono}
              onChange={handleChange}
              placeholder="ej: 📦"
              maxLength={5}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Color Hex</label>
            <div className="flex gap-2">
              <input
                type="color"
                name="color"
                value={form.color || '#000000'}
                onChange={handleChange}
                className="w-12 h-10 border border-slate-200 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="#000000"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <input
              type="checkbox"
              name="permite_edicion_almacenero"
              checked={form.permite_edicion_almacenero}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label className="text-sm font-medium text-teal-900 cursor-pointer">
              Permitir edición a usuarios ALMACENERO
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
