import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';
import {
  ShoppingCart, Package, TrendingUp, TrendingDown, Target,
  BarChart3, LineChart, ArrowUpRight, Clock,
} from 'lucide-react';

const MODULES = [
  { icon: ShoppingCart, label: 'Punto de Venta', desc: 'Registrar ventas',    path: '/pos',        color: 'bg-navy-700',    available: true  },
  { icon: Package,      label: 'Inventario',     desc: 'Gestión de productos',path: '/inventario', color: 'bg-emerald-600', available: true  },
  { icon: TrendingDown, label: 'Deudas',         desc: 'Control de deudas',   path: '/deudas',     color: 'bg-amber-500',   available: true  },
  { icon: TrendingUp,   label: 'Flujo de Caja',  desc: 'Análisis financiero', path: '/flujo-caja', color: 'bg-sky-600',     available: true  },
  { icon: Target,       label: 'Metas',          desc: 'Objetivos y avance',  path: '/metas',      color: 'bg-purple-600',  available: true  },
  { icon: LineChart,    label: 'Análisis',        desc: 'Performance ventas',  path: '/analisis',   color: 'bg-rose-500',    available: true  },
  { icon: BarChart3,    label: 'Reportes',        desc: 'Exportar datos',      path: '/reportes',   color: 'bg-slate-500',   available: false },
];

const STATS = [
  { label: 'Ventas hoy', value: '$0.00', delta: '—', icon: '💳', up: null },
  { label: 'Productos activos', value: '0', delta: '—', icon: '📦', up: null },
  { label: 'Clientes', value: '0', delta: '—', icon: '👥', up: null },
  { label: 'Meta mensual', value: '0%', delta: '—', icon: '🎯', up: null },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, cliente, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login');
  }, [isAuthenticated, navigate]);

  const firstName = usuario?.nombre_completo?.split(' ')[0] || 'Usuario';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <AppLayout>
      {/* ── Welcome banner ── */}
      <div className="rounded-2xl bg-navy-700 px-7 py-6 mb-7 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-navy-800/40 rounded-full blur-xl" />
        <div className="relative z-10">
          <p className="text-teal-400 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-white mb-0.5">{firstName}</h1>
          <p className="text-slate-400 text-sm">{cliente?.nombre} · Plan <span className="text-teal-400 font-semibold">{cliente?.plan}</span></p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="card-p">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className="flex items-center gap-1 text-2xs text-slate-400 font-medium">
                <Clock size={10} /> Hoy
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Modules ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Módulos</h2>
          <span className="text-xs text-slate-400">{MODULES.filter(m => m.available).length} disponibles</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODULES.map(({ icon: Icon, label, desc, path, color, available }) => (
            <Link
              key={label}
              to={available ? path : '#'}
              onClick={!available ? e => e.preventDefault() : undefined}
              className={`card p-5 text-center group flex flex-col items-center ${available ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
            >
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 ${available ? 'group-hover:scale-105' : ''}`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-0.5 leading-tight">{label}</p>
              <p className="text-2xs text-slate-400">{desc}</p>
              {available ? (
                <span className="mt-2 inline-flex items-center gap-0.5 text-2xs font-semibold text-teal-600">
                  Abrir <ArrowUpRight size={10} />
                </span>
              ) : (
                <span className="mt-2 text-2xs text-slate-300 font-medium">Próximamente</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Account info ── */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Mi cuenta',
            rows: [
              { label: 'Nombre', value: usuario?.nombre_completo },
              { label: 'Email', value: usuario?.email },
              { label: 'Rol', value: usuario?.rol, badge: true },
            ],
          },
          {
            title: 'Mi tienda',
            rows: [
              { label: 'Nombre', value: cliente?.nombre },
              { label: 'Plan', value: cliente?.plan, badge: true },
              { label: 'Estado', value: cliente?.estado, badge: true },
            ],
          },
        ].map(section => (
          <div key={section.title} className="card-p">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{row.label}</span>
                  {row.badge ? (
                    <span className="badge badge-navy text-2xs">{row.value}</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-800 truncate max-w-[180px]">{row.value || '—'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};
