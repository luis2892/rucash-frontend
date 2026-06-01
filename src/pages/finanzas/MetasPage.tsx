import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { Plus, Edit2, Trash2, X, Target, TrendingUp } from 'lucide-react';

interface Meta {
  id: string;
  nombre: string;
  tipo: 'VENTA_DIARIA' | 'VENTA_MENSUAL' | 'GANANCIA' | 'CLIENTES_NUEVOS';
  valor_objetivo: number;
  valor_actual: number;
  porcentaje_cumplimiento: number;
  estado: 'ACTIVA' | 'CUMPLIDA' | 'NO_CUMPLIDA' | 'CANCELADA';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  fecha_inicio: string;
  fecha_fin: string;
}

interface Resumen {
  total_metas: number;
  metas_completadas: number;
  porcentaje_cumplimiento_general: number;
}

const TIPOS_META = [
  { value: 'VENTA_DIARIA', label: 'Venta Diaria' },
  { value: 'VENTA_MENSUAL', label: 'Venta Mensual' },
  { value: 'GANANCIA', label: 'Ganancia' },
  { value: 'CLIENTES_NUEVOS', label: 'Clientes Nuevos' },
];

const PRIORIDADES = [
  { value: 'ALTA', label: 'Alta', color: 'bg-red-100 text-red-700' },
  { value: 'MEDIA', label: 'Media', color: 'bg-amber-100 text-amber-700' },
  { value: 'BAJA', label: 'Baja', color: 'bg-green-100 text-green-700' },
];

