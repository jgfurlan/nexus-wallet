import React, { createContext, useContext, useState } from 'react';
import { SwapDrawer } from '../components/drawers/SwapDrawer';
import { HistoryDrawer } from '../components/drawers/HistoryDrawer';
import { DepositDrawer } from '../components/drawers/DepositDrawer';
import { WithdrawDrawer } from '../components/drawers/WithdrawDrawer';

/**
 * Types of transaction drawers available in the application context.
 */
type DrawerType = 'deposit' | 'withdraw' | 'swap' | 'history';

/**
 * DrawerContext holds the global state of the transaction drawers.
 * Provides functions to open and close specific drawer overlays from any component.
 */
interface DrawerContextProps {
  /** Triggers the visibility of a drawer by its identifier */
  openDrawer: (type: DrawerType) => void;
  /** Closes any open drawer currently active */
  closeDrawer: () => void;
  /** The identifier of the currently open drawer, or null if none are active */
  activeDrawer: DrawerType | null;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

/**
 * DrawerProvider houses the states for active drawers, rendering
 * the Drawer overlays and dispatching custom global transaction events.
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
 * Hook to access the DrawerContext properties (active drawer, open/close methods).
 * 
 * @returns The DrawerContext properties.
 * @throws {Error} If used outside of a DrawerProvider wrapper.
 */
export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within a DrawerProvider');
  return context;
};
