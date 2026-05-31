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
