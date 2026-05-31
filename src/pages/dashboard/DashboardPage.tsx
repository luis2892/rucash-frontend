import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '../../components/Layout/Header';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, cliente, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login');
  }, [isAuthenticated, navigate]);

  const modules = [
    { icon: '💳', title: 'Punto de Venta', desc: 'Registrar ventas', link: '/pos', color: 'from-indigo-500 to-indigo-600' },
    { icon: '📦', title: 'Inventario', desc: 'Gestión de productos', link: '/inventario', color: 'from-emerald-500 to-emerald-600' },
    { icon: '💰', title: 'Financiero', desc: 'Ingresos y gastos', link: '/financiero', color: 'from-amber-500 to-amber-600' },
    { icon: '🎯', title: 'Metas', desc: 'Control de objetivos', link: '/metas', color: 'from-purple-500 to-purple-600' },
    { icon: '📊', title: 'Reportes', desc: 'Análisis de datos', link: '/reportes', color: 'from-blue-500 to-blue-600' },
    { icon: '🔐', title: 'Seguridad', desc: 'Configurar 2FA', link: '/enable-2fa', color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container-max py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Hola, {usuario?.nombre_completo?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 mt-1">{cliente?.nombre} · Plan {cliente?.plan}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ventas hoy', value: '$0.00', icon: '💳' },
            { label: 'Productos', value: '0', icon: '📦' },
            { label: 'Clientes', value: '0', icon: '👥' },
            { label: 'Meta mensual', value: '0%', icon: '🎯' },
          ].map(stat => (
            <div key={stat.label} className="card-compact">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Modules */}
        <h3 className="text-lg font-bold text-gray-900 mb-4">Módulos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modules.map(mod => (
            <Link
              key={mod.title}
              to={mod.link}
              className="card text-center hover:ring-2 hover:ring-indigo-500 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${mod.color} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                {mod.icon}
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{mod.title}</h4>
              <p className="text-sm text-gray-500">{mod.desc}</p>
            </Link>
          ))}
        </div>

        {/* User info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-compact">
            <h4 className="font-bold text-gray-800 mb-3">Mi Cuenta</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nombre</span><span className="font-medium">{usuario?.nombre_completo}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{usuario?.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rol</span>
                <span className="badge badge-info text-xs">{usuario?.rol}</span>
              </div>
            </div>
          </div>
          <div className="card-compact">
            <h4 className="font-bold text-gray-800 mb-3">Mi Tienda</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nombre</span><span className="font-medium">{cliente?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Plan</span>
                <span className="badge badge-success text-xs">{cliente?.plan}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Estado</span>
                <span className="badge badge-warning text-xs">{cliente?.estado}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
