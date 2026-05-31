import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, CreditCard, Banknote } from 'lucide-react';

export const FlujoCajaPage = () => {
  const [proyeccion, setProyeccion] = useState<any[]>([]);
  const [reporte, setReporte] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/flujo-caja/proyeccion'),
      api.get('/flujo-caja/reporte'),
    ])
      .then(([pRes, rRes]) => {
        setProyeccion(pRes.data.proyeccion || []);
        setReporte(rRes.data.reporte);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-slate-400 text-sm">Cargando datos financieros...</div>
      </AppLayout>
    );
  }

  const saldoPositivo = (reporte?.saldo_neto || 0) >= 0;
  const metodoPago = reporte?.por_metodo_pago || {};

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Flujo de Caja</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Período: <span className="font-semibold text-slate-700">{reporte?.periodo}</span>
        </p>
      </div>

      {/* Resumen del mes — 3 tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-p">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <span className="badge badge-success">Este mes</span>
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Ingresos por ventas</p>
          <p className="text-3xl font-bold text-emerald-600">
            ${(reporte?.ingresos_mes || 0).toFixed(0)}
          </p>
          <p className="text-2xs text-slate-400 mt-1">{reporte?.ventas_count || 0} ventas registradas</p>
        </div>

        <div className="card-p">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <span className="badge badge-danger">Deudas</span>
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Total deudas activas</p>
          <p className="text-3xl font-bold text-red-600">
            ${(reporte?.total_deudas || 0).toFixed(0)}
          </p>
          <p className="text-2xs text-slate-400 mt-1">Interés mensual: ${(reporte?.interes_mensual || 0).toFixed(0)}</p>
        </div>

        <div className="card-p">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${saldoPositivo ? 'bg-teal-50' : 'bg-red-50'} rounded-xl flex items-center justify-center`}>
              <DollarSign size={20} className={saldoPositivo ? 'text-teal-600' : 'text-red-500'} />
            </div>
            <span className={`badge ${saldoPositivo ? 'badge-success' : 'badge-danger'}`}>
              {saldoPositivo ? 'Positivo' : 'Negativo'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Saldo neto (ingresos − intereses)</p>
          <p className={`text-3xl font-bold ${saldoPositivo ? 'text-teal-600' : 'text-red-600'}`}>
            ${(reporte?.saldo_neto || 0).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Proyección 6 meses */}
        <div className="lg:col-span-2 card-p">
          <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-teal-500" />
            Proyección 6 meses
          </h2>

          {/* Barras visuales */}
          <div className="space-y-3 mb-5">
            {proyeccion.map((mes, idx) => {
              const maxIngreso = Math.max(...proyeccion.map(m => m.ingresos), 1);
              const pct = Math.min(100, (mes.ingresos / maxIngreso) * 100);
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium capitalize">{mes.mes}</span>
                    <span className={`font-bold ${mes.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      Saldo: ${mes.saldo.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabla compacta */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-slate-500 font-medium">Mes</th>
                  <th className="text-right pb-2 text-slate-500 font-medium">Ingresos</th>
                  <th className="text-right pb-2 text-slate-500 font-medium">Egresos</th>
                  <th className="text-right pb-2 text-slate-500 font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {proyeccion.map((mes, idx) => (
                  <tr key={idx} className="border-b border-slate-50">
                    <td className="py-2 font-medium text-slate-700 capitalize">{mes.mes}</td>
                    <td className="py-2 text-right text-emerald-600 font-semibold">${mes.ingresos.toFixed(0)}</td>
                    <td className="py-2 text-right text-red-500">${mes.egresos.toFixed(0)}</td>
                    <td className={`py-2 text-right font-bold ${mes.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${mes.saldo.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar — métodos de pago + deudas */}
        <div className="space-y-4">
          {/* Por método de pago */}
          <div className="card-p">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={15} className="text-slate-400" />
              Ingresos por método
            </h3>
            {Object.keys(metodoPago).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin ventas este mes</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(metodoPago).map(([metodo, monto]: any) => {
                  const totalMes = reporte?.ingresos_mes || 1;
                  const pct = Math.round((monto / totalMes) * 100);
                  const icons: Record<string, string> = { EFECTIVO: '💵', TARJETA: '💳', YAPE: '📱', PLIN: '📱' };
                  return (
                    <div key={metodo}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600">{icons[metodo] || '💰'} {metodo}</span>
                        <span className="font-bold text-slate-900">${Number(monto).toFixed(0)} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full bg-navy-700 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deudas del reporte */}
          {reporte?.deudas?.length > 0 && (
            <div className="card-p">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Banknote size={15} className="text-slate-400" />
                Deudas activas
              </h3>
              <div className="space-y-2">
                {reporte.deudas.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-800">{d.acreedor}</p>
                      <p className="text-slate-400">{d.interes_anual}% anual</p>
                    </div>
                    <span className="font-bold text-red-600">${Number(d.monto_usd).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
