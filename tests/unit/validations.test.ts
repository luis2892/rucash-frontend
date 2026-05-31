import {
  validarEmail, validarPassword, validarCodigoBarras,
  validarMonto, calcularImpuesto, calcularPorcentaje, formatMoneda,
} from '../../src/utils/validations';

describe('validarEmail', () => {
  test('acepta email válido', () => expect(validarEmail('test@example.com')).toBe(true));
  test('rechaza sin @', () => expect(validarEmail('testexample.com')).toBe(false));
  test('rechaza vacío', () => expect(validarEmail('')).toBe(false));
  test('acepta subdominio', () => expect(validarEmail('a@b.co.pe')).toBe(true));
});

describe('validarPassword', () => {
  test('acepta contraseña válida', () => expect(validarPassword('Password1')).toBe(true));
  test('rechaza muy corta', () => expect(validarPassword('Pass1')).toBe(false));
  test('rechaza sin mayúscula', () => expect(validarPassword('password123')).toBe(false));
  test('rechaza sin número', () => expect(validarPassword('Password')).toBe(false));
});

describe('validarCodigoBarras', () => {
  test('acepta 13 dígitos', () => expect(validarCodigoBarras('1234567890123')).toBe(true));
  test('acepta 8 dígitos', () => expect(validarCodigoBarras('12345678')).toBe(true));
  test('rechaza letras', () => expect(validarCodigoBarras('ABC123')).toBe(false));
  test('rechaza muy corto', () => expect(validarCodigoBarras('123')).toBe(false));
});

describe('validarMonto', () => {
  test('acepta positivo', () => expect(validarMonto(100)).toBe(true));
  test('rechaza negativo', () => expect(validarMonto(-1)).toBe(false));
  test('rechaza cero', () => expect(validarMonto(0)).toBe(false));
  test('acepta decimales', () => expect(validarMonto(0.01)).toBe(true));
});

describe('calcularImpuesto', () => {
  test('18% de 100 = 18', () => expect(calcularImpuesto(100)).toBeCloseTo(18));
  test('18% de 50 = 9', () => expect(calcularImpuesto(50)).toBeCloseTo(9));
  test('0 da 0', () => expect(calcularImpuesto(0)).toBe(0));
});

describe('calcularPorcentaje', () => {
  test('50/100 = 50%', () => expect(calcularPorcentaje(50, 100)).toBe(50));
  test('divide entre 0 = 0', () => expect(calcularPorcentaje(25, 0)).toBe(0));
  test('100/100 = 100%', () => expect(calcularPorcentaje(100, 100)).toBe(100));
});

describe('formatMoneda', () => {
  test('formatea USD', () => expect(formatMoneda(100, 'USD')).toContain('100'));
  test('formatea PEN', () => expect(formatMoneda(100, 'PEN')).toContain('100'));
});
