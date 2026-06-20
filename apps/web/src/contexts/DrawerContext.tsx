import React, { createContext, useContext, useState } from 'react';
import { SwapDrawer } from '../components/drawers/SwapDrawer';
import { HistoryDrawer } from '../components/drawers/HistoryDrawer';
import { DepositDrawer } from '../components/drawers/DepositDrawer';
import { WithdrawDrawer } from '../components/drawers/WithdrawDrawer';

type DrawerType = 'deposit' | 'withdraw' | 'swap' | 'history';

interface DrawerContextProps {
  openDrawer: (type: DrawerType) => void;
  closeDrawer: () => void;
  activeDrawer: DrawerType | null;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

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

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within a DrawerProvider');
  return context;
};
