import React, { createContext, useContext, useState } from 'react';
import { SwapDrawer } from '../components/drawers/SwapDrawer';
import { HistoryDrawer } from '../components/drawers/HistoryDrawer';
import { DepositDrawer } from '../components/drawers/DepositDrawer';
import { WithdrawDrawer } from '../components/drawers/WithdrawDrawer';

/** Tipos de gavetas disponíveis na aplicação. */
type DrawerType = 'deposit' | 'withdraw' | 'swap' | 'history';

/** Contexto de controle global de gavetas (drawers) da aplicação. */
interface DrawerContextProps {
  /** Abre uma gaveta específica. */
  openDrawer: (type: DrawerType) => void;
  /** Fecha a gaveta ativa. */
  closeDrawer: () => void;
  /** Tipo da gaveta atualmente aberta, ou null se nenhuma. */
  activeDrawer: DrawerType | null;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

/**
 * Provider que gerencia o estado global de abertura/fechamento
 * das gavetas (depósito, saque, swap, histórico).
 * Renderiza condicionalmente cada Drawer com base no `activeDrawer`.
 *
 * @example
 * <DrawerProvider>
 *   <App />
 * </DrawerProvider>
 */
export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDrawer, setActiveDrawer] = useState<DrawerType | null>(null);

  const openDrawer = (type: DrawerType) => setActiveDrawer(type);
  const closeDrawer = () => setActiveDrawer(null);

  const handleSuccess = () => {
    window.dispatchEvent(new CustomEvent('transaction-success'));
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, activeDrawer }}>
      {children}
      <SwapDrawer isOpen={activeDrawer === 'swap'} onClose={closeDrawer} onSuccess={handleSuccess} />
      <HistoryDrawer isOpen={activeDrawer === 'history'} onClose={closeDrawer} />
      <DepositDrawer isOpen={activeDrawer === 'deposit'} onClose={closeDrawer} onSuccess={handleSuccess} />
      <WithdrawDrawer isOpen={activeDrawer === 'withdraw'} onClose={closeDrawer} onSuccess={handleSuccess} />
    </DrawerContext.Provider>
  );
};

/**
 * Hook para acessar o controle de gavetas (abrir, fechar, estado ativo).
 * Deve ser usado dentro de um <DrawerProvider>.
 *
 * @throws {Error} Se usado fora de um DrawerProvider.
 */
export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within a DrawerProvider');
  return context;
};
