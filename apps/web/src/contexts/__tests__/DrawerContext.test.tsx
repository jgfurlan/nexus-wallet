// React implícito via JSX
import { render, screen, act } from '@testing-library/react';
import { DrawerProvider, useDrawer } from '../DrawerContext';
import { expect, test, describe, vi } from 'vitest';

// Mock the drawers since they have complex internal API calls
interface MockProps { isOpen: boolean; onClose: () => void }

vi.mock('../../components/drawers/SwapDrawer', () => ({
  SwapDrawer: ({ isOpen, onClose }: MockProps) => isOpen ? (
    <div data-testid="mock-swap-drawer">
      Swap Open <button onClick={onClose} data-testid="close-swap-btn">Close</button>
    </div>
  ) : null
}));

vi.mock('../../components/drawers/HistoryDrawer', () => ({
  HistoryDrawer: ({ isOpen, onClose }: MockProps) => isOpen ? (
    <div data-testid="mock-history-drawer">
      History Open <button onClick={onClose} data-testid="close-history-btn">Close</button>
    </div>
  ) : null
}));

vi.mock('../../components/drawers/DepositDrawer', () => ({
  DepositDrawer: ({ isOpen, onClose }: MockProps) => isOpen ? (
    <div data-testid="mock-deposit-drawer">
      Deposit Open <button onClick={onClose} data-testid="close-deposit-btn">Close</button>
    </div>
  ) : null
}));

vi.mock('../../components/drawers/WithdrawDrawer', () => ({
  WithdrawDrawer: ({ isOpen, onClose }: MockProps) => isOpen ? (
    <div data-testid="mock-withdraw-drawer">
      Withdraw Open <button onClick={onClose} data-testid="close-withdraw-btn">Close</button>
    </div>
  ) : null
}));

const TestComponent = () => {
  const { openDrawer, closeDrawer, activeDrawer } = useDrawer();
  return (
    <div>
      <span data-testid="active-drawer-name">{activeDrawer || 'none'}</span>
      <button data-testid="open-swap-btn" onClick={() => openDrawer('swap')}>Open Swap</button>
      <button data-testid="open-deposit-btn" onClick={() => openDrawer('deposit')}>Open Deposit</button>
      <button data-testid="close-all-btn" onClick={closeDrawer}>Close All</button>
    </div>
  );
};

describe('DrawerContext', () => {
  test('should initialize with no active drawer', () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    expect(screen.getByTestId('active-drawer-name').textContent).toBe('none');
    expect(screen.queryByTestId('mock-swap-drawer')).toBeNull();
  });

  test('should open and close the Swap drawer', () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    const openSwapBtn = screen.getByTestId('open-swap-btn');
    act(() => {
      openSwapBtn.click();
    });

    expect(screen.getByTestId('active-drawer-name').textContent).toBe('swap');
    expect(screen.getByTestId('mock-swap-drawer')).toBeInTheDocument();

    const closeSwapBtn = screen.getByTestId('close-swap-btn');
    act(() => {
      closeSwapBtn.click();
    });

    expect(screen.getByTestId('active-drawer-name').textContent).toBe('none');
    expect(screen.queryByTestId('mock-swap-drawer')).toBeNull();
  });

  test('should switch between drawers', () => {
    render(
      <DrawerProvider>
        <TestComponent />
      </DrawerProvider>
    );

    // Open Deposit
    act(() => {
      screen.getByTestId('open-deposit-btn').click();
    });
    expect(screen.getByTestId('active-drawer-name').textContent).toBe('deposit');
    expect(screen.getByTestId('mock-deposit-drawer')).toBeInTheDocument();

    // Open Swap
    act(() => {
      screen.getByTestId('open-swap-btn').click();
    });
    expect(screen.getByTestId('active-drawer-name').textContent).toBe('swap');
    expect(screen.getByTestId('mock-swap-drawer')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-deposit-drawer')).toBeNull();
  });
});
