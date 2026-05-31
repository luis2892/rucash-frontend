export const validarEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validarPassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

export const validarCodigoBarras = (codigo: string): boolean => {
  return /^\d{8,13}$/.test(codigo);
};

export const validarMonto = (monto: number): boolean => {
  return monto > 0 && isFinite(monto);
};

export const calcularImpuesto = (monto: number, tasa = 0.18): number => {
  return monto * tasa;
};

export const calcularPorcentaje = (valor: number, total: number): number => {
  if (total === 0) return 0;
  return (valor / total) * 100;
};

export const formatMoneda = (monto: number, moneda: 'USD' | 'PEN' = 'USD'): string => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda }).format(monto);
};
