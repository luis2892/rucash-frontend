import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';

interface DiaAnalisis {
  periodo: string;
  total_ventas: number;
  promedio_venta: number;
  numero_transacciones: number;
  ticket_promedio: number;
  tasa_cumplimiento: number;
}

const fmt = (v: number) => `$${v.toFixed(0)}`;

const CustomTooltipVentas = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-teal-600 font-bold">{fmt(payload[0]?.value || 0)}</p>
      <p className="text-slate-400">{payload[1]?.value || 0} ventas</p>
    </div>
  );
};

// Construye analisis diario y resumen a partir de la lista de metas
function buildAnalisisFromMetas(metas: any[]): { analisis: DiaAnalisis[]; resumen: any } {
  // Agrupar por fecha de inicio como proxy de "periodo"
  const byDate: Record<string, any> = {};
  for (const m of metas) {
    const periodo = m.fecha_inicio?.split('T')[0] || m.fecha_inicio || '';
    if (!byDate[periodo]) {
      byDate[periodo] = { periodo, total_ventas: 0, numero_transacciones: 0, ticket_promedio: 0, tasa_cumplimiento: 0, promedio_venta: 0 };
    }
    byDate[periodo].total_ventas += Number(m.valor_actual || 0);
    byDate[periodo].numero_transacciones += 1;
    byDate[periodo].tasa_cumplimiento = m.porcentaje_cumplimiento || 0;
  }
  const analisis: DiaAnalisis[] = Object.values(byDate).map((d: any) => ({
    ...d,
    ticket_promedio: d.numero_transacciones > 0 ? d.total_ventas / d.numero_transacciones : 0,
    promedio_venta: d.numero_transacciones > 0 ? d.total_ventas / d.numero_transacciones : 0,
  }));

  const completadas = metas.filter(m => m.estado === 'COMPLETADA' || (m.porcentaje_cumplimiento || 0) >= 100).length;
  const cumplimientoTotal = metas.length > 0
    ? metas.reduce((s, m) => s + (m.porcentaje_cumplimiento || 0), 0) / metas.length
    : 0;

  const resumen = {
    total_metas: metas.length,
    metas_completadas: completadas,
    porcentaje_cumplimiento_general: cumplimientoTotal,
    metas_por_tipo: {
      diarias: metas.filter(m => m.tipo === 'DIARIA').length,
      semanales: metas.filter(m => m.tipo === 'SEMANAL').length,
      mensuales: metas.filter(m => m.tipo === 'MENSUAL').length,
      anuales: metas.filter(m => m.tipo === 'ANUAL').length,
    },
  };
  return { analisis, resumen };
}

export const AnalisisPage = () => {
  const [analisis, setAnalisis] = useState<DiaAnalisis[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/metas')
      .then(res => {
        const metas = res.data.metas || [];
        const { analisis: a, resumen: r } = buildAnalisisFromMetas(metas);
        setAnalisis(a);
        setResumen(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-slate-400 text-sm">Cargando análisis...</div>
      </AppLayout>
    );
  }

  const totalVentas = analisis.reduce((s, d) => s + d.total_ventas, 0);
  const totalTx = analisis.reduce((s, d) => s + d.numero_transacciones, 0);
  const ticketProm = totalTx > 0 ? totalVentas / totalTx : 0;
  const ventaMaxDia = Math.max(...analisis.map(d => d.total_ventas), 0);

  // Formatear label para el eje X
  const dataConLabel = analisis.map(d => ({
    ...d,
    label: new Date(d.periodo).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' }),
  }));

  // Datos para gráfico de barras por día de semana
  const porDiaSemana = analisis.reduce((acc: any, d) => {
    const dia = new Date(d.periodo).toLocaleDateString('es-PE', { weekday: 'short' });
    if (!acc[dia]) acc[dia] = { dia, ventas: 0, count: 0 };
    acc[dia].ventas += d.total_ventas;
    acc[dia].count += 1;
    return acc;
  }, {});
  const datosDiaSemana = Object.values(porDiaSemana).map((d: any) => ({
    dia: d.dia,
    promedio: Math.round(d.ventas / d.count),
  }));

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Análisis</h1>
        <p className="text-sm text-slate-500 mt-0.5">Performance de ventas últimos 30 días</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total ventas', value: fmt(totalVentas), icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Transacciones', value: totalTx, icon: ShoppingCart, color: 'text-navy-700', bg: 'bg-blue-50' },
          { label: 'Ticket promedio', value: fmt(ticketProm), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Mejor día', value: fmt(ventaMaxDia), icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Metas resumen */}
      {resumen && (
        <div className="card-p mb-5 flex flex-wrap gap-6 items-center">
          <div>
            <p className="text-xs text-slate-500">Metas activas</p>
            <p className="text-xl font-bold text-slate-900">{resumen.total_metas}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Completadas</p>
            <p className="text-xl font-bold text-emerald-600">{resumen.metas_completadas}</p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Cumplimiento general</p>
              <p className="text-xs font-bold text-navy-700">{(resumen.porcentaje_cumplimiento_general || 0).toFixed(0)}%</p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(resumen.porcentaje_cumplimiento_general || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {analisis.length === 0 ? (
        <div className="card-p text-center py-12 text-slate-400 text-sm">
          Sin datos de ventas en los últimos 30 días
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Gráfico de ventas diarias */}
          <div className="lg:col-span-2 card-p">
            <h2 className="text-sm font-semibold text-slate-900 mb-5">Ventas diarias — últimos 30 días</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dataConLabel} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltipVentas />} />
                <Area type="monotone" dataKey="total_ventas" stroke="#00C9A7" strokeWidth={2} fill="url(#gradTeal)" name="Ventas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico por día de la semana */}
          <div className="card-p">
            <h2 className="text-sm font-semibold text-slate-900 mb-5">Promedio por día de semana</h2>
            {datosDiaSemana.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={datosDiaSemana} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => [`$${v}`, 'Promedio']} />
                  <Bar dataKey="promedio" fill="#172B4D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-300 text-sm">Sin datos</div>
            )}
          </div>

          {/* Detalle por fecha */}
          <div className="lg:col-span-3 card-p overflow-hidden p-0">
            <div className="px-5 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">Detalle por fecha</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Fecha', 'Total Ventas', 'Transacciones', 'Ticket Prom.', 'Cumplimiento'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...analisis].reverse().map((d, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        {new Date(d.periodo).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-teal-600">{fmt(d.total_ventas)}</td>
                      <td className="px-4 py-2.5 text-slate-600">{d.numero_transacciones}</td>
                      <td className="px-4 py-2.5 text-slate-600">{fmt(d.ticket_promedio)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(d.tasa_cumplimiento, 100)}%` }} />
                          </div>
                          <span className="text-slate-500 w-8 text-right">{d.tasa_cumplimiento}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
