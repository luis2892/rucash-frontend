// Layout wrapper para páginas autenticadas: Sidebar + Header móvil + contenido
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AppLayout = ({ children, title, subtitle }: AppLayoutProps) => (
  <div className="flex min-h-screen bg-slate-50">
    {/* Sidebar — solo desktop */}
    <div className="hidden lg:flex">
      <Sidebar />
    </div>

    {/* Main area */}
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header — solo móvil */}
      <Header />

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {(title || subtitle) && (
          <div className="px-6 lg:px-8 pt-8 pb-0">
            {title && <h1 className="text-xl font-bold text-slate-900">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
        <div className="px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  </div>
);
