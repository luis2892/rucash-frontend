import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

export const Header = () => {
  const navigate = useNavigate();
  const { usuario, cliente, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="page-header sticky top-0 z-50">
      <div className="container-max">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              💰
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">RUCASH</h1>
              <p className="text-xs text-gray-500">Tu RUC, Tu Negocio</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/pos" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
              💳 POS
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
              📊 Dashboard
            </Link>
          </nav>

          {/* Desktop user */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{usuario?.nombre_completo}</p>
              <p className="text-xs text-gray-500">{cliente?.nombre}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/enable-2fa">
                <Button variant="ghost" size="sm"><Settings size={18} /></Button>
              </Link>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                <LogOut size={18} />
                Salir
              </Button>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <div className="px-4 py-2 text-sm text-gray-600 font-medium">{usuario?.nombre_completo}</div>
            <Link to="/pos" onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              💳 Punto de Venta
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              📊 Dashboard
            </Link>
            <Button variant="danger" size="sm" fullWidth onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              <LogOut size={18} /> Salir
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
