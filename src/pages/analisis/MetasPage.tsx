import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ResponsiveModal } from '../../components/ui/ResponsiveModal';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { Plus, Target, CheckCircle2, TrendingUp, AlertCircle, History } from 'lucide-react';

interface Meta {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  categoria?: string;
  valor_objetivo: number;
  valor_actual: number;
  porcentaje_cumplimiento: number;
  fecha_inicio: string;
  fecha_fin: string;
  prioridad: number;
  estado: string;
  usuario_id?: string;
}

const TIPOS = ['DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL'];
const CATEGORIAS = ['VENTAS', 'MARGEN', 'PRODUCTOS', 'CLIENTES'];
const TIPO_COLOR: Record<string, string> = {
  DIARIA: 'badge-teal', SEMANAL: 'badge-navy',
  MENSUAL: 'badge-warning', ANUAL: 'badge-neutral',
};

const ProgressBar = ({ pct, size = 'md' }: { pct: number; size?: 'sm' | 'md' }) => {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-teal-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className={`w-full bg-slate-100 rounded-full ${h} overflow-hidden`}>
      <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
};

export const MetasPage = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMovModal, setShowMovModal] = useState<Meta | null>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [form, setForm] = useState({
    nombre: '', descripcion: '', tipo: 'MENSUAL', categoria: 'VENTAS',
    valor_objetivo: '', fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    prioridad: '1', notas: '',
  });
  const [movForm, setMovForm] = useState({ valor_nuevo: '', descripcion: '' });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar todas las metas para calcular resumen (no existe /metas/analisis/resumen en backend)
      const [mRes, todasRes] = await Promise.all([
        api.get('/metas', { params: { tipo: filtroTipo || undefined } }),
        api.get('/metas'),
      ]);
      const listaMetas: Meta[] = mRes.data.metas || [];
      const todasMetas: Meta[] = todasRes.data.metas || [];
      setMetas(listaMetas);

      // Calcular resumen client-side
      const completadas = todasMetas.filter(m => m.estado === 'COMPLETADA' || m.porcentaje_cumplimiento >= 100).length;
      const cumplimiento = todasMetas.length > 0
        ? todasMetas.reduce((s, m) => s + (m.porcentaje_cumplimiento || 0), 0) / todasMetas.length
        : 0;
      setResumen({
        total_metas: todasMetas.length,
        metas_completadas: completadas,
        porcentaje_cumplimiento_general: cumplimiento,
        metas_por_tipo: {
          diarias: todasMetas.filter(m => m.tipo === 'DIARIA').length,
          semanales: todasMetas.filter(m => m.tipo === 'SEMANAL').length,
          mensuales: todasMetas.filter(m => m.tipo === 'MENSUAL').length,
          anuales: todasMetas.filter(m => m.tipo === 'ANUAL').length,
        },
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filtroTipo]);

  useEffect(() => { cargar(); }, [cargar]);

  const crearMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/metas', { ...form, valor_objetivo: parseFloat(form.valor_objetivo), prioridad: parseInt(form.prioridad) });
      setShowModal(false);
      setForm({ nombre: '', descripcion: '', tipo: 'MENSUAL', categoria: 'VENTAS', valor_objetivo: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        prioridad: '1', notas: '' });
      cargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const registrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMovModal) return;
    setSaving(true);
    try {
      await api.post(`/metas/${showMovModal.id}/movimiento`, {
        valor_nuevo: parseFloat(movForm.valor_nuevo),
        descripcion: movForm.descripcion,
      });
      setShowMovModal(null);
      setMovForm({ valor_nuevo: '', descripcion: '' });
      cargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const verMovimientos = async (meta: Meta) => {
    try {
      const res = await api.get(`/metas/${meta.id}/movimientos`);
      setMovimientos(res.data.movimientos || []);
    } catch (e) { setMovimientos([]); }
    setShowMovModal(meta);
  };

  const metasFiltradas = filtroTipo ? metas.filter(m => m.tipo === filtroTipo) : metas;
  const cumplimiento = resumen?.porcentaje_cumplimiento_general || 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Metas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control de objetivos y seguimiento</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary btn-md flex items-center gap-2">
          <Plus size={18} /> Nueva Meta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Metas', value: resumen?.total_metas || 0, icon: Target, color: 'text-navy-700', bg: 'bg-blue-50' },
          { label: 'Completadas', value: resumen?.metas_completadas || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'En Progreso', value: (resumen?.total_metas || 0) - (resumen?.metas_completadas || 0), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Cumplimiento', value: `${cumplimiento.toFixed(0)}%`, icon: AlertCircle, color: cumplimiento >= 75 ? 'text-emerald-600' : cumplimiento >= 50 ? 'text-amber-600' : 'text-red-500', bg: cumplimiento >= 75 ? 'bg-emerald-50' : 'bg-amber-50' },
        ].map(m => (
          <div key={m.label} className="card-p">
            <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center mb-3`}>
              <m.icon size={18} className={m.color} />
            </div>
            <p className="text-xs text-slate-500 mb-0.5">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Barra general */}
      <div className="card-p mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Cumplimiento General</p>
          <span className={`text-sm font-bold ${cumplimiento >= 75 ? 'text-emerald-600' : cumplimiento >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
            {cumplimiento.toFixed(1)}%
          </span>
        </div>
        <ProgressBar pct={cumplimiento} />
        <div className="flex justify-between mt-2 text-2xs text-slate-400">
          <span>0%</span><span className="text-amber-500">50%</span><span className="text-teal-500">75%</span><span className="text-emerald-500">100%</span>
        </div>
      </div>

      {/* Distribución por tipo */}
      {resumen && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { tipo: 'DIARIA', label: 'Diarias', val: resumen.metas_por_tipo?.diarias },
            { tipo: 'SEMANAL', label: 'Semanales', val: resumen.metas_por_tipo?.semanales },
            { tipo: 'MENSUAL', label: 'Mensuales', val: resumen.metas_por_tipo?.mensuales },
            { tipo: 'ANUAL', label: 'Anuales', val: resumen.metas_por_tipo?.anuales },
          ].map(t => (
            <button
              key={t.tipo}
              onClick={() => setFiltroTipo(filtroTipo === t.tipo ? '' : t.tipo)}
              className={`card p-3 text-center transition-all ${filtroTipo === t.tipo ? 'border-navy-700 bg-navy-700/5' : 'hover:border-slate-300'}`}
            >
              <p className={`text-2xl font-bold ${filtroTipo === t.tipo ? 'text-navy-700' : 'text-slate-900'}`}>{t.val || 0}</p>
              <p className="text-2xs text-slate-500 mt-0.5">{t.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Tabla de metas */}
      <div className="card-p overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Metas activas {filtroTipo && `— ${filtroTipo}`} ({metasFiltradas.length})
          </p>
          {filtroTipo && (
            <button onClick={() => setFiltroTipo('')} className="text-xs text-teal-600 hover:underline">
              Ver todas
            </button>
          )}
        </div>
        <div className="p-4">
          <ResponsiveTable
            loading={loading}
            emptyMessage="No hay metas activas"
            onRowClick={verMovimientos}
            columns={[
              {
                key: 'nombre',
                label: 'Meta',
                render: (v, row) => (
                  <div>
                    <p className="font-semibold text-slate-900">{v}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`badge ${TIPO_COLOR[row.tipo] || 'badge-neutral'} text-2xs`}>{row.tipo}</span>
                      {row.categoria && <span className="badge badge-neutral text-2xs">{row.categoria}</span>}
                    </div>
                  </div>
                ),
              },
              {
                key: 'porcentaje_cumplimiento',
                label: 'Progreso',
                render: (v, row) => (
                  <div className="min-w-[120px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs text-slate-500">
                        {Number(row.valor_actual).toFixed(0)} / {Number(row.valor_objetivo).toFixed(0)}
                      </span>
                      <span className={`text-xs font-bold ${v >= 100 ? 'text-emerald-600' : v >= 75 ? 'text-teal-600' : v >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {v.toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar pct={v} size="sm" />
                  </div>
                ),
              },
              {
                key: 'fecha_fin',
                label: 'Vence',
                render: v => {
                  const dias = Math.ceil((new Date(v).getTime() - Date.now()) / 86400000);
                  return (
                    <span className={`text-xs font-medium ${dias < 3 ? 'text-red-500' : dias < 7 ? 'text-amber-500' : 'text-slate-500'}`}>
                      {dias <= 0 ? 'Vencida' : `${dias}d`}
                    </span>
                  );
                },
              },
              {
                key: 'prioridad',
                label: 'Prioridad',
                align: 'center' as const,
                render: v => (
                  <span className={`badge ${v === 2 ? 'badge-danger' : v === 1 ? 'badge-warning' : 'badge-neutral'}`}>
                    {v === 2 ? 'Alta' : v === 1 ? 'Media' : 'Baja'}
                  </span>
                ),
              },
            ]}
            data={metasFiltradas}
          />
        </div>
      </div>

      {/* Modal crear meta */}
      <ResponsiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Meta"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button form="form-meta" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? 'Guardando...' : 'Crear Meta'}
            </button>
          </div>
        }
      >
        <form id="form-meta" onSubmit={crearMeta} className="space-y-3">
          <div>
            <label className="label">Nombre *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Meta Ventas Mayo..." className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo *</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="input">
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} className="input">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Objetivo *</label>
              <input required type="number" step="0.01" value={form.valor_objetivo}
                onChange={e => setForm(p => ({ ...p, valor_objetivo: e.target.value }))} placeholder="0" className="input" />
            </div>
            <div>
              <label className="label">Prioridad</label>
              <select value={form.prioridad} onChange={e => setForm(p => ({ ...p, prioridad: e.target.value }))} className="input">
                <option value="0">Baja</option>
                <option value="1">Media</option>
                <option value="2">Alta</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha inicio *</label>
              <input required type="date" value={form.fecha_inicio}
                onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Fecha fin *</label>
              <input required type="date" value={form.fecha_fin}
                onChange={e => setForm(p => ({ ...p, fecha_fin: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              rows={2} className="input resize-none" placeholder="Detalle de la meta..." />
          </div>
        </form>
      </ResponsiveModal>

      {/* Modal movimiento / historial */}
      <ResponsiveModal
        isOpen={!!showMovModal}
        onClose={() => { setShowMovModal(null); setMovimientos([]); }}
        title={showMovModal?.nombre || 'Actualizar Meta'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowMovModal(null); setMovimientos([]); }} className="btn-secondary btn-md flex-1">Cerrar</button>
            <button form="form-mov" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? '...' : 'Actualizar progreso'}
            </button>
          </div>
        }
      >
        {showMovModal && (
          <div className="space-y-4">
            {/* Estado actual */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">Progreso actual</span>
                <span className="font-bold text-slate-900">{showMovModal.porcentaje_cumplimiento.toFixed(0)}%</span>
              </div>
              <ProgressBar pct={showMovModal.porcentaje_cumplimiento} />
              <p className="text-2xs text-slate-400 mt-1.5">
                {Number(showMovModal.valor_actual).toFixed(0)} de {Number(showMovModal.valor_objetivo).toFixed(0)}
              </p>
            </div>

            {/* Actualizar valor */}
            <form id="form-mov" onSubmit={registrarMovimiento} className="space-y-3">
              <div>
                <label className="label">Nuevo valor acumulado</label>
                <input required type="number" step="0.01" value={movForm.valor_nuevo}
                  onChange={e => setMovForm(p => ({ ...p, valor_nuevo: e.target.value }))}
                  placeholder={`Actual: ${Number(showMovModal.valor_actual).toFixed(0)}`} className="input" />
              </div>
              <div>
                <label className="label">Descripción</label>
                <input value={movForm.descripcion} onChange={e => setMovForm(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Ventas del día, cierre de semana..." className="input" />
              </div>
            </form>

            {/* Historial de movimientos */}
            {movimientos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <History size={13} /> Historial reciente
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {movimientos.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-600">{m.descripcion || 'Actualización'}</span>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">+{Number(m.diferencia).toFixed(0)}</p>
                        <p className="text-slate-400 text-2xs">{Number(m.porcentaje_progreso).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ResponsiveModal>
    </AppLayout>
  );
};
