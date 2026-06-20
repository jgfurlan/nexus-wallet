import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Sun, Moon, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { ContactWidget } from './ui/ContactWidget';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { DrawerProvider, useDrawer } from '../contexts/DrawerContext';
import logoNexus from '../logo-nexus.png';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <DrawerProvider>
      <LayoutContent>{children}</LayoutContent>
    </DrawerProvider>
  );
};

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openDrawer } = useDrawer();

  return (
    <div className="flex h-screen bg-base text-primary overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-overlay z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoNexus} alt="Nexus Logo" className="w-10 h-10 object-contain rounded-xl" />
            <span className="font-bold text-xl tracking-tight">Nexus</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all',
              location.pathname === '/' ? 'bg-pine/10 text-pine font-medium' : 'text-subtle hover:text-primary hover:bg-white/5'
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>

          <button
            onClick={() => openDrawer('deposit')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-subtle hover:text-primary hover:bg-white/5 transition-all text-left"
          >
            <ArrowDownLeft className="w-5 h-5 text-foam" />
            Depositar
          </button>

          <button
            onClick={() => openDrawer('withdraw')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-subtle hover:text-primary hover:bg-white/5 transition-all text-left"
          >
            <ArrowUpRight className="w-5 h-5 text-love" />
            Sacar
          </button>

          <button
            onClick={() => openDrawer('swap')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-subtle hover:text-primary hover:bg-white/5 transition-all text-left"
          >
            <ArrowLeftRight className="w-5 h-5 text-gold" />
            Converter
          </button>

          <button
            onClick={() => openDrawer('history')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-subtle hover:text-primary hover:bg-white/5 transition-all text-left"
          >
            <History className="w-5 h-5 text-pine" />
            Histórico
          </button>
        </nav>

        <div className="p-4 border-t border-overlay space-y-2">
          <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start text-subtle hover:bg-white/5 hover:text-primary">
            {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </Button>
          <Button variant="ghost" onClick={() => { logout(); navigate('/login'); }} className="w-full justify-start text-love hover:bg-love/10 hover:text-love">
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto w-full h-full pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Header Mobile (Only visible on small screens) */}
          <div className="md:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src={logoNexus} alt="Nexus Logo" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-bold text-lg tracking-tight">Nexus</span>
            </div>
            <Button variant="ghost" onClick={toggleTheme} className="p-2 text-subtle hover:text-primary rounded-xl">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          </div>

          {children}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden bg-surface border-t border-overlay fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-50">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl transition-colors',
            location.pathname === '/' ? 'text-pine' : 'text-subtle'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dash</span>
        </Link>

        <button
          onClick={() => openDrawer('deposit')}
          className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl text-subtle hover:text-primary transition-colors"
        >
          <ArrowDownLeft className="w-5 h-5 text-foam" />
          <span className="text-[10px] font-medium">Depositar</span>
        </button>

        <button
          onClick={() => openDrawer('withdraw')}
          className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl text-subtle hover:text-primary transition-colors"
        >
          <ArrowUpRight className="w-5 h-5 text-love" />
          <span className="text-[10px] font-medium">Sacar</span>
        </button>

        <button
          onClick={() => openDrawer('swap')}
          className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl text-subtle hover:text-primary transition-colors"
        >
          <ArrowLeftRight className="w-5 h-5 text-gold" />
          <span className="text-[10px] font-medium">Converter</span>
        </button>

        <button
          onClick={() => openDrawer('history')}
          className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl text-subtle hover:text-primary transition-colors"
        >
          <History className="w-5 h-5 text-pine" />
          <span className="text-[10px] font-medium">Histórico</span>
        </button>
      </nav>
      <ContactWidget />
    </div>
  );
};
