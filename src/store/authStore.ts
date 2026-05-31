import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import { LoginPayload, SignUpPayload } from '../types';

export interface UsuarioAuth {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  es_admin_sistema: boolean;
  whatsapp?: string;
}

export interface ClienteAuth {
  id: string;
  nombre: string;
  plan: string;
  estado: string;
  ruc?: string;
}

interface AuthStore {
  usuario: UsuarioAuth | null;
  cliente: ClienteAuth | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignUpPayload) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: () => boolean;
  isAdminSistema: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      usuario: null,
      cliente: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', payload);
          const { access_token, refresh_token, usuario, cliente } = response.data;

          set({ usuario, cliente, accessToken: access_token, refreshToken: refresh_token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Error en login';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signup: async (payload: SignUpPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/signup', payload);
          const { access_token, refresh_token, usuario, cliente } = response.data;

          set({ usuario, cliente, accessToken: access_token, refreshToken: refresh_token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Error en signup';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ usuario: null, cliente: null, accessToken: null, refreshToken: null, error: null });
        delete api.defaults.headers.common['Authorization'];
      },

      refreshAccessToken: async () => {
        const state = get();
        if (!state.refreshToken) { state.logout(); return; }

        try {
          const response = await api.post('/auth/refresh-token', { refresh_token: state.refreshToken });
          const { access_token } = response.data;
          set({ accessToken: access_token });
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch {
          state.logout();
        }
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().accessToken,

      isAdminSistema: () => get().usuario?.es_admin_sistema === true,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        usuario: state.usuario,
        cliente: state.cliente,
      }),
    }
  )
);
