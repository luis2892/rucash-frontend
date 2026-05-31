import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { ResponsiveModal } from '../../components/ui/ResponsiveModal';
import {
  Plus, Download, Share2, Trash2, Eye, FileText,
  BarChart3, Table2, Activity, CreditCard, Target, TrendingUp,
} from 'lucide-react';

interface Plantilla {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
}

interface Reporte {
  id: string;
  nombre: string;
  descripcion?: string;
  formato_ultima_exportacion?: string;
  fecha_generacion: string;
  created_at: string;
  plantillas_reportes?: { nombre: string; tipo: string };
}

const TIPO_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  VENTAS:     { icon: <TrendingUp size={22} />, color: 'text-teal-600',   bg: 'bg-teal-50' },
  INVENTARIO: { icon: <Table2 size={22} />,     color: 'text-navy-700',   bg: 'bg-blue-50' },
  DEUDAS:     { icon: <CreditCard size={22} />, color: 'text-amber-600',  bg: 'bg-amber-50' },
  METAS:      { icon: <Target size={22} />,     color: 'text-purple-600', bg: 'bg-purple-50' },
  FLUJO_CAJA: { icon: <Activity size={22} />,   color: 'text-emerald-600',bg: 'bg-emerald-50' },
  PERSONALIZADO: { icon: <BarChart3 size={22} />, color: 'text-slate-600', bg: 'bg-slate-100' },
};

const FORMATO_BADGE: Record<string, string> = {
  PDF: 'badge-danger', EXCEL: 'badge-success', CSV: 'badge-teal', JSON: 'badge-neutral',
};

