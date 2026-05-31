import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Shield, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppLayout } from '../../components/Layout/AppLayout';

interface Step1Res { secret: string; qrCode: string; backupCodes: string[]; }
interface Step2Form { code: string; }

export const Enable2FAPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Step1Res | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Step2Form>({ defaultValues: { code: '' } });

  const step1 = async () => {
    setIsLoading(true); setError(null);
    try { const r = await api.post('/auth/2fa/enable/step1'); setData(r.data); setStep(2); }
    catch (e: any) { setError(e.response?.data?.message || 'Error'); }
    finally { setIsLoading(false); }
  };

  const step2 = async (form: Step2Form) => {
    setIsLoading(true); setError(null);
    try { const r = await api.post('/auth/2fa/enable/step2', { code: form.code }); setBackupCodes(r.data.backupCodes); setStep(3); }
    catch (e: any) { setError(e.response?.data?.message || 'Código incorrecto'); }
    finally { setIsLoading(false); }
  };

  const copySecret = () => {
    if (data?.secret) { navigator.clipboard.writeText(data.secret); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const steps = [
    { n: 1, label: 'Preparar' },
    { n: 2, label: 'Escanear QR' },
    { n: 3, label: 'Listo' },
  ];

  return (
    <AppLayout title="Autenticación de dos factores" subtitle="Agrega una capa extra de seguridad a tu cuenta">
      <div className="max-w-md mx-auto">
        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step >= s.n ? 'bg-navy-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > s.n ? <CheckCircle2 size={16} /> : s.n}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${step >= s.n ? 'text-navy-700' : 'text-slate-400'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${step > s.n ? 'bg-navy-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card-p">
          {/* Step 1 */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-navy-700/10 flex items-center justify-center mx-auto mb-5">
                <Shield size={28} className="text-navy-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Habilitar 2FA</h3>
              <p className="text-slate-500 text-sm mb-6">
                Usa Google Authenticator, Microsoft Authenticator o Authy para generar códigos temporales.
              </p>
              {error && <div className="alert-error mb-4"><AlertCircle size={14} /><span>{error}</span></div>}
              <Button variant="primary" size="lg" fullWidth isLoading={isLoading} onClick={step1}>
                Comenzar configuración
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && data && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Escanea el código QR</h3>
              <p className="text-slate-500 text-sm mb-5">Abre tu app de autenticación y escanea el código.</p>

              {error && <div className="alert-error mb-4"><AlertCircle size={14} /><span>{error}</span></div>}

              <div className="flex justify-center mb-5">
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-card">
                  <img src={data.qrCode} alt="QR 2FA" className="w-44 h-44" />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 mb-5">
                <code className="text-xs text-slate-600 font-mono flex-1 break-all">{data.secret}</code>
                <button onClick={copySecret} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                  <Copy size={14} className={copied ? 'text-teal-500' : 'text-slate-400'} />
                </button>
              </div>
              {copied && <p className="text-xs text-teal-500 text-center mb-3">¡Copiado!</p>}

              <form onSubmit={handleSubmit(step2)} className="space-y-4" noValidate>
                <Input label="Código de 6 dígitos" type="text" placeholder="000000" maxLength={6}
                  className="text-center text-xl tracking-[0.5em] font-mono"
                  error={errors.code?.message}
                  {...register('code', { required: 'Código requerido', pattern: { value: /^\d{6}$/, message: 'Deben ser 6 dígitos' } })}
                />
                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                  {isLoading ? 'Verificando...' : 'Verificar y activar'}
                </Button>
              </form>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && backupCodes && (
            <div>
              <div className="text-center mb-6">
                <CheckCircle2 className="mx-auto mb-4 text-teal-500" size={48} />
                <h3 className="text-xl font-bold text-slate-900 mb-1">2FA Activado</h3>
                <p className="text-slate-500 text-sm">Tu cuenta ahora tiene autenticación de dos factores.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-amber-800 mb-3">⚠️ Guarda estos códigos de respaldo en un lugar seguro</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-center font-mono text-xs font-semibold text-amber-900">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/dashboard')}>
                Ir al Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
