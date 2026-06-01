import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ArrowLeft, History, AlertTriangle, Package, TrendingDown } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo_barras: string;
  categoria?: string;
  precio_usd: number;
  precio_sol: number;
  costo_usd?: number;
  stock_tienda: number;
  stock_almacen: number;
  nivel_minimo_stock?: number;
  proveedor?: string;
  discontinuado?: boolean;
  fecha_discontinuado?: string;
}

interface AuditoriaEntry {
  id: string;
  accion: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  razon?: string;
  created_at: string;
}

export const ProductoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [auditoria, setAuditoria] = useState<AuditoriaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjStock, setAdjStock] = useState({ tipo: 'tienda', cantidad: '', notas: '' });
  const [adjSaving, setAdjSaving] = useState(false);

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(prodRes => {
        setProducto(prodRes.data.producto);
        setAuditoria([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const ajustarStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjStock.cantidad || !producto) return;
    setAdjSaving(true);
    try {
      const delta = parseInt(adjStock.cantidad);
      const campo = adjStock.tipo === 'tienda' ? 'stock_tienda' : 'stock_almacen';
      const valorActual = adjStock.tipo === 'tienda' ? producto.stock_tienda : producto.stock_almacen;
      const payload = { [campo]: valorActual + delta };
      const response = await api.patch(`/productos/${id}`, payload);
      setProducto(response.data.producto);
      setAdjStock({ tipo: 'tienda', cantidad: '', notas: '' });
    } catch (error) {
      console.error('Error ajustando stock:', error);
    } finally {
      setAdjSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-slate-400 text-sm">Cargando...</div>
      </AppLayout>
    );
  }

  if (!producto) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-slate-400 text-sm">Producto no encontrado</div>
      </AppLayout>
    );
  }

  const bajoDemanda = producto.stock_tienda < (producto.nivel_minimo_stock || 5);
  const margenUSD = producto.costo_usd ? ((producto.precio_usd - producto.costo_usd) / producto.precio_usd * 100).toFixed(1) : null;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/inventario')}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{producto.nombre}</h1>
          {producto.categoria && (
            <span className="badge badge-navy text-2xs mt-1">{producto.categoria}</span>
          )}
        </div>
        {producto.discontinuado && (
          <span className="badge bg-red-100 text-red-700 border-red-200">Discontinuado</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info + Stock */}
        <div className="lg:col-span-2 space-y-5">
          {/* Información general */}
          <div className="card-p">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={16} className="text-teal-500" />
              Información General
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Código de Barras</p>
                <p className="font-mono font-semibold text-slate-800">{producto.codigo_barras}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Proveedor</p>
                <p className="font-semibold text-slate-800">{producto.proveedor || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Precio USD</p>
                <p className="text-xl font-bold text-teal-600">${producto.precio_usd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Precio SOL</p>
                <p className="text-xl font-bold text-teal-600">S/{producto.precio_sol.toFixed(2)}</p>
              </div>
              {producto.costo_usd && (
                <>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Costo USD</p>
                    <p className="font-semibold text-slate-800">${producto.costo_usd.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Margen</p>
                    <p className="font-semibold text-emerald-600">{margenUSD}%</p>
                  </div>
                </>
              )}
            </div>
            {producto.descripcion && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Descripción</p>
                <p className="text-sm text-slate-700">{producto.descripcion}</p>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="card-p">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Stock</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-xl ${bajoDemanda ? 'bg-red-50' : 'bg-teal-50'}`}>
                <p className="text-xs text-slate-500 mb-1">Tienda</p>
                <p className={`text-3xl font-bold ${bajoDemanda ? 'text-red-600' : 'text-teal-600'}`}>
                  {producto.stock_tienda}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">mín. {producto.nivel_minimo_stock || 5}</p>
              </div>
              <div className="bg-navy-50 p-4 rounded-xl" style={{ background: '#f0f4ff' }}>
                <p className="text-xs text-slate-500 mb-1">Almacén</p>
                <p className="text-3xl font-bold text-navy-700" style={{ color: '#172B4D' }}>
                  {producto.stock_almacen}
                </p>
              </div>
            </div>

            {bajoDemanda && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                Stock en tienda por debajo del nivel mínimo
              </div>
            )}

            {/* Ajuste de stock */}
            <form onSubmit={ajustarStock} className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <TrendingDown size={14} />
                Ajustar Stock
              </p>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={adjStock.tipo}
                  onChange={e => setAdjStock(p => ({ ...p, tipo: e.target.value }))}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="tienda">Tienda</option>
                  <option value="almacen">Almacén</option>
                </select>
                <input
                  type="number"
                  placeholder="±cantidad"
                  value={adjStock.cantidad}
                  onChange={e => setAdjStock(p => ({ ...p, cantidad: e.target.value }))}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button type="submit" disabled={adjSaving} className="btn-primary text-xs py-1.5">
                  {adjSaving ? '...' : 'Aplicar'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Notas (opcional)"
                value={adjStock.notas}
                onChange={e => setAdjStock(p => ({ ...p, notas: e.target.value }))}
                className="mt-2 w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </form>
          </div>

          {/* Historial de cambios */}
          <div className="card-p">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              Historial de Cambios
            </h2>
            {auditoria.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">Sin cambios registrados</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditoria.map(entry => (
                  <div key={entry.id} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-navy text-2xs">{entry.accion}</span>
                      <span className="text-2xs text-slate-400">
                        {new Date(entry.created_at).toLocaleString('es-PE')}
                      </span>
                    </div>
                    {entry.campo_modificado && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">{entry.campo_modificado}:</span>{' '}
                        <span className="text-red-500">{entry.valor_anterior}</span>
                        {' → '}
                        <span className="text-green-600">{entry.valor_nuevo}</span>
                      </p>
                    )}
                    {entry.razon && (
                      <p className="text-xs text-slate-400 mt-0.5">Razón: {entry.razon}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="card-p">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Métricas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total stock</span>
                <span className="text-sm font-bold text-slate-800">
                  {producto.stock_tienda + producto.stock_almacen}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor tienda</span>
                <span className="text-sm font-semibold text-teal-600">
                  ${(producto.precio_usd * producto.stock_tienda).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valor almacén</span>
                <span className="text-sm font-semibold text-slate-600">
                  ${(producto.precio_usd * producto.stock_almacen).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Valor total</span>
                <span className="text-sm font-bold text-slate-900">
                  ${(producto.precio_usd * (producto.stock_tienda + producto.stock_almacen)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/inventario`)}
            className="btn-secondary w-full"
          >
            ← Volver al inventario
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
