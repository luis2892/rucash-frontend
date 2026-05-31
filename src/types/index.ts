export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'ALMACENERO';
}

export interface Cliente {
  id: string;
  nombre: string;
  plan: 'BASICO' | 'PRO' | 'EMPRESA';
  estado: 'PRUEBA' | 'ACTIVO' | 'VENCIDO';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
  whatsapp: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  usuario: Usuario;
  cliente: Cliente;
}

// ---- Sprint 3: POS Types ----

export interface Producto {
  id: string;
  cliente_id: string;
  nombre: string;
  descripcion?: string;
  codigo_barras: string;
  categoria?: string;
  precio_usd: number;
  precio_sol: number;
  costo_usd?: number;
  stock_tienda: number;
  stock_almacen: number;
  activo: boolean;
  created_at: string;
}

export interface DetalleVenta {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  cliente_id: string;
  usuario_id: string;
  items: DetalleVenta[];
  moneda: 'USD' | 'SOL';
  subtotal: number;
  impuesto: number;
  total: number;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';
  monto_pagado: number;
  cambio: number;
  estado: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA';
  notas?: string;
  created_at: string;
}
