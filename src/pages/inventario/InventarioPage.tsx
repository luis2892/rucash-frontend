import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { Search, Plus, Edit2, Trash2, Download, Eye, AlertCircle, Filter, X, Warehouse, Store } from 'lucide-react';

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
  nivel_maximo_stock?: number;
  marca_id?: string;
  discontinuado?: boolean;
  proveedor?: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Resumen {
  total_productos: number;
  tienda: {
    cantidad_total: number;
    valor_total: number;
    productos_stock_cero: number;
  };
  almacen: {
    cantidad_total: number;
    valor_total: number;
    productos_stock_cero: number;
  };
}

interface Alerta {
  id: string;
  nombre: string;
  tipo: 'STOCK_BAJO' | 'SIN_STOCK' | 'EXCESO';
  stock_actual: number;
  nivel_minimo: number;
}

export const InventarioPage = () => {
  const [activeTab, setActiveTab] = useState<'tienda' | 'almacen'>('tienda');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    try {
      const [respInventario, respAlertas, respResumen] = await Promise.all([
        api.get(`/inventario?ubicacion=${activeTab}`),
        api.get('/inventario/alertas'),
        api.get('/inventario/resumen'),
      ]);
      setProductos(respInventario.data.productos || []);
      setAlertas(respAlertas.data.alertas || []);
      setResumen(respResumen.data);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario, activeTab]);

  useEffect(() => {
    api.get('/categorias')
      .then(r => setCategorias(r.data.categorias || []))
      .catch(() => {});
  }, []);

  const descargarReporte = () => {
    const ubicacion = activeTab === 'tienda' ? 'Tienda' : 'Almacén';
    const headers = ['Código', 'Nombre', 'Categoría', 'Precio USD', `Stock ${ubicacion}`, 'Valor Total'];
    const stockField = activeTab === 'tienda' ? 'stock_tienda' : 'stock_almacen';
    const rows = productos.map(p => [
      p.codigo_barras,
      p.nombre,
      p.categoria || '',
      p.precio_usd.toFixed(2),
      p[stockField as keyof Producto],
      (p.precio_usd * (p[stockField as keyof Producto] as number)).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargarInventario();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const getIndicador = (producto: Producto) => {
    const stock = activeTab === 'tienda' ? producto.stock_tienda : producto.stock_almacen;
    const minimo = producto.nivel_minimo_stock || 5;
    const maximo = producto.nivel_maximo_stock || 100;

    if (stock === 0) return { tipo: 'SIN_STOCK', color: 'bg-red-100 border-red-300', icon: '🔴', label: 'Sin stock' };
    if (stock < minimo) return { tipo: 'STOCK_BAJO', color: 'bg-amber-100 border-amber-300', icon: '🟡', label: 'Stock bajo' };
    if (stock > maximo) return { tipo: 'EXCESO', color: 'bg-purple-100 border-purple-300', icon: '🟣', label: 'Exceso' };
    return { tipo: 'NORMAL', color: 'bg-green-100 border-green-300', icon: '🟢', label: 'Normal' };
  };

  const datosResumen = activeTab === 'tienda' ? resumen?.tienda : resumen?.almacen;
  const ubicacionLabel = activeTab === 'tienda' ? 'Tienda' : 'Almacén';

  const productosVisibles = productos.filter(p => {
    const matchSearch = !searchTerm ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_barras.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !selectedCategory || p.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tienda')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'tienda'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Store size={18} />
          Tienda
        </button>
        <button
          onClick={() => setActiveTab('almacen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'almacen'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Warehouse size={18} />
          Almacén
        </button>
      </div>

      {/* Resumen */}
      {datosResumen && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="card-p">
            <p className="text-xs text-slate-500 mb-1">Cantidad Total</p>
            <p className="text-2xl font-bold text-slate-900">{datosResumen.cantidad_total}</p>
          </div>
          <div className="card-p">
            <p className="text-xs text-slate-500 mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-teal-600">${datosResumen.valor_total.toFixed(2)}</p>
          </div>
          <div className={`card-p ${datosResumen.productos_stock_cero > 0 ? 'border-red-200' : ''}`}>
            <p className="text-xs text-slate-500 mb-1">Sin Stock</p>
            <p className={`text-2xl font-bold ${datosResumen.productos_stock_cero > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {datosResumen.productos_stock_cero}
            </p>
          </div>
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 space-y-2">
          {alertas.slice(0, 3).map(alerta => {
            const colors = alerta.tipo === 'SIN_STOCK' ? 'bg-red-50 border-red-200 text-red-800' :
                          alerta.tipo === 'STOCK_BAJO' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          'bg-purple-50 border-purple-200 text-purple-800';
            return (
              <div key={alerta.id} className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-sm ${colors}`}>
                <AlertCircle size={18} className="flex-shrink-0" />
                <span><strong>{alerta.nombre}</strong> - Stock: {alerta.stock_actual} (Mínimo: {alerta.nivel_minimo})</span>
              </div>
            );
          })}
          {alertas.length > 3 && (
            <p className="text-xs text-slate-500 text-center">+{alertas.length - 3} alertas más</p>
          )}
        </div>
      )}

      {/* Búsqueda y filtros */}
      <div className="card-p mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
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

      {/* Tabla */}
      <div className="card-p overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando...</div>
        ) : productosVisibles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No hay productos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Precio</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosVisibles.map(producto => {
                  const indicador = getIndicador(producto);
                  const stock = activeTab === 'tienda' ? producto.stock_tienda : producto.stock_almacen;
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
                        <span className={`font-bold ${indicador.tipo === 'SIN_STOCK' ? 'text-red-600' : indicador.tipo === 'STOCK_BAJO' ? 'text-amber-600' : 'text-slate-900'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-medium ${indicador.color}`}>
                          {indicador.icon} {indicador.label}
                        </span>
                      </td>
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

      {/* Modal */}
      {showModal && (
        <ProductoModal
          producto={editingProducto}
          categorias={categorias}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); cargarInventario(); }}
        />
      )}
    </AppLayout>
  );
};

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
    nivel_maximo_stock: producto?.nivel_maximo_stock?.toString() || '100',
    proveedor: producto?.proveedor || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
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
        nivel_maximo_stock: parseInt(form.nivel_maximo_stock),
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
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Stock Máximo</label>
              <input name="nivel_maximo_stock" type="number" value={form.nivel_maximo_stock} onChange={handleChange}
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
