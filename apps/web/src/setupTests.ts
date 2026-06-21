/**
 * @fileoverview Setup global do ambiente de testes do frontend.
 * Executado pelo Vitest antes de cada arquivo de teste.
 *
 * Mocks essenciais:
 * - `matchMedia`: usado pelo Tailwind (dark mode detection).
 * - `crypto.randomUUID`: usado pelo WithdrawDrawer para gerar externalId único.
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia (browser)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock crypto.randomUUID (injetar dados determinísticos nos testes)
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    Object.defineProperty(window, 'crypto', {
      value: {
        randomUUID: () => '11111111-2222-3333-4444-555555555555',
      },
      configurable: true,
    });
  } else if (!window.crypto.randomUUID) {
    Object.defineProperty(window.crypto, 'randomUUID', {
      value: () => '11111111-2222-3333-4444-555555555555',
      configurable: true,
    });
  }
}
