import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Settings, AlertCircle, Users, TrendingUp, Target, DollarSign } from 'lucide-react';
import { AppLayout } from '../../components/Layout/AppLayout';

const WIDGET_ICONS: Record<string, string> = {
  VENTAS: '💰', METAS: '🎯', EQUIPO: '👥', INVENTARIO: '📦',
  DEUDAS: '💳', FLUJO_CAJA: '📊', REPORTES: '📄', ACTIVIDAD: '📋',
};

const WIDGET_TYPES = [
  { tipo: 'VENTAS', label: 'Ventas del Día' },
  { tipo: 'METAS', label: 'Metas del Mes' },
  { tipo: 'EQUIPO', label: 'Mi Equipo' },
  { tipo: 'INVENTARIO', label: 'Stock Bajo' },
  { tipo: 'DEUDAS', label: 'Deudas Activas' },
  { tipo: 'FLUJO_CAJA', label: 'Flujo de Caja' },
  { tipo: 'REPORTES', label: 'Reportes Recientes' },
  { tipo: 'ACTIVIDAD', label: 'Actividad del Equipo' },
];

export const DashboardDuenoPage = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [uso, setUso] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState('VENTAS');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [widgetsRes, resumenRes, usoRes] = await Promise.all([
        api.get('/dashboard/widgets'),
        api.get('/dashboard/resumen'),
        api.get('/dashboard/suscripcion/uso'),
      ]);
      setWidgets(widgetsRes.data.widgets || []);
      setResumen(resumenRes.data.resumen);
      setUso(usoRes.data.uso);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarWidget = async () => {
    try {
      const label = WIDGET_TYPES.find(w => w.tipo === nuevoTipo)?.label || nuevoTipo;
      await api.post('/dashboard/widgets', {
        tipo: nuevoTipo,
        titulo: `${WIDGET_ICONS[nuevoTipo]} ${label}`,
        tamaño: 'medium',
      });
      setShowAddWidget(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eliminarWidget = async (id: string) => {
    try {
      await api.delete(`/dashboard/widgets/${id}`);
      setWidgets(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">👑 Dashboard Dueño</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vista ejecutiva de tu negocio</p>
        </div>
        <button
          onClick={() => setShowAddWidget(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition"
        >
          <Plus size={16} /> Agregar Widget
        </button>
      </div>

      {/* Alerta suscripción */}
      {uso && uso.dias_restantes < 30 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-900 text-sm">Suscripción por vencer</p>
            <p className="text-xs text-amber-700">Te quedan {uso.dias_restantes} días — renueva para no perder acceso.</p>
          </div>
          <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition flex-shrink-0">
            Renovar
          </button>
        </div>
      )}

      {/* Uso de suscripción */}
      {uso && (
        <div className="card-p mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-900">Plan {uso.plan}</p>
            <span className="text-xs text-slate-500">Vence: {new Date(uso.vencimiento).toLocaleDateString('es-PE')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
            <span>Usuarios</span>
            <span className="font-semibold">{uso.usuarios_usados} / {uso.usuarios_limite}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${uso.porcentaje_uso > 80 ? 'bg-red-500' : uso.porcentaje_uso > 50 ? 'bg-amber-400' : 'bg-teal-500'}`}
              style={{ width: `${Math.min(uso.porcentaje_uso, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats rápidos */}
      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Ventas hoy', value: `$${resumen.ventas_hoy?.toFixed(0) || 0}`, icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Metas activas', value: `${resumen.metas_cumplidas}/${resumen.metas_activas}`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Equipo', value: resumen.equipo_total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Deudas activas', value: `$${resumen.total_deudas?.toFixed(0) || 0}`, icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className="card-p">
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Widgets */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Mi Dashboard <span className="text-slate-400 font-normal">({widgets.length} widgets)</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card-p animate-pulse h-36 bg-slate-100" />)}
          </div>
        ) : widgets.length === 0 ? (
          <div className="card-p text-center py-14">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-slate-600 font-medium mb-1">No hay widgets</p>
            <p className="text-sm text-slate-400 mb-5">Agrega widgets para personalizar tu dashboard</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-5 py-2.5 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition"
            >
              Agregar primer widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map(widget => (
              <div key={widget.id} className="card-p hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{WIDGET_ICONS[widget.tipo] || '⚙️'}</span>
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight">{widget.titulo}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <Settings size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => eliminarWidget(widget.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg h-20 flex items-center justify-center">
                  <p className="text-xs text-slate-400">{widget.tipo}</p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-2xs text-slate-400 capitalize">{widget.tamaño}</span>
                  <span className="text-2xs text-teal-500 font-medium">Activo</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal agregar widget */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Agregar Widget</h2>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tipo de widget</label>
              <select
                value={nuevoTipo}
                onChange={e => setNuevoTipo(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                {WIDGET_TYPES.map(w => (
                  <option key={w.tipo} value={w.tipo}>{WIDGET_ICONS[w.tipo]} {w.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddWidget(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={agregarWidget}
                className="flex-1 py-2.5 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