export const ReportesPage = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showProgramarModal, setShowProgramarModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', plantilla_id: '' });
  const [shareForm, setShareForm] = useState({ email: '', nivel: 'VER', dias: '7' });
  const [programarForm, setProgramarForm] = useState({ frecuencia: 'SEMANAL', hora: '08:00', emails: '' });
  const [shareLink, setShareLink] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        api.get('/reportes'),
        api.get('/reportes/plantillas'),
      ]);
      setReportes(rRes.data.reportes || []);
      setPlantillas(pRes.data.plantillas || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/reportes', form);
      setShowNewModal(false);
      setForm({ nombre: '', descripcion: '', plantilla_id: '' });
      cargar();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const generarYExportarCSV = async (reporte: Reporte) => {
    try {
      await api.post(`/reportes/${reporte.id}/generar`);
      const res = await api.get(`/reportes/${reporte.id}/exportar-csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${reporte.nombre}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      cargar();
    } catch (e) { console.error(e); }
  };

  const exportarFormato = async (reporteId: string, formato: 'pdf' | 'excel') => {
    try {
      await api.post(`/reportes/${reporteId}/exportar-${formato}`);
      cargar();
    } catch (e) { console.error(e); }
  };

  const eliminarReporte = async (id: string) => {
    if (!confirm('¿Eliminar este reporte?')) return;
    try { await api.delete(`/reportes/${id}`); cargar(); }
    catch (e) { console.error(e); }
  };

  const compartirReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showShareModal) return;
    setSaving(true);
    try {
      const expira = new Date();
      expira.setDate(expira.getDate() + parseInt(shareForm.dias));
      const res = await api.post(`/reportes/${showShareModal}/compartir`, {
        compartido_con_email: shareForm.email,
        nivel_acceso: shareForm.nivel,
        fecha_expiracion: expira.toISOString(),
      });
      setShareLink(res.data.enlace);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const programarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showProgramarModal) return;
    setSaving(true);
    try {
      await api.post(`/reportes/${showProgramarModal}/programar`, {
        frecuencia: programarForm.frecuencia,
        hora: programarForm.hora,
        emails_destinatarios: programarForm.emails.split(',').map(e => e.trim()),
      });
      setShowProgramarModal(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const totalReportes = reportes.length;
  const exportados = reportes.filter(r => r.formato_ultima_exportacion).length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Reportes personalizables y exportaciones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/reportes/constructor')}
            className="btn-secondary btn-md flex items-center gap-2"
          >
            <BarChart3 size={17} /> Constructor
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary btn-md flex items-center gap-2"
          >
            <Plus size={17} /> Nuevo Reporte
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reportes', value: totalReportes, icon: FileText, color: 'text-navy-700', bg: 'bg-blue-50' },
          { label: 'Plantillas', value: plantillas.length, icon: Table2, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Exportados', value: exportados, icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sin exportar', value: totalReportes - exportados, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(k => (
          <div key={k.label} className="card-p">
            <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <p className="text-xs text-slate-500 mb-0.5">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Plantillas */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Plantillas disponibles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {plantillas.map(p => {
            const meta = TIPO_META[p.tipo] || TIPO_META.PERSONALIZADO;
            return (
              <button
                key={p.id}
                onClick={() => { setForm(f => ({ ...f, plantilla_id: p.id, nombre: p.nombre })); setShowNewModal(true); }}
                className="card p-4 text-center hover:border-teal-400 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 ${meta.bg} rounded-xl flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110`}>
                  <span className={meta.color}>{meta.icon}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">{p.nombre}</p>
                <p className="text-2xs text-slate-400 mt-0.5">{p.tipo}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de reportes */}
      <div className="card-p overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Mis Reportes ({reportes.length})</p>
        </div>
        <div className="p-4">
          <ResponsiveTable
            loading={loading}
            emptyMessage="No hay reportes guardados aún. Crea uno con una plantilla o el Constructor."
            columns={[
              {
                key: 'nombre',
                label: 'Reporte',
                render: (v, row) => (
                  <div>
                    <p className="font-semibold text-slate-900">{v}</p>
                    {row.plantillas_reportes && (
                      <span className="badge badge-neutral text-2xs mt-0.5">{row.plantillas_reportes.tipo}</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'fecha_generacion',
                label: 'Generado',
                render: v => <span className="text-xs text-slate-500">{new Date(v).toLocaleDateString('es-PE')}</span>,
              },
              {
                key: 'formato_ultima_exportacion',
                label: 'Última exp.',
                align: 'center' as const,
                render: v => v ? (
                  <span className={`badge ${FORMATO_BADGE[v] || 'badge-neutral'}`}>{v}</span>
                ) : <span className="text-slate-300 text-xs">—</span>,
              },
              {
                key: 'id',
                label: 'Acciones',
                align: 'center' as const,
                render: (v, row) => (
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => navigate(`/reportes/constructor?id=${v}`)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Ver/Editar">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => generarYExportarCSV(row)}
                      className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors" title="Descargar CSV">
                      <Download size={16} />
                    </button>
                    <button onClick={() => exportarFormato(v, 'pdf')}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="PDF">
                      <FileText size={16} />
                    </button>
                    <button onClick={() => { setShowShareModal(v); setShareLink(''); }}
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors" title="Compartir">
                      <Share2 size={16} />
                    </button>
                    <button onClick={() => setShowProgramarModal(v)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors" title="Programar">
                      <Activity size={16} />
                    </button>
                    <button onClick={() => eliminarReporte(v)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={reportes}
          />
        </div>
      </div>

      {/* Modal nuevo reporte */}
      <ResponsiveModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Nuevo Reporte"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowNewModal(false)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button form="form-reporte" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? 'Guardando...' : 'Crear Reporte'}
            </button>
          </div>
        }
      >
        <form id="form-reporte" onSubmit={crearReporte} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Reporte Ventas Junio..." className="input" />
          </div>
          <div>
            <label className="label">Plantilla base</label>
            <select value={form.plantilla_id} onChange={e => setForm(p => ({ ...p, plantilla_id: e.target.value }))} className="input">
              <option value="">Sin plantilla (personalizado)</option>
              {plantillas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              rows={2} className="input resize-none" placeholder="Descripción del reporte..." />
          </div>
        </form>
      </ResponsiveModal>

      {/* Modal compartir */}
      <ResponsiveModal
        isOpen={!!showShareModal}
        onClose={() => { setShowShareModal(null); setShareLink(''); }}
        title="Compartir Reporte"
        footer={!shareLink ? (
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowShareModal(null)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button form="form-share" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? 'Generando...' : 'Compartir'}
            </button>
          </div>
        ) : (
          <button onClick={() => { setShowShareModal(null); setShareLink(''); }} className="btn-primary btn-md w-full">
            Cerrar
          </button>
        )}
      >
        {shareLink ? (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-emerald-800 mb-2">✅ Enlace generado</p>
              <p className="text-xs text-slate-600 break-all bg-white border border-slate-200 rounded-lg p-2 font-mono">
                {shareLink}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(shareLink)}
              className="btn-secondary btn-md w-full"
            >
              Copiar enlace
            </button>
          </div>
        ) : (
          <form id="form-share" onSubmit={compartirReporte} className="space-y-4">
            <div>
              <label className="label">Email del destinatario *</label>
              <input required type="email" value={shareForm.email}
                onChange={e => setShareForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ejemplo@empresa.com" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nivel de acceso</label>
                <select value={shareForm.nivel} onChange={e => setShareForm(p => ({ ...p, nivel: e.target.value }))} className="input">
                  <option value="VER">Solo Ver</option>
                  <option value="EDITAR">Editar</option>
                </select>
              </div>
              <div>
                <label className="label">Expira en</label>
                <select value={shareForm.dias} onChange={e => setShareForm(p => ({ ...p, dias: e.target.value }))} className="input">
                  <option value="1">1 día</option>
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="90">90 días</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </ResponsiveModal>

      {/* Modal programar */}
      <ResponsiveModal
        isOpen={!!showProgramarModal}
        onClose={() => setShowProgramarModal(null)}
        title="Programar Reporte"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowProgramarModal(null)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button form="form-programar" type="submit" disabled={saving} className="btn-primary btn-md flex-1">
              {saving ? 'Guardando...' : 'Programar'}
            </button>
          </div>
        }
      >
        <form id="form-programar" onSubmit={programarReporte} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Frecuencia</label>
              <select value={programarForm.frecuencia} onChange={e => setProgramarForm(p => ({ ...p, frecuencia: e.target.value }))} className="input">
                {['DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Hora de envío</label>
              <input type="time" value={programarForm.hora}
                onChange={e => setProgramarForm(p => ({ ...p, hora: e.target.value }))} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Emails (separados por coma) *</label>
            <input required value={programarForm.emails}
              onChange={e => setProgramarForm(p => ({ ...p, emails: e.target.value }))}
              placeholder="admin@empresa.com, gerente@empresa.com" className="input" />
          </div>
          <p className="text-xs text-slate-400">El reporte se generará y enviará automáticamente según la frecuencia configurada.</p>
        </form>
      </ResponsiveModal>
    </AppLayout>
  );
};
