import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Producto } from '../../types';
import { Search, Plus, Minus, ShoppingCart, DollarSign, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Header } from '../../components/Layout/Header';

interface CartItem {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export const POSPage = () => {
  const { cliente } = useAuthStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [moneda, setMoneda] = useState<'USD' | 'SOL'>('USD');
  const [tipoCambio, setTipoCambio] = useState(3.8);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);

  const cargarProductos = useCallback(async () => {
    setLoadingProductos(true);
    try {
      const response = await api.get('/productos', { params: { search: searchTerm || undefined } });
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(cargarProductos, 300);
    return () => clearTimeout(timer);
  }, [cargarProductos]);

  // Cálculos
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const impuesto = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + impuesto) * 100) / 100;
  const montoPagadoNum = parseFloat(montoPagado) || 0;
  const cambio = Math.max(0, Math.round((montoPagadoNum - total) * 100) / 100);

  const agregarProducto = (producto: Producto) => {
    const precio = moneda === 'USD' ? producto.precio_usd : producto.precio_sol;
    const existente = cart.find(item => item.producto_id === producto.id);

    if (existente) {
      setCart(cart.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
          : item
      ));
    } else {
      setCart([...cart, {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio_unitario: precio,
        subtotal: precio,
      }]);
    }
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCart(cart.filter(item => item.producto_id !== productoId));
      return;
    }
    setCart(cart.map(item =>
      item.producto_id === productoId
        ? { ...item, cantidad, subtotal: cantidad * item.precio_unitario }
        : item
    ));
  };

  const completarVenta = async () => {
    if (cart.length === 0) return;
    if (metodoPago === 'EFECTIVO' && montoPagadoNum < total) {
      alert('Monto pagado insuficiente');
      return;
    }

    setLoading(true);
    try {
      await api.post('/ventas', {
        items: cart,
        moneda,
        metodo_pago: metodoPago,
        monto_pagado: metodoPago === 'TARJETA' ? total : montoPagadoNum,
      });
      setVentaCompletada(true);
      setTimeout(() => {
        setCart([]);
        setMontoPagado('');
        setVentaCompletada(false);
      }, 2500);
    } catch (error) {
      console.error('Error completando venta:', error);
      alert('Error completando venta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) =>
    moneda === 'USD' ? `$${amount.toFixed(2)}` : `S/${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* POS Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-max py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💳 Punto de Venta</h1>
              <p className="text-gray-500 text-sm">{cliente?.nombre}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={moneda === 'USD' ? 'primary' : 'secondary'} size="sm" onClick={() => setMoneda('USD')}>
                $ USD
              </Button>
              <Button variant={moneda === 'SOL' ? 'primary' : 'secondary'} size="sm" onClick={() => setMoneda('SOL')}>
                S/ SOL
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-max py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Productos ── */}
          <div className="lg:col-span-2 space-y-4">
            <Input
              placeholder="Buscar producto por nombre o código de barras..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />

            {loadingProductos ? (
              <div className="text-center py-12 text-gray-400">Cargando productos...</div>
            ) : productos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No hay productos disponibles</p>
                <p className="text-sm text-gray-400">Agrega productos desde el inventario</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productos.map(producto => (
                  <button
                    key={producto.id}
                    onClick={() => agregarProducto(producto)}
                    disabled={producto.stock_tienda === 0}
                    className={`card text-left transition-all ${producto.stock_tienda === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 hover:ring-indigo-500 hover:shadow-md'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{producto.nombre}</p>
                        <p className="text-xs text-gray-400 font-mono">{producto.codigo_barras}</p>
                      </div>
                      <Plus size={18} className="text-indigo-500 flex-shrink-0 ml-1" />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-lg font-bold text-indigo-600">
                        {moneda === 'USD' ? `$${producto.precio_usd.toFixed(2)}` : `S/${producto.precio_sol.toFixed(2)}`}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${producto.stock_tienda <= 5 ? 'text-red-500' : 'text-gray-400'}`}>
                        Stock: {producto.stock_tienda}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Carrito ── */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20 h-fit">

            {/* Items */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={20} /> Carrito
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center">
                    {cart.length}
                  </span>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">Carrito vacío — haz clic en un producto</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.producto_id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-1">{item.nombre}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                          <button onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                            className="p-1 hover:bg-gray-100 rounded transition">
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-bold">{item.cantidad}</span>
                          <button onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                            className="p-1 hover:bg-gray-100 rounded transition">
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatMoney(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Totales */}
            <Card compact>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span><span className="font-medium">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IGV (18%):</span><span className="font-medium">{formatMoney(impuesto)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">TOTAL</span>
                  <span className="text-2xl font-bold text-indigo-600">{formatMoney(total)}</span>
                </div>
              </div>
            </Card>

            {/* Tipo de cambio */}
            <Card compact>
              <Input
                label="Tipo de cambio (S/ por $1)"
                type="number"
                value={tipoCambio}
                onChange={e => setTipoCambio(parseFloat(e.target.value) || 3.8)}
                step="0.01"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formatMoney(total)} = {moneda === 'USD' ? `S/${(total * tipoCambio).toFixed(2)}` : `$${(total / tipoCambio).toFixed(2)}`}
              </p>
            </Card>

            {/* Pago */}
            <Card compact>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button variant={metodoPago === 'EFECTIVO' ? 'primary' : 'secondary'} size="sm" fullWidth
                    onClick={() => setMetodoPago('EFECTIVO')}>
                    💵 Efectivo
                  </Button>
                  <Button variant={metodoPago === 'TARJETA' ? 'primary' : 'secondary'} size="sm" fullWidth
                    onClick={() => setMetodoPago('TARJETA')}>
                    💳 Tarjeta
                  </Button>
                </div>

                {metodoPago === 'EFECTIVO' && (
                  <Input
                    label="Monto recibido"
                    type="number"
                    value={montoPagado}
                    onChange={e => setMontoPagado(e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    icon={<DollarSign size={18} />}
                  />
                )}

                {metodoPago === 'EFECTIVO' && montoPagadoNum > 0 && (
                  <div className={`p-3 rounded-lg ${cambio >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-semibold ${cambio >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      Cambio: {formatMoney(cambio)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Botón completar */}
            {ventaCompletada ? (
              <div className="bg-green-50 border border-green-300 p-4 rounded-xl text-center">
                <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
                <p className="text-green-800 font-bold">¡Venta completada!</p>
                <p className="text-green-600 text-sm">Cambio: {formatMoney(cambio)}</p>
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={completarVenta}
                isLoading={loading}
                disabled={cart.length === 0 || (metodoPago === 'EFECTIVO' && montoPagadoNum < total)}
              >
                ✅ Completar Venta — {formatMoney(total)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
