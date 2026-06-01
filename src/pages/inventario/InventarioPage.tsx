import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { Search, Plus, Edit2, Trash2, Download, Eye, AlertCircle, Filter, X } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo_barras: string;
  categoria?: string;
  precio_usd: number;
  precio_sol: number;
  stock_tienda: number;
  stock_almacen: number;
  nivel_minimo_stock?: number;
  discontinuado?: boolean;
  proveedor?: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

export const InventarioPage = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/productos/buscar', {
        params: {
          search: searchTerm || undefined,
          categoria: selectedCategory || undefined,
        },
      });
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    api.get('/categorias')
      .then(r => setCategorias(r.data.categorias || []))
      .catch(() => {});
  }, []);

  const descargarReporte = () => {
    // Exportar inventario local como CSV desde los datos ya cargados
    const headers = ['Código', 'Nombre', 'Categoría', 'Precio USD', 'Precio SOL', 'Stock Tienda', 'Stock Almacén'];
    const rows = productos.map(p => [
      p.codigo_barras, p.nombre, p.categoria || '', p.precio_usd.toFixed(2),
      p.precio_sol.toFixed(2), p.stock_tienda, p.stock_almacen,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const totalProductos = productos.length;
  const totalValor = productos.reduce((sum, p) => sum + p.precio_usd * (p.stock_tienda + p.stock_almacen), 0);
  const sinStock = productos.filter(p => p.stock_tienda === 0).length;
  const stockBajo = productos.filter(p => p.stock_tienda < (p.nivel_minimo_stock || 5)).length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de productos y stock</p>
        </div>
        <button
          onClick={() => { setEditingProducto(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Productos', value: totalProductos, color: 'text-slate-900' },
          { label: 'Valor Inventario', value: `$${totalValor.toFixed(2)}`, color: 'text-teal-600' },
          { label: 'Sin Stock', value: sinStock, color: sinStock > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Stock Bajo', value: stockBajo, color: stockBajo > 0 ? 'text-amber-600' : 'text-green-600' },
        ].map(m => (
          <div key={m.label} className="card-p">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Búsqueda y filtros */}
      <div className="card-p mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o descripción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-1.5 ${showFilters ? 'bg-teal-50 border-teal-300 text-teal-700' : ''}`}
          >
            <Filter size={16} />
            Filtros
          </button>
          <button onClick={descargarReporte} className="btn-secondary flex items-center gap-1.5">
            <Download size={16} />
            CSV
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Categoría</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="mt-4 p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alertas */}
      {sinStock > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-800">
          <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
          <span><strong>{sinStock}</strong> producto{sinStock > 1 ? 's' : ''} sin stock en tienda</span>
        </div>
      )}

      {/* Tabla */}
      <div className="card-p overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando...</div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No hay productos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Precio USD</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Tienda</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Almacén</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => {
                  const bajoDemanda = producto.stock_tienda < (producto.nivel_minimo_stock || 5);
                  return (
                    <tr key={producto.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{producto.codigo_barras}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{producto.nombre}</p>
                        {producto.descripcion && (
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{producto.descripcion}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {producto.categoria ? (
                          <span className="badge badge-navy text-2xs">{producto.categoria}</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        ${producto.precio_usd.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${bajoDemanda ? 'text-red-600' : 'text-slate-900'}`}>
                          {producto.stock_tienda}
                        </span>
                        {bajoDemanda && (
                          <span className="ml-1 text-red-400 text-xs">⚠</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{producto.stock_almacen}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/inventario/${producto.id}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => { setEditingProducto(producto); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <ProductoModal
          producto={editingProducto}
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); cargarProductos(); }}
        />
      )}
    </AppLayout>
  );
};

// ── Modal de Crear/Editar ─────────────────────────────────────────────────────

interface ProductoModalProps {
  producto: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSave: () => void;
}

const ProductoModal = ({ producto, categorias, onClose, onSave }: ProductoModalProps) => {
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    codigo_barras: producto?.codigo_barras || '',
    categoria: producto?.categoria || '',
    precio_usd: producto?.precio_usd?.toString() || '',
    precio_sol: producto?.precio_sol?.toString() || '',
    costo_usd: producto?.precio_usd?.toString() || '',
    stock_tienda: producto?.stock_tienda?.toString() || '0',
    stock_almacen: producto?.stock_almacen?.toString() || '0',
    nivel_minimo_stock: producto?.nivel_minimo_stock?.toString() || '5',
    proveedor: producto?.proveedor || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // Auto-calc sol from usd
      if (name === 'precio_usd' && value) {
        next.precio_sol = (parseFloat(value) * 3.8).toFixed(2);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        precio_usd: parseFloat(form.precio_usd),
        precio_sol: parseFloat(form.precio_sol),
        costo_usd: form.costo_usd ? parseFloat(form.costo_usd) : undefined,
        stock_tienda: parseInt(form.stock_tienda),
        stock_almacen: parseInt(form.stock_almacen),
        nivel_minimo_stock: parseInt(form.nivel_minimo_stock),
      };

      if (producto) {
        await api.patch(`/productos/${producto.id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Código de Barras *</label>
              <input name="codigo_barras" value={form.codigo_barras} onChange={handleChange} required
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Precio USD *</label>
              <input name="precio_usd" type="number" step="0.01" value={form.precio_usd} onChange={handleChange} required
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Precio SOL</label>
              <input name="precio_sol" type="number" step="0.01" value={form.precio_sol} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Costo USD</label>
              <input name="costo_usd" type="number" step="0.01" value={form.costo_usd} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Proveedor</label>
              <input name="proveedor" value={form.proveedor} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Stock Tienda</label>
              <input name="stock_tienda" type="number" value={form.stock_tienda} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Stock Almacén</label>
              <input name="stock_almacen" type="number" value={form.stock_almacen} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Stock Mínimo</label>
              <input name="nivel_minimo_stock" type="number" value={form.nivel_minimo_stock} onChange={handleChange}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Guardando...' : producto ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
