import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LogOut } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, cliente, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">💰 RUCASH Dashboard</h1>
            <p className="text-gray-600">Bienvenido a tu sistema de gestión</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Información del Usuario
            </h2>
            <div className="space-y-3">
              <p><strong>Nombre:</strong> {usuario?.nombre_completo}</p>
              <p><strong>Email:</strong> {usuario?.email}</p>
              <p>
                <strong>Rol:</strong>{' '}
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  {usuario?.rol}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Información de la Tienda
            </h2>
            <div className="space-y-3">
              <p><strong>Nombre:</strong> {cliente?.nombre}</p>
              <p>
                <strong>Plan:</strong>{' '}
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {cliente?.plan}
                </span>
              </p>
              <p><strong>Estado:</strong> {cliente?.estado}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6">
          <h3 className="font-bold text-yellow-800 mb-2">Próximas Funcionalidades</h3>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            <li>Punto de Venta (POS)</li>
            <li>Gestión de Inventario</li>
            <li>Análisis Financiero</li>
            <li>Control de Metas</li>
            <li>Reportes Personalizables</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
