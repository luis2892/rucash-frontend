import { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [detectedCodes, setDetectedCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!scannerRef.current) return;

    const initScanner = async () => {
      try {
        await Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              constraints: {
                width: { min: 640 },
                height: { min: 480 },
                facingMode: 'environment',
              },
              target: scannerRef.current,
            },
            decoder: {
              readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader'],
              debug: {
                drawBoundingBox: false,
                drawScanline: false,
              },
            },
          },
          (err: any) => {
            if (err) {
              console.error('Scanner init error:', err);
              setError('No se pudo iniciar la cámara. Usa el campo manual.');
            }
          }
        );

        Quagga.start();
        setCameraActive(true);

        Quagga.onDetected((result: any) => {
          if (result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            if (!detectedCodes.has(code)) {
              setDetectedCodes(prev => new Set([...prev, code]));
              onScan(code);
            }
          }
        });

        return () => {
          Quagga.stop();
        };
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Error al iniciar el scanner');
      }
    };

    initScanner();

    return () => {
      if (cameraActive) {
        Quagga.stop();
      }
    };
  }, [onScan, detectedCodes, cameraActive]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Escanear Código de Barras</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Scanner video */}
          <div
            ref={scannerRef}
            className="w-full bg-slate-900 rounded-xl overflow-hidden mb-4"
            style={{ minHeight: '300px' }}
          >
            <svg
              className="w-full h-full opacity-20"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text x="50" y="50" textAnchor="middle" fill="white" fontSize="12">
                Apunta a un código de barras
              </text>
            </svg>
          </div>

          {/* Manual input */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                O escribe el código manualmente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder="Ingresa código de barras..."
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="btn-primary px-4"
                >
                  Enviar
                </button>
              </div>
            </div>
          </form>

          {/* Detected codes history */}
          {detectedCodes.size > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-600 mb-2">
                Códigos detectados ({detectedCodes.size})
              </p>
              <div className="space-y-1">
                {Array.from(detectedCodes).map(code => (
                  <div key={code} className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                    <code className="text-sm font-mono text-green-700">{code}</code>
                    <span className="text-2xs text-green-600">✓ Detectado</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
