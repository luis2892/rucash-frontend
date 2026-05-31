import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Key, AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface Step1Response { secret: string; qrCode: string; backupCodes: string[]; message: string; }
interface Step2Form { code: string; }

export const Enable2FAPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Step1Response | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<Step2Form>({ defaultValues: { code: '' } });

  const handleStep1 = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await api.post('/auth/2fa/enable/step1');
      setData(response.data);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error habilitando 2FA');
    } finally { setIsLoading(false); }
  };

  const onSubmitStep2 = async (formData: Step2Form) => {
    setIsLoading(true); setError(null);
    try {
      const response = await api.post('/auth/2fa/enable/step2', { code: formData.code });
      setBackupCodes(response.data.backupCodes);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código incorrecto');
    } finally { setIsLoading(false); }
  };

  if (step === 1) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Habilitar 2FA</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">La autenticación de dos factores añade una capa extra de seguridad.</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <button onClick={handleStep1} disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
            {isLoading ? <><Loader size={20} className="animate-spin" /> Preparando...</> : <><Key size={20} /> Continuar</>}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 2 && data) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Escanear Código QR</h2>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <div className="mb-6 text-center">
            <img src={data.qrCode} alt="QR Code 2FA" className="mx-auto w-48 h-48 border rounded" />
            <p className="text-gray-600 text-sm mt-4">
              Clave manual: <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">{data.secret}</code>
            </p>
          </div>
          <p className="text-gray-600 text-sm mb-6">Usa Google Authenticator, Microsoft Authenticator o Authy.</p>
          <form onSubmit={handleSubmit(onSubmitStep2)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código de 6 dígitos</label>
              <input
                {...register('code', { required: 'Código requerido', pattern: { value: /^\d{6}$/, message: 'Debe ser 6 dígitos' } })}
                type="text" placeholder="000000" maxLength={6}
                className={`w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
              {isLoading ? <><Loader size={20} className="animate-spin" /> Verificando...</> : 'Verificar Código'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  if (step === 3 && backupCodes) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">2FA Habilitado ✅</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm font-semibold mb-3">⚠️ Códigos de Backup (guarda en lugar seguro):</p>
            <div className="grid grid-cols-2 gap-1 font-mono text-sm bg-white p-3 rounded">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="text-yellow-900 bg-yellow-50 px-2 py-1 rounded">{code}</div>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return null;
};
