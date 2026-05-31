import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Mail, Trash2, BarChart3, Shield, RefreshCw, UserPlus } from 'lucide-react';
import { AppLayout } from '../../components/Layout/AppLayout';

const ROL_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  VENDEDOR: 'bg-teal-100 text-teal-700',
  ALMACENERO: 'bg-blue-100 text-blue-700',
  CONTADOR: 'bg-amber-100 text-amber-700',
};

export const EquipoPage = () => {
  const [miembros, setMiembros] = useState<any[]>([]);
  const [invitaciones, setInvitaciones] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInvitar, setShowInvitar] = useState(false);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('VENDEDOR');
  const [enviando, setEnviando] = useState(false);
  const [enlaceInvitacion, setEnlaceInvitacion] = useState('');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [miembrosRes, invRes, rolesRes] = await Promise.all([
        api.get('/equipo'),
        api.get('/equipo/invitaciones/pendientes'),
        api.get('/equipo/roles/disponibles'),
      ]);
      setMiembros(miembrosRes.data.miembros || []);
      setInvitaciones(invRes.data.invitaciones || []);
      setRoles(rolesRes.data.roles || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const invitar = async () => {
    if (!email) return;
    setEnviando(true);
    try {
      const res = await api.post('/equipo/invitar', { email, rol });
      setEnlaceInvitacion(res.data.enlace);
      setEmail('');
      await cargarDatos();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setEnviando(false);
    }
  };

  const desactivar = async (id: string) => {
    if (!window.confirm('¿Desactivar este usuario?')) return;
    try {
      await api.delete(`/equipo/${id}`, { data: { razon: 'Desactivado por administrador' } });
      await cargarDatos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cancelarInvitacion = async (id: string) => {
    try {
      await api.delete(`/equipo/invitaciones/${id}`);
      setInvitaciones(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cambiarRol = async (id: string, rolNuevo: string) => {
    try {
      await api.put(`/equipo/${id}/rol`, { rol_nuevo: rolNuevo });
      await cargarDatos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">👥 Mi Equipo</h1>
          <p className="text-sm text-slate-500 mt-0.5">{miembros.length} miembro{miembros.length !== 1 ? 's' : ''} activo{miembros.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowInvitar(true); setEnlaceInvitacion(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition"
        >
          <UserPlus size={16} /> Invitar miembro
        </button>
      </div>

      {/* Invitaciones pendientes */}
      {invitaciones.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-3">⏳ Invitaciones pendientes ({invitaciones.length})</p>
          <div className="space-y-2">
            {invitaciones.map(inv => (
              <div key={inv.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.email}</p>
                  <p className="text-xs text-slate-400">Rol: {inv.rol} · Enviado {new Date(inv.fecha_envio).toLocaleDateString('es-PE')}</p>
                </div>
                <button
                  onClick={() => cancelarInvitacion(inv.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de miembros */}
      <div className="card-p">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Miembros activos</h2>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="animate-pulse h-14 bg-slate-100 rounded-xl" />)}
          </div>
        ) : miembros.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">👤</p>
            <p className="text-slate-500 text-sm">No hay miembros aún</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Miembro</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Rol</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Estado</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Se unió</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {miembros.map(m => (
                    <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{m.nombre_completo || '—'}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={m.rol}
                          onChange={e => cambiarRol(m.id, e.target.value)}
                          className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer ${ROL_COLORS[m.rol] || 'bg-slate-100 text-slate-600'}`}
                        >
                          {['ADMIN','VENDEDOR','ALMACENERO','CONTADOR'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.estado === 'ACTIVO' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                          {m.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">
                        {new Date(m.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button title="Performance" className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition">
                            <BarChart3 size={15} />
                          </button>
                          <button title="Permisos" className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-500 transition">
                            <Shield size={15} />
                          </button>
                          {m.estado === 'ACTIVO' ? (
                            <button onClick={() => desactivar(m.id)} title="Desactivar" className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition">
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <button title="Reactivar" className="p-1.5 hover:bg-teal-50 rounded-lg text-teal-500 transition">
                              <RefreshCw size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {miembros.map(m => (
                <div key={m.id} className="border border-slate-100 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{m.nombre_completo || '—'}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ROL_COLORS[m.rol] || 'bg-slate-100 text-slate-600'}`}>
                        {m.rol}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500">
                        <BarChart3 size={15} />
                      </button>
                      <button onClick={() => desactivar(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal invitar */}
      {showInvitar && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Invitar nuevo miembro</h2>

            {enlaceInvitacion ? (
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-teal-800 mb-1">✅ Invitación creada</p>
                  <p className="text-xs text-teal-700 break-all">{enlaceInvitacion}</p>
                </div>
                <p className="text-xs text-slate-500">Comparte este enlace con el nuevo miembro para que se registre.</p>
                <button
                  onClick={() => { setShowInvitar(false); setEnlaceInvitacion(''); }}
                  className="w-full py-2.5 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@empresa.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rol</label>
                  <select
                    value={rol}
                    onChange={e => setRol(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  >
                    {roles.length > 0
                      ? roles.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)
                      : ['VENDEDOR','ALMACENERO','CONTADOR'].map(r => <option key={r} value={r}>{r}</option>)
                    }
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowInvitar(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={invitar}
                    disabled={!email || enviando}
                    className="flex-1 py-2.5 bg-navy-700 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Mail size={15} />
                    {enviando ? 'Enviando...' : 'Invitar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};
