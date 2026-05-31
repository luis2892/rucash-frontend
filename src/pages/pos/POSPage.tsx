import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Producto } from '../../types';
import { Search, Plus, Minus, ShoppingCart, DollarSign, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppLayout } from '../../components/Layout/AppLayout';

interface CartItem {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

const fmt = (n: number, moneda: 'USD' | 'SOL') =>
  moneda === 'USD' ? `$${n.toFixed(2)}` : `S/${n.toFixed(2)}`;

export const POSPage = () => {
  const { cliente } = useAuthStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [moneda, setMoneda] = useState<'USD' | 'SOL'>('USD');
  const [tipoCambio, setTipoCambio] = useState(3.8);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProd, setLoadingProd] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mobileView, setMobileView] = useState<'productos' | 'carrito'>('productos');

  const fetchProductos = useCallback(async () => {
    setLoadingProd(true);
    try {
      const res = await api.get('/productos', { params: { search: search || undefined } });
      setProductos(res.data.productos || []);
    } catch { /* noop */ }
    finally { setLoadingProd(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProductos, 300);
    return () => clearTimeout(t);
  }, [fetchProductos]);

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + igv) * 100) / 100;
  const pagado = parseFloat(montoPagado) || 0;
  const cambio = Math.max(0, Math.round((pagado - total) * 100) / 100);

  const addProduct = (p: Producto) => {
    const precio = moneda === 'USD' ? p.precio_usd : p.precio_sol;
    setCart(prev => {
      const ex = prev.find(i => i.producto_id === p.id);
      if (ex) return prev.map(i => i.producto_id === p.id
        ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio_unitario }
        : i);
      return [...prev, { producto_id: p.id, nombre: p.nombre, cantidad: 1, precio_unitario: precio, subtotal: precio }];
    });
    // En mobile, mostrar notificación visual pero no forzar cambio de vista
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.producto_id !== id)); return; }
    setCart(prev => prev.map(i => i.producto_id === id ? { ...i, cantidad: qty, subtotal: qty * i.precio_unitario } : i));
  };

  const checkout = async () => {
    if (!cart.length) return;
    if (metodoPago === 'EFECTIVO' && pagado < total) { alert('Monto insuficiente'); return; }
    setLoading(true);
    try {
      await api.post('/ventas', {
        items: cart, moneda, metodo_pago: metodoPago,
        monto_pagado: metodoPago === 'TARJETA' ? total : pagado,
      });
      setSuccess(true);
      setTimeout(() => { setCart([]); setMontoPagado(''); setSuccess(false); }, 3000);
    } catch { alert('Error al procesar venta'); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title="Punto de Venta" subtitle={cliente?.nombre}>
      {/* ─── Mobile nav ─────────────────────────────── */}
      <div className="lg:hidden flex rounded-xl border border-slate-200 bg-white p-0.5 gap-0.5 mb-4">
        <button
          onClick={() => setMobileView('productos')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${mobileView === 'productos' ? 'bg-navy-700 text-white shadow-sm' : 'text-slate-500'}`}
        >
          <Search size={15} /> Productos
        </button>
        <button
          onClick={() => setMobileView('carrito')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 relative ${mobileView === 'carrito' ? 'bg-navy-700 text-white shadow-sm' : 'text-slate-500'}`}
        >
          <ShoppingCart size={15} /> Carrito
          {cart.length > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-teal-500 text-white text-2xs font-bold flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-5 min-h-0">

        {/* ── Productos ── */}
        <div className={`flex-1 min-w-0 flex flex-col gap-4 ${mobileView === 'carrito' ? 'hidden lg:flex' : ''}`}>
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o código de barras..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            {/* Moneda toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 gap-0.5 flex-shrink-0">
              {(['USD', 'SOL'] as const).map(m => (
                <button key={m} onClick={() => setMoneda(m)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${moneda === m ? 'bg-navy-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {m === 'USD' ? '$ USD' : 'S/ SOL'}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          {loadingProd ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Cargando productos...</div>
          ) : productos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">📦</div>
              <p className="text-slate-600 font-medium mb-1">No hay productos</p>
              <p className="text-sm text-slate-400">Agrega productos desde el módulo de Inventario</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {productos.map(p => {
                const precio = moneda === 'USD' ? p.precio_usd : p.precio_sol;
                const inCart = cart.find(i => i.producto_id === p.id)?.cantidad || 0;
                const lowStock = p.stock_tienda > 0 && p.stock_tienda <= 5;
                const noStock = p.stock_tienda === 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => !noStock && addProduct(p)}
                    disabled={noStock}
                    className={`card p-4 text-left relative transition-all group ${noStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-400 hover:shadow-card-hover cursor-pointer'}`}
                  >
                    {inCart > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">
                        {inCart}
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg mb-3 group-hover:bg-teal-50 transition-colors">
                      📦
                    </div>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight mb-1">{p.nombre}</p>
                    <p className="text-2xs text-slate-400 font-mono mb-2">{p.codigo_barras}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-lg font-bold text-navy-700">{fmt(precio, moneda)}</p>
                      <span className={`text-2xs font-semibold ${noStock ? 'text-red-500' : lowStock ? 'text-amber-500' : 'text-slate-400'}`}>
                        {noStock ? 'Sin stock' : `Stock: ${p.stock_tienda}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Panel derecho — Carrito ── */}
        <div className={`w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 ${mobileView === 'productos' ? 'hidden lg:flex' : ''}`}>

          {/* Cart header */}
          <div className="card-p flex-1 flex flex-col min-h-0" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-slate-600" />
                <span className="font-semibold text-slate-900 text-sm">Carrito</span>
                {cart.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={12} /> Vaciar
                </button>
              )}
            </div>

            {/* Items */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl mb-3">🛒</div>
                <p className="text-sm text-slate-400">El carrito está vacío</p>
                <p className="text-xs text-slate-300 mt-1">Haz clic en un producto para agregarlo</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1 mb-4">
                {cart.map(item => (
                  <div key={item.producto_id} className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.nombre}</p>
                      <p className="text-2xs text-slate-400">{fmt(item.precio_unitario, moneda)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg">
                        <button onClick={() => setQty(item.producto_id, item.cantidad - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors rounded-md">
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900">{item.cantidad}</span>
                        <button onClick={() => setQty(item.producto_id, item.cantidad + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-teal-600 transition-colors rounded-md">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-900 w-14 text-right">
                        {fmt(item.subtotal, moneda)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <>
                <div className="border-t border-slate-100 pt-4 space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span><span className="font-medium text-slate-700">{fmt(subtotal, moneda)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>IGV (18%)</span><span className="font-medium text-slate-700">{fmt(igv, moneda)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-xl font-extrabold text-navy-700">{fmt(total, moneda)}</span>
                  </div>
                  {moneda === 'USD' && (
                    <p className="text-2xs text-slate-400 text-right">≈ S/{(total * tipoCambio).toFixed(2)} @ {tipoCambio}</p>
                  )}
                </div>

                {/* Tipo de cambio */}
                <div className="mb-3">
                  <Input
                    label="Tipo de cambio"
                    type="number" step="0.01"
                    value={tipoCambio}
                    onChange={e => setTipoCambio(parseFloat(e.target.value) || 3.8)}
                    className="text-sm"
                  />
                </div>

                {/* Método de pago */}
                <div className="mb-3">
                  <p className="label">Método de pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['EFECTIVO', 'TARJETA'] as const).map(m => (
                      <button key={m} onClick={() => setMetodoPago(m)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${metodoPago === m ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        {m === 'EFECTIVO' ? '💵 Efectivo' : '💳 Tarjeta'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monto pagado */}
                {metodoPago === 'EFECTIVO' && (
                  <div className="mb-3">
                    <Input
                      label="Monto recibido"
                      type="number" step="0.01" placeholder="0.00"
                      value={montoPagado}
                      onChange={e => setMontoPagado(e.target.value)}
                      icon={<DollarSign size={14} />}
                    />
                    {pagado > 0 && (
                      <div className={`mt-2 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${cambio >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        <span>Cambio</span>
                        <span>{fmt(cambio, moneda)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                {success ? (
                  <div className="flex flex-col items-center justify-center py-5 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                    <p className="text-sm font-bold text-emerald-800">¡Venta completada!</p>
                    {metodoPago === 'EFECTIVO' && <p className="text-xs text-emerald-600 mt-0.5">Cambio: {fmt(cambio, moneda)}</p>}
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={loading}
                    onClick={checkout}
                    disabled={cart.length === 0 || (metodoPago === 'EFECTIVO' && pagado < total)}
                  >
                    {loading ? 'Procesando...' : `Cobrar ${fmt(total, moneda)}`}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
