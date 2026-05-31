import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { ResponsiveModal } from '../../components/ui/ResponsiveModal';
import { Plus, AlertTriangle, TrendingDown, DollarSign, Activity, CheckCircle } from 'lucide-react';

interface Deuda {
  id: string;
  tipo: string;
  acreedor: string;
  monto_usd: number;
  monto_sol: number;
  interes_anual: number;
  fecha_inicio: string;
  fecha_vencimiento?: string;
  estado: string;
  notas?: string;
}

const TIPOS = ['PROVEEDOR', 'BANCO', 'PRESTAMO', 'OTRO'];
const TIPO_COLORS: Record<string, string> = {
  PROVEEDOR: 'badge-warning',
  BANCO: 'badge-navy',
  PRESTAMO: 'badge-danger',
  OTRO: 'badge-neutral',
};

export const DeudasPage = () => {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [analisis, setAnalisis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: 'PROVEEDOR', acreedor: '', monto_usd: '',
    interes_anual: '', fecha_vencimiento: '', notas: '',
  });
  const [pagoForm, setPagoForm] = useState({ monto_pagado: '', metodo: 'TRANSFERENCIA', referencia: '' });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, aRes] = await Promise.all([
        api.get('/deudas'),
        api.get('/deudas/analisis/resumen'),
      ]);
      setDeudas(dRes.data.deudas || []);
      setAnalisis(aRes.data.analisis);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearDeuda = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/deudas', {
        ...form,
        monto_usd: parseFloat(form.monto_usd),
        interes_anual: parseFloat(form.interes_anual) || 0,
      });
      setShowModal(false);
      setForm({ tipo: 'PROVEEDOR', acreedor: '', monto_usd: '', interes_anual: '', fecha_vencimiento: '', notas: '' });
      cargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const registrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPagoModal) return;
    setSaving(true);
    try {
      await api.post(`/deudas/${showPagoModal}/pagar`, {
        ...pagoForm,
        monto_pagado: parseFloat(pagoForm.monto_pagado),
      });
      setShowPagoModal(null);
      setPagoForm({ monto_pagado: '', metodo: 'TRANSFERENCIA', referencia: '' });
      cargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const deudasActivas = deudas.filter(d => d.estado === 'ACTIVA');
  const ratio = analisis?.ratio_deuda_ingresos || 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deudas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control de obligaciones financieras</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary btn-md flex items-center gap-2">
          <Plus size={18} /> Nueva Deuda
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Deudas', icon: TrendingDown, color: 'text-red-600',
            value: `$${(analisis?.total_deudas || 0).toFixed(0)}`,
            bg: 'bg-red-50',
          },
          {
            label: 'Deudas Activas', icon: Activity, color: 'text-amber-600',
            value: deudasActivas.length,
            bg: 'bg-amber-50',
          },
          {
            label: 'Interés Mensual', icon: DollarSign, color: 'text-navy-700',
            value: `$${(analisis?.interes_mensual_estimado || 0).toFixed(0)}`,
            bg: 'bg-blue-50',
          },
          {
            label: 'Ratio Deuda/Ingreso', icon: Activity,
            color: ratio > 50 ? 'text-red-600' : 'text-emerald-600',
            value: `${ratio.toFixed(0)}%`,
            bg: ratio > 50 ? 'bg-red-50' : 'bg-emerald-50',
          },
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

      {/* Alerta ratio alto */}
      {ratio > 50 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-800">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Ratio de endeudamiento alto ({ratio.toFixed(0)}%)</p>
            <p className="text-xs mt-0.5">Tu deuda supera el 50% de tus ingresos mensuales. Considera renegociar o pagar anticipadamente.</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card-p overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Todas las deudas ({deudas.length})</p>
        </div>
        <div className="p-4">
          <ResponsiveTable
            loading={loading}
            emptyMessage="No hay deudas registradas"
            columns={[
              {
                key: 'acreedor',
                label: 'Acreedor',
                render: (v, row) => (
                  <div>
                    <p className="font-semibold text-slate-900">{v}</p>
                    <span className={`badge ${TIPO_COLORS[row.tipo] || 'badge-neutral'} mt-0.5`}>{row.tipo}</span>
                  </div>
                ),
              },
              {
                key: 'monto_usd',
                label: 'Monto',
                align: 'right',
                render: v => <span className="font-bold text-slate-900">${Number(v).toFixed(2)}</span>,
              },
              {
                key: 'interes_anual',
                label: 'Interés',
                align: 'right',
                render: v => <span className="text-slate-600">{v}% anual</span>,
              },
              {
                key: 'fecha_vencimiento',
                label: 'Vencimiento',
                render: v => v ? (
                  <span className={new Date(v) < new Date() ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                    {new Date(v).toLocaleDateString('es-PE')}
                  </span>
                ) : <span className="text-slate-400">—</span>,
              },
              {
                key: 'estado',
                label: 'Estado',
                align: 'center',
                render: v => (
                  <span className={`badge ${v === 'ACTIVA' ? 'badge-danger' : v === 'PAGADA' ? 'badge-success' : 'badge-warning'}`}>
                    {v}
                  </span>
                ),
              },
              {
                key: 'id',
                label: 'Acción',
                align: 'center',
                render: (v, row) => row.estado === 'ACTIVA' ? (
                  <button
                    onClick={e => { e.stopPropagation(); setShowPagoModal(v); }}
                    className="text-xs btn-secondary px-2 py-1 flex items-center gap-1"
                  >
                    <CheckCircle size={13} /> Pagar
                  </button>
                ) : null,
              },
            ]}
            data={deudas}
          />
        </div>
      </div>

      {/* Modal nueva deuda */}
      <ResponsiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Deuda"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button form="form-deuda" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? 'Guardando...' : 'Crear Deuda'}
            </button>
          </div>
        }
      >
        <form id="form-deuda" onSubmit={crearDeuda} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Acreedor *</label>
              <input required value={form.acreedor} onChange={e => setForm(p => ({ ...p, acreedor: e.target.value }))}
                placeholder="Banco BCP, Proveedor XYZ..." className="input" />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="input">
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Monto USD *</label>
              <input required type="number" step="0.01" value={form.monto_usd}
                onChange={e => setForm(p => ({ ...p, monto_usd: e.target.value }))} placeholder="0.00" className="input" />
            </div>
            <div>
              <label className="label">Interés anual (%)</label>
              <input type="number" step="0.01" value={form.interes_anual}
                onChange={e => setForm(p => ({ ...p, interes_anual: e.target.value }))} placeholder="0" className="input" />
            </div>
            <div>
              <label className="label">Fecha vencimiento</label>
              <input type="date" value={form.fecha_vencimiento}
                onChange={e => setForm(p => ({ ...p, fecha_vencimiento: e.target.value }))} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Notas</label>
              <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                rows={2} className="input resize-none" placeholder="Cuotas mensuales, garantías..." />
            </div>
          </div>
        </form>
      </ResponsiveModal>

      {/* Modal registrar pago */}
      <ResponsiveModal
        isOpen={!!showPagoModal}
        onClose={() => setShowPagoModal(null)}
        title="Registrar Pago"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowPagoModal(null)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button form="form-pago" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? 'Guardando...' : 'Confirmar Pago'}
            </button>
          </div>
        }
      >
        <form id="form-pago" onSubmit={registrarPago} className="space-y-4">
          <div>
            <label className="label">Monto pagado (USD) *</label>
            <input required type="number" step="0.01" value={pagoForm.monto_pagado}
              onChange={e => setPagoForm(p => ({ ...p, monto_pagado: e.target.value }))} placeholder="0.00" className="input" />
          </div>
          <div>
            <label className="label">Método</label>
            <select value={pagoForm.metodo} onChange={e => setPagoForm(p => ({ ...p, metodo: e.target.value }))} className="input">
              {['EFECTIVO', 'TRANSFERENCIA', 'CHEQUE'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Referencia / N° operación</label>
            <input value={pagoForm.referencia} onChange={e => setPagoForm(p => ({ ...p, referencia: e.target.value }))}
              placeholder="Ej: OP-2026-001" className="input" />
          </div>
        </form>
      </ResponsiveModal>
    </AppLayout>
  );
};
