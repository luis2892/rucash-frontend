import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/api';

interface FinancieroData {
  totalDeudas: number;
  totalPagado: number;
  deudas_activas: number;
  saldo_total: number;
}

export const FinancieroPage = () => {
  const [data, setData] = useState<FinancieroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deudas, setDeudas] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deudasRes, cuentasRes] = await Promise.all([
          api.get('/deudas?estado=ACTIVA'),
          api.get('/cuentas'),
        ]);

        const deudas = deudasRes.data.deudas || [];
        const cuentas = cuentasRes.data.cuentas || [];

        const totalDeudas = deudas.reduce((sum: number, d: any) => sum + d.monto_usd, 0);
        const saldoTotal = cuentas.reduce((sum: number, c: any) => sum + c.saldo, 0);

        setData({
          totalDeudas,
          totalPagado: 0,
          deudas_activas: deudas.length,
          saldo_total: saldoTotal,
        });

        setDeudas(deudas.slice(0, 5)); // Últimas 5 deudas
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  const deudasPróximas = deudas.filter(d => {
    const daysLeft = Math.ceil((new Date(d.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign size={32} className="text-teal-500" />
          Financiero
        </h1>
        <p className="text-slate-600 mt-2">Resumen de deudas, cuentas y flujo de caja</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-600 text-sm mb-2">Total Deudas</div>
              <div className="text-3xl font-bold text-slate-900">${data?.totalDeudas.toFixed(2)}</div>
            </div>
            <TrendingDown size={32} className="text-red-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-600 text-sm mb-2">Saldo en Cuentas</div>
              <div className="text-3xl font-bold text-slate-900">${data?.saldo_total.toFixed(2)}</div>
            </div>
            <TrendingUp size={32} className="text-teal-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-600 text-sm mb-2">Deudas Activas</div>
              <div className="text-3xl font-bold text-slate-900">{data?.deudas_activas}</div>
            </div>
            <AlertTriangle size={32} className="text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-600 text-sm mb-2">Neto</div>
              <div className={`text-3xl font-bold ${((data?.saldo_total || 0) - (data?.totalDeudas || 0)) >= 0 ? 'text-teal-500' : 'text-red-500'}`}>
                ${((data?.saldo_total || 0) - (data?.totalDeudas || 0)).toFixed(2)}
              </div>
            </div>
            <DollarSign size={32} className="text-navy-700 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Alertas */}
      {deudasPróximas.length > 0 && (
        <Card className="p-6 mb-8 border-l-4 border-orange-500 bg-orange-50">
          <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2 mb-3">
            <AlertTriangle size={20} /> Deudas próximas a vencer
          </h2>
          <div className="space-y-2">
            {deudasPróximas.map(d => (
              <div key={d.id} className="flex justify-between items-center p-2 bg-white rounded">
                <div>
                  <div className="font-medium text-slate-900">{d.concepto}</div>
                  <div className="text-sm text-slate-600">{d.acreedor}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">${d.monto_usd}</div>
                  <div className="text-xs text-slate-600">{new Date(d.fecha_vencimiento).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/finanzas/deudas">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              Deudas <ArrowRight size={16} className="text-teal-500" />
            </h3>
            <p className="text-slate-600 text-sm">Gestiona todas tus deudas</p>
          </Card>
        </Link>

        <Link to="/finanzas/cuentas">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              Cuentas <ArrowRight size={16} className="text-teal-500" />
            </h3>
            <p className="text-slate-600 text-sm">Tus cuentas bancarias</p>
          </Card>
        </Link>

        <Link to="/finanzas/flujo-caja">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              Flujo de Caja <ArrowRight size={16} className="text-teal-500" />
            </h3>
            <p className="text-slate-600 text-sm">Análisis de flujos</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};
