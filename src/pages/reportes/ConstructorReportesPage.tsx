import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ArrowLeft, Save, Download, FileText, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface Campo { key: string; label: string; categoria: string }

const CAMPOS_DISPONIBLES: Record<string, Campo[]> = {
  VENTAS: [
    { key: 'created_at', label: 'Fecha', categoria: 'Tiempo' },
    { key: 'total', label: 'Total', categoria: 'Montos' },
    { key: 'subtotal', label: 'Subtotal', categoria: 'Montos' },
    { key: 'impuesto', label: 'IGV (18%)', categoria: 'Montos' },
    { key: 'metodo_pago', label: 'Método de Pago', categoria: 'Pago' },
    { key: 'moneda', label: 'Moneda', categoria: 'Pago' },
    { key: 'monto_pagado', label: 'Monto Pagado', categoria: 'Pago' },
    { key: 'cambio', label: 'Cambio', categoria: 'Pago' },
    { key: 'estado', label: 'Estado', categoria: 'Estado' },
    { key: 'notas', label: 'Notas', categoria: 'Info' },
  ],
  INVENTARIO: [
    { key: 'codigo_barras', label: 'Código', categoria: 'ID' },
    { key: 'nombre', label: 'Nombre', categoria: 'Info' },
    { key: 'categoria', label: 'Categoría', categoria: 'Info' },
    { key: 'precio_usd', label: 'Precio USD', categoria: 'Precio' },
    { key: 'precio_sol', label: 'Precio SOL', categoria: 'Precio' },
    { key: 'costo_usd', label: 'Costo USD', categoria: 'Precio' },
    { key: 'stock_tienda', label: 'Stock Tienda', categoria: 'Stock' },
    { key: 'stock_almacen', label: 'Stock Almacén', categoria: 'Stock' },
    { key: 'nivel_minimo_stock', label: 'Stock Mínimo', categoria: 'Stock' },
    { key: 'proveedor', label: 'Proveedor', categoria: 'Info' },
  ],
  DEUDAS: [
    { key: 'acreedor', label: 'Acreedor', categoria: 'Info' },
    { key: 'tipo', label: 'Tipo', categoria: 'Info' },
    { key: 'monto_usd', label: 'Monto USD', categoria: 'Montos' },
    { key: 'monto_sol', label: 'Monto SOL', categoria: 'Montos' },
    { key: 'interes_anual', label: 'Interés Anual %', categoria: 'Montos' },
    { key: 'fecha_vencimiento', label: 'Vencimiento', categoria: 'Tiempo' },
    { key: 'estado', label: 'Estado', categoria: 'Estado' },
    { key: 'notas', label: 'Notas', categoria: 'Info' },
  ],
  METAS: [
    { key: 'nombre', label: 'Meta', categoria: 'Info' },
    { key: 'tipo', label: 'Tipo', categoria: 'Info' },
    { key: 'categoria', label: 'Categoría', categoria: 'Info' },
    { key: 'valor_objetivo', label: 'Objetivo', categoria: 'Valor' },
    { key: 'valor_actual', label: 'Actual', categoria: 'Valor' },
    { key: 'estado', label: 'Estado', categoria: 'Estado' },
    { key: 'fecha_fin', label: 'Fecha Fin', categoria: 'Tiempo' },
  ],
};

const TIPOS_FUENTE = ['VENTAS', 'INVENTARIO', 'DEUDAS', 'METAS'];

const fmt = (key: string, val: any) => {
  if (!val) return '—';
  if (key.includes('fecha') || key === 'created_at') return new Date(val).toLocaleDateString('es-PE');
  if (typeof val === 'number') return key.includes('interes') ? `${val}%` : `${val}`;
  return String(val);
};

