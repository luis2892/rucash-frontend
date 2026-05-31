import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, TrendingDown,
  TrendingUp, Target, BarChart3, LineChart, Shield, LogOut, ChevronRight,
  Crown, Users, Settings, CreditCard, DollarSign, Truck,
} from 'lucide-react';
import { Logo } from '../ui/Logo';

const NAV_OPERACIONES = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard' },
  { icon: ShoppingCart,    label: 'Punto de Venta',   path: '/pos' },
  { icon: Package,         label: 'Inventario',       path: '/inventario' },
  { icon: Truck,           label: 'Proveedores',      path: '/inventario/proveedores' },
];

const NAV_FINANZAS = [
  { icon: DollarSign,      label: 'Financiero',       path: '/finanzas' },
  { icon: TrendingDown,    label: 'Deudas',           path: '/finanzas/deudas' },
  { icon: TrendingUp,      label: 'Flujo de Caja',    path: '/flujo-caja' },
];

const NAV_ANALISIS = [
  { icon: Target,          label: 'Metas',            path: '/metas' },
  { icon: LineChart,       label: 'Análisis',         path: '/analisis' },
  { icon: BarChart3,       label: 'Reportes',         path: '/reportes' },
  { icon: Crown,           label: 'Dashboard Dueño',  path: '/dashboard-dueno' },
  { icon: Users,           label: 'Mi Equipo',        path: '/equipo' },
];

const NAV_ADMIN = [
  { icon: CreditCard,      label: 'Suscripciones',    path: '/admin/suscripciones' },
  { icon: Settings,        label: 'Configuración',    path: '/admin/configuracion' },
];

const BOTTOM_NAV = [
  { icon: Shield, label: 'Seguridad 2FA', path: '/enable-2fa' },
];

type NavItem = { icon: any; label: string; path: string };

const NavGroup = ({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) => (
  <div className="mb-2">
    <p className="px-3.5 pb-1 pt-2 text-2xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
    {items.map(({ icon: Icon, label, path }) => {
      const active = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
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
  </div>
);

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { usuario, cliente, logout, isAdminSistema } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const esAdmin = isAdminSistema();

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
            <div className="flex items-center gap-1.5">
              <p className="text-2xs text-slate-400 font-medium">{cliente?.plan || 'BÁSICO'}</p>
              {esAdmin && (
                <span className="text-2xs bg-teal-500 text-white px-1 rounded font-bold">ADMIN</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <NavGroup title="Operaciones" items={NAV_OPERACIONES} pathname={pathname} />
        <NavGroup title="Finanzas" items={NAV_FINANZAS} pathname={pathname} />
        <NavGroup title="Análisis" items={NAV_ANALISIS} pathname={pathname} />

        {/* Sección admin — solo Luis */}
        {esAdmin && (
          <div className="mt-2 mb-2">
            <p className="px-3.5 pb-1 pt-2 text-2xs font-semibold text-teal-500 uppercase tracking-wider">
              ⚙ Sistema TARUK
            </p>
            {NAV_ADMIN.map(({ icon: Icon, label, path }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`${active ? 'nav-item-active' : 'nav-item'} group relative`}
                >
                  <Icon size={17} className="flex-shrink-0 text-teal-500" />
                  <span className="flex-1 text-sm">{label}</span>
                  {active && <ChevronRight size={14} className="opacity-40" />}
                </Link>
              );
            })}
          </div>
        )}
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
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${esAdmin ? 'bg-teal-500' : 'bg-navy-700'}`}>
            {usuario?.nombre_completo?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{usuario?.nombre_completo}</p>
            <p className="text-2xs text-slate-400 truncate">{esAdmin ? 'Super Admin' : usuario?.rol}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
