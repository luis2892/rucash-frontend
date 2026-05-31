// Header para móvil (el Sidebar cubre desktop)
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Header = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        <Logo size="xs" />
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="bg-white border-t border-slate-100 px-4 py-3 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: ShoppingCart, label: 'Punto de Venta', path: '/pos' },
          ].map(({ icon: Icon, label, path }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${pathname === path ? 'bg-navy-700/8 text-navy-700' : 'text-slate-600 hover:bg-slate-50'}`}
              style={pathname === path ? { backgroundColor: 'rgba(23,43,77,0.08)', color: '#172B4D' } : undefined}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
};
