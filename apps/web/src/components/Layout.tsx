import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeftRight, History, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Swap', path: '/swap', icon: ArrowLeftRight },
    { label: 'Histórico', path: '/history', icon: History },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-overlay sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-pine p-1.5 rounded-md">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">NexusWallet</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                  location.pathname === item.path
                    ? 'bg-overlay text-pine'
                    : 'text-subtle hover:text-primary hover:bg-overlay/50'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-love hover:text-love hover:bg-love/10">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-surface border-t border-overlay fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-md transition-colors',
              location.pathname === item.path ? 'text-pine' : 'text-subtle'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