export const MetasPage = () => {
  const [step, setStep] = useState<'lista' | 'wizard'>('lista');
  const [metas, setMetas] = useState<Meta[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);

  const cargarMetas = async () => {
    setLoading(true);
    try {
      const [respMetas, respResumen] = await Promise.all([
        api.get('/metas'),
        api.get('/metas/analisis/resumen'),
      ]);
      setMetas(respMetas.data.metas || []);
      setResumen(respResumen.data.resumen);
    } catch (error) {
      console.error('Error cargando metas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetas();
  }, []);

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    try {
      await api.delete(`/metas/${id}`);
      cargarMetas();
    } catch (error) {
      console.error('Error eliminando meta:', error);
    }
  };

  const getColorEstado = (estado: string) => {
    if (estado === 'CUMPLIDA') return 'bg-green-100 text-green-700';
    if (estado === 'NO_CUMPLIDA') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {step === 'lista' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Metas de Negocio</h1>
                <p className="text-sm text-slate-500 mt-0.5">Establece y monitorea tus objetivos</p>
              </div>
              <button
                onClick={() => { setEditingMeta(null); setStep('wizard'); }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Nueva Meta
              </button>
            </div>

            {/* Resumen */}
            {resumen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card-p">
                  <p className="text-xs text-slate-500 mb-1">Total de Metas</p>
                  <p className="text-2xl font-bold text-slate-900">{resumen.total_metas}</p>
                </div>
                <div className="card-p">
                  <p className="text-xs text-slate-500 mb-1">Metas Cumplidas</p>
                  <p className="text-2xl font-bold text-green-600">{resumen.metas_completadas}</p>
                </div>
                <div className="card-p">
                  <p className="text-xs text-slate-500 mb-1">Cumplimiento General</p>
                  <p className="text-2xl font-bold text-teal-600">{resumen.porcentaje_cumplimiento_general.toFixed(1)}%</p>
                </div>
              </div>
            )}

            {/* Tabla */}
            <div className="card-p overflow-hidden p-0">
              {loading ? (
                <div className="text-center py-12 text-slate-400">Cargando...</div>
              ) : metas.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No hay metas</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Nombre</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Tipo</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Objetivo</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Actual</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Progreso</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Estado</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metas.map(meta => (
                        <tr key={meta.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{meta.nombre}</p>
                            <p className="text-2xs text-slate-500 mt-0.5">
                              {new Date(meta.fecha_inicio).toLocaleDateString()} → {new Date(meta.fecha_fin).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {TIPOS_META.find(t => t.value === meta.tipo)?.label}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">
                            ${meta.valor_objetivo.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            ${meta.valor_actual.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-teal-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(meta.porcentaje_cumplimiento, 100)}%` }}
                              />
                            </div>
                            <p className="text-2xs text-slate-500 text-center mt-1">
                              {meta.porcentaje_cumplimiento.toFixed(1)}%
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`badge text-2xs ${getColorEstado(meta.estado)}`}>
                              {meta.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => eliminar(meta.id)}
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
          </>
        ) : (
          <MetaWizard
            meta={editingMeta}
            onClose={() => setStep('lista')}
            onSave={() => { setStep('lista'); cargarMetas(); }}
          />
        )}
      </div>
    </AppLayout>
  );
};

interface MetaWizardProps {
  meta: Meta | null;
  onClose: () => void;
  onSave: () => void;
}

const MetaWizard = ({ meta, onClose, onSave }: MetaWizardProps) => {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState({
    nombre: meta?.nombre || '',
    tipo: (meta?.tipo || 'VENTA_MENSUAL') as string,
    valor_objetivo: meta?.valor_objetivo?.toString() || '',
    fecha_inicio: meta?.fecha_inicio || new Date().toISOString().split('T')[0],
    fecha_fin: meta?.fecha_fin || '',
    prioridad: (meta?.prioridad || 'MEDIA') as string,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (meta) {
        await api.put(`/metas/${meta.id}`, form);
      } else {
        await api.post('/metas', { ...form, usuario_id: 'current-user', valor_objetivo: parseFloat(form.valor_objetivo) });
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const isComplete = form.nombre && form.valor_objetivo && form.fecha_inicio && form.fecha_fin;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {meta ? 'Editar Meta' : 'Crear Nueva Meta'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Pasos */}
        <div className="bg-slate-50 px-5 py-3 flex items-center justify-between border-b border-slate-200">
          {[1, 2, 3, 4].map(p => (
            <div key={p} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                paso === p ? 'bg-teal-600 text-white' :
                p < paso ? 'bg-green-600 text-white' :
                'bg-slate-200 text-slate-600'
              }`}>
                {p < paso ? '✓' : p}
              </div>
              {p < 4 && <div className={`w-8 h-0.5 ${p < paso ? 'bg-green-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Paso 1: Tipo */}
          {paso === 1 && (
            <div>
              <label className="text-sm font-bold text-slate-900 mb-3 block">¿Qué tipo de meta?</label>
              <div className="space-y-2">
                {TIPOS_META.map(tipo => (
                  <label key={tipo.value} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo.value}
                      checked={form.tipo === tipo.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-slate-900">{tipo.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Paso 2: Objetivo */}
          {paso === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre de la Meta *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="ej: Vender $5000 este mes"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Objetivo Numérico *</label>
                <input
                  type="number"
                  name="valor_objetivo"
                  value={form.valor_objetivo}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="ej: 5000"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Paso 3: Período */}
          {paso === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Fecha Fin *</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Paso 4: Prioridad */}
          {paso === 4 && (
            <div>
              <label className="text-sm font-bold text-slate-900 mb-3 block">Prioridad</label>
              <div className="space-y-2">
                {PRIORIDADES.map(pri => (
                  <label key={pri.value} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="prioridad"
                      value={pri.value}
                      checked={form.prioridad === pri.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className={`badge ${pri.color} text-2xs`}>{pri.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => paso > 1 && setPaso(paso - 1)}
              disabled={paso === 1}
              className="flex-1 btn-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            {paso < 4 ? (
              <button
                type="button"
                onClick={() => setPaso(paso + 1)}
                className="flex-1 btn-primary"
              >
                Siguiente
              </button>
            ) : (
              <>
                <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !isComplete}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear Meta'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
