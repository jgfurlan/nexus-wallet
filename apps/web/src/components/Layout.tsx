import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { ContactWidget } from './ui/ContactWidget';

import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Since we are using Drawers for actions, these might not be normal links anymore,
  // but we can keep Dashboard here. The actual buttons to open Drawers will be inside Dashboard,
  // OR we can make the sidebar buttons emit an event / use context to open the Drawers.
  // For now, the user requested the Dashboard to be the main stage. The sidebar can just have Home, and maybe logout.
  // Wait, if actions are Drawers, we shouldn't navigate to /swap or /history.
  // Let's keep the navItems but they will just be UI buttons. We can use a Context or Zustand to manage Drawer states,
  // or simply let DashboardPage handle it. Let's pass a `onOpenDrawer` prop or use context.
  // Actually, to keep it simple, the sidebar will just be part of DashboardPage, or we can use React Context.
  // Let's create an event system or just use React Context.
  
  return (
    <div className="flex h-screen bg-base text-primary overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-overlay z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-pine p-2 rounded-2xl">
              <Wallet className="text-white w-6 h-6" />
            </div>
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
          {/* We'll add the other items later via Context or keep them in Dashboard */}
        </nav>

        <div className="p-4 border-t border-overlay">
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
              <div className="bg-pine p-1.5 rounded-2xl">
                <Wallet className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Nexus</span>
            </div>
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
      </nav>
      <ContactWidget />
    </div>
  );
};
