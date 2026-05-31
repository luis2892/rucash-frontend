import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, TrendingDown,
  TrendingUp, Target, BarChart3, LineChart, Shield, LogOut, ChevronRight,
  Crown, Users,
} from 'lucide-react';
import { Logo } from '../ui/Logo';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard' },
  { icon: ShoppingCart,    label: 'Punto de Venta',   path: '/pos' },
  { icon: Package,         label: 'Inventario',       path: '/inventario' },
  { icon: TrendingDown,    label: 'Deudas',           path: '/deudas' },
  { icon: TrendingUp,      label: 'Flujo de Caja',    path: '/flujo-caja' },
  { icon: Target,          label: 'Metas',            path: '/metas' },
  { icon: LineChart,       label: 'Análisis',         path: '/analisis' },
  { icon: BarChart3,       label: 'Reportes',         path: '/reportes' },
  { icon: Crown,           label: 'Dashboard Dueño',  path: '/dashboard-dueno' },
  { icon: Users,           label: 'Mi Equipo',        path: '/equipo' },
];

const BOTTOM_NAV = [
  { icon: Shield, label: 'Seguridad 2FA', path: '/enable-2fa' },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { usuario, cliente, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-white border-r border-slate-200 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <Logo size="sm" />
      </div>

      {/* Plan badge */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-700/10 flex items-center justify-center text-sm font-bold text-navy-700">
            {cliente?.nombre?.[0]?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{cliente?.nombre || 'Mi Tienda'}</p>
            <p className="text-2xs text-slate-400 font-medium">{cliente?.plan || 'BÁSICO'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`${active ? 'nav-item-active' : 'nav-item'} group relative`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1 text-sm">{label}</span>
              {active && <ChevronRight size={14} className="opacity-40" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-slate-100 pt-3">
        {BOTTOM_NAV.map(({ icon: Icon, label, path }) => (
          <Link key={path} to={path} className={`${pathname === path ? 'nav-item-active' : 'nav-item'}`}>
            <Icon size={17} />
            <span className="text-sm">{label}</span>
          </Link>
        ))}

        {/* User section */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 mt-1 rounded-xl">
          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {usuario?.nombre_completo?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{usuario?.nombre_completo}</p>
            <p className="text-2xs text-slate-400 truncate">{usuario?.rol}</p>
          </div>
          <button onClick={handleLogout} className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
