import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { BarcodeScanner } from '../../components/Scanner/BarcodeScanner';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ProductoEncontrado {
  id: string;
  nombre: string;
  codigo_barras: string;
  precio_usd: number;
  stock_tienda: number;
  stock_almacen: number;
}

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(true);
  const [productosEscanedos, setProductosEscanedos] = useState<ProductoEncontrado[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleScan = async (barcode: string) => {
    try {
      const response = await api.post('/inventario/scan', { codigo_barras: barcode });
      const producto = response.data.producto;

      setProductosEscanedos(prev => {
        const existe = prev.find(p => p.id === producto.id);
        if (existe) return prev;
        return [...prev, producto];
      });

      setErrors(prev => prev.filter(e => !e.includes(barcode)));
    } catch (error: any) {
      const mensaje = `Código ${barcode} no encontrado`;
      setErrors(prev => {
        if (prev.includes(mensaje)) return prev;
        return [...prev, mensaje];
      });

      setTimeout(() => {
        setErrors(prev => prev.filter(e => e !== mensaje));
      }, 5000);
    }
  };

  const agregarAlCarrito = (producto: ProductoEncontrado) => {
    navigate('/pos', { state: { productoParaAgregar: producto } });
  };

  const eliminar = (id: string) => {
    setProductosEscanedos(prev => prev.filter(p => p.id !== id));
  };

  const limpiar = () => {
    setProductosEscanedos([]);
    setErrors([]);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/inventario')}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lector de Códigos</h1>
            <p className="text-sm text-slate-500 mt-0.5">Escanea productos para agregarlos</p>
          </div>
        </div>

        {/* Errores */}
        {errors.length > 0 && (
          <div className="mb-6 space-y-2">
            {errors.map((error, i) => (
              <div key={i} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Scanner Modal */}
        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Productos escaneados */}
        {productosEscanedos.length > 0 && (
          <div className="card-p mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Productos Escaneados</h2>
                <p className="text-sm text-slate-500">{productosEscanedos.length} producto{productosEscanedos.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="btn-secondary"
              >
                Escanear Más
              </button>
            </div>

            <div className="space-y-3">
              {productosEscanedos.map(producto => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <p className="font-semibold text-slate-900">{producto.nombre}</p>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{producto.codigo_barras}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      <span>💰 ${producto.precio_usd.toFixed(2)}</span>
                      <span>🏪 Stock: {producto.stock_tienda}</span>
                      <span>🏭 Almacén: {producto.stock_almacen}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="btn-primary px-4"
                    >
                      Vender
                    </button>
                    <button
                      onClick={() => eliminar(producto.id)}
                      className="btn-secondary px-4"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3 pt-4 border-t border-slate-200">
              <button onClick={limpiar} className="flex-1 btn-secondary">
                Limpiar Lista
              </button>
              <button onClick={() => navigate('/pos')} className="flex-1 btn-primary">
                Ir al POS
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {productosEscanedos.length === 0 && !showScanner && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No hay productos escaneados</p>
            <button
              onClick={() => setShowScanner(true)}
              className="btn-primary"
            >
              Abrir Lector
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