export const ConstructorReportesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reporteId = searchParams.get('id');

  const [config, setConfig] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'VENTAS',
    camposSeleccionados: [] as string[],
    filtroFechaInicio: '',
    filtroFechaFin: '',
    filtroEstado: '',
  });
  const [vista, setVista] = useState<'constructor' | 'preview'>('constructor');
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guardadoId, setGuardadoId] = useState<string | null>(reporteId);
  const [msg, setMsg] = useState('');

  const camposDisp = CAMPOS_DISPONIBLES[config.tipo] || [];

  // Agrupar campos por categoría
  const porCategoria = camposDisp.reduce((acc: Record<string, Campo[]>, c) => {
    if (!acc[c.categoria]) acc[c.categoria] = [];
    acc[c.categoria].push(c);
    return acc;
  }, {});

  useEffect(() => {
    if (reporteId) {
      api.get(`/reportes/${reporteId}`)
        .then(r => {
          const rep = r.data.reporte;
          setConfig(p => ({ ...p, nombre: rep.nombre, descripcion: rep.descripcion || '' }));
        })
        .catch(console.error);
    }
  }, [reporteId]);

  const toggleCampo = (key: string) => {
    setConfig(p => ({
      ...p,
      camposSeleccionados: p.camposSeleccionados.includes(key)
        ? p.camposSeleccionados.filter(c => c !== key)
        : [...p.camposSeleccionados, key],
    }));
  };

  const seleccionarTodos = () => {
    setConfig(p => ({ ...p, camposSeleccionados: camposDisp.map(c => c.key) }));
  };

  const generarPreview = async () => {
    if (!guardadoId) {
      setMsg('Guarda el reporte primero para generar la vista previa.');
      return;
    }
    setLoading(true);
    setVista('preview');
    try {
      // Obtener datos del reporte guardado desde el endpoint disponible
      const res = await api.get(`/reportes/${guardadoId}`);
      let filas = res.data.datos || [];
      // Filtrar por fechas en frontend
      if (config.filtroFechaInicio) {
        filas = filas.filter((r: any) => new Date(r.created_at || r.fecha_inicio || '') >= new Date(config.filtroFechaInicio));
      }
      if (config.filtroFechaFin) {
        filas = filas.filter((r: any) => new Date(r.created_at || r.fecha_fin || '') <= new Date(config.filtroFechaFin));
      }
      if (config.filtroEstado) {
        filas = filas.filter((r: any) => r.estado === config.filtroEstado);
      }
      setDatos(filas);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const guardarReporte = async () => {
    if (!config.nombre) { setMsg('El nombre es obligatorio'); return; }
    setSaving(true);
    setMsg('');
    try {
      if (guardadoId) {
        await api.patch(`/reportes/${guardadoId}`, { nombre: config.nombre, descripcion: config.descripcion });
        setMsg('✅ Reporte actualizado');
      } else {
        const res = await api.post('/reportes', { nombre: config.nombre, descripcion: config.descripcion });
        setGuardadoId(res.data.reporte.id);
        setMsg('✅ Reporte guardado');
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const exportarCSV = async () => {
    if (!guardadoId) { setMsg('Guarda el reporte primero.'); return; }
    try {
      // Exportar los datos en memoria como CSV
      const campos = camposParaVista;
      const headers = campos.map(c => c.label).join(',');
      const rows = datos.map(row => campos.map(c => fmt(c.key, row[c.key])).join(','));
      const csv = [headers, ...rows].join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `${config.nombre || 'reporte'}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setMsg('✅ CSV descargado');
    } catch (e) { console.error(e); }
  };

  const camposParaVista = config.camposSeleccionados.length > 0
    ? camposDisp.filter(c => config.camposSeleccionados.includes(c.key))
    : camposDisp.slice(0, 5);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reportes')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Constructor de Reportes</h1>
            {guardadoId && <p className="text-xs text-emerald-600 font-medium mt-0.5">✓ Guardado</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 gap-0.5">
            {(['constructor', 'preview'] as const).map(v => (
              <button key={v} onClick={() => v === 'preview' ? generarPreview() : setVista('constructor')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${vista === v ? 'bg-navy-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {v === 'constructor' ? <EyeOff size={13} /> : <Eye size={13} />}
                {v === 'constructor' ? 'Constructor' : 'Vista previa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 text-sm px-4 py-2.5 rounded-xl border ${msg.startsWith('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar de configuración */}
        <div className="lg:col-span-1 space-y-4">
          {/* Info básica */}
          <div className="card-p space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Información</h3>
            <div>
              <label className="label">Nombre *</label>
              <input value={config.nombre} onChange={e => setConfig(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Mi reporte..." className="input" />
            </div>
            <div>
              <label className="label">Fuente de datos</label>
              <select value={config.tipo} onChange={e => setConfig(p => ({ ...p, tipo: e.target.value, camposSeleccionados: [] }))} className="input">
                {TIPOS_FUENTE.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea value={config.descripcion} onChange={e => setConfig(p => ({ ...p, descripcion: e.target.value }))}
                rows={2} className="input resize-none text-sm" placeholder="Descripción..." />
            </div>
          </div>

          {/* Filtros */}
          <div className="card-p space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Filtros</h3>
            <div>
              <label className="label">Fecha inicio</label>
              <input type="date" value={config.filtroFechaInicio}
                onChange={e => setConfig(p => ({ ...p, filtroFechaInicio: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Fecha fin</label>
              <input type="date" value={config.filtroFechaFin}
                onChange={e => setConfig(p => ({ ...p, filtroFechaFin: e.target.value }))} className="input" />
            </div>
            {['VENTAS', 'DEUDAS', 'METAS'].includes(config.tipo) && (
              <div>
                <label className="label">Estado</label>
                <select value={config.filtroEstado} onChange={e => setConfig(p => ({ ...p, filtroEstado: e.target.value }))} className="input">
                  <option value="">Todos</option>
                  {config.tipo === 'VENTAS' && ['COMPLETADA', 'ANULADA', 'PENDIENTE'].map(s => <option key={s}>{s}</option>)}
                  {config.tipo === 'DEUDAS' && ['ACTIVA', 'PAGADA', 'VENCIDA'].map(s => <option key={s}>{s}</option>)}
                  {config.tipo === 'METAS' && ['ACTIVA', 'COMPLETADA', 'INCOMPLETA'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="card-p space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Acciones</h3>
            <button onClick={guardarReporte} disabled={saving} className="btn-primary btn-md w-full flex items-center gap-2">
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Reporte'}
            </button>
            <button onClick={generarPreview} disabled={loading} className="btn-secondary btn-md w-full flex items-center gap-2">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Generar Vista Previa
            </button>
            <button onClick={exportarCSV} className="btn-secondary btn-md w-full flex items-center gap-2">
              <Download size={16} /> Exportar CSV
            </button>
            <button onClick={() => setMsg('Exportación PDF no disponible actualmente. Use CSV.')}
              className="btn-secondary btn-md w-full flex items-center gap-2">
              <FileText size={16} /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Panel principal */}
        <div className="lg:col-span-3">
          {vista === 'constructor' ? (
            <div className="card-p">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Campos a incluir — {config.tipo}
                  <span className="ml-2 badge badge-teal">{config.camposSeleccionados.length || camposDisp.length} campos</span>
                </h3>
                <button onClick={seleccionarTodos} className="text-xs text-teal-600 hover:underline">
                  Seleccionar todos
                </button>
              </div>

              {Object.entries(porCategoria).map(([cat, campos]) => (
                <div key={cat} className="mb-4">
                  <p className="text-2xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{cat}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {campos.map(campo => {
                      const seleccionado = config.camposSeleccionados.length === 0 || config.camposSeleccionados.includes(campo.key);
                      return (
                        <label key={campo.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm ${seleccionado && config.camposSeleccionados.length > 0 ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <input
                            type="checkbox"
                            checked={config.camposSeleccionados.includes(campo.key)}
                            onChange={() => toggleCampo(campo.key)}
                            className="w-3.5 h-3.5 rounded accent-teal-500"
                          />
                          <span className="leading-tight">{campo.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {camposDisp.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-sm">Selecciona una fuente de datos</p>
              )}
            </div>
          ) : (
            /* Vista previa */
            <div className="card-p overflow-hidden p-0">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Vista previa — {config.nombre || 'Sin nombre'}
                  <span className="ml-2 badge badge-neutral">{datos.length} filas</span>
                </p>
                <button onClick={exportarCSV} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                  <Download size={12} /> Descargar CSV
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400 text-sm">Generando datos...</div>
              ) : datos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Sin datos para mostrar. Prueba cambiando los filtros o fuente de datos.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {camposParaVista.map(c => (
                          <th key={c.key} className="text-left px-4 py-3 text-slate-600 font-semibold whitespace-nowrap">
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                          {camposParaVista.map(c => (
                            <td key={c.key} className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                              {fmt(c.key, row[c.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {datos.length > 20 && (
                    <p className="text-center py-2 text-xs text-slate-400">
                      Mostrando 20 de {datos.length} filas. Exporta el CSV para ver todos.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
