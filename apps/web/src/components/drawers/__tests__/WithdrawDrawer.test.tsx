// React implícito via JSX
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WithdrawDrawer } from '../WithdrawDrawer';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { expect, test, describe, vi, beforeEach } from 'vitest';

// Mock WithdrawalService
vi.mock('../../../services/withdrawal.service', () => {
  return {
    WithdrawalService: {
      requestWithdrawal: vi.fn(),
    },
  };
});

describe('WithdrawDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render form fields correctly', () => {
    render(<WithdrawDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Certifique-se de que a rede corresponde/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('BRL');
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('');
    expect(screen.getByPlaceholderText('Chave PIX ou Endereço Crypto')).toHaveValue('');
  });

  test('should fill mock values on Autofill click based on selected token', async () => {
    render(<WithdrawDrawer isOpen={true} onClose={vi.fn()} />);

    const tokenSelect = screen.getByRole('combobox');
    const fillButton = screen.getByText('Preencher Dados de Teste (Sandbox)');

    // 1. Check BRL autofill
    fireEvent.click(fillButton);
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('150.00');
    expect(screen.getByPlaceholderText('Chave PIX ou Endereço Crypto')).toHaveValue('faucet@nexuswallet.com');

    // 2. Check BTC autofill
    fireEvent.change(tokenSelect, { target: { value: 'BTC' } });
    fireEvent.click(fillButton);
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('0.005');
    expect(screen.getByPlaceholderText('Chave PIX ou Endereço Crypto')).toHaveValue('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

    // 3. Check ETH autofill
    fireEvent.change(tokenSelect, { target: { value: 'ETH' } });
    fireEvent.click(fillButton);
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('0.05');
    expect(screen.getByPlaceholderText('Chave PIX ou Endereço Crypto')).toHaveValue('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  });

  test('should execute withdrawal successfully', async () => {
    const mockRequest = vi.spyOn(WithdrawalService, 'requestWithdrawal').mockResolvedValueOnce({ id: 'tx-123' });
    const handleSuccess = vi.fn();

    render(<WithdrawDrawer isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />);

    // Autofill values (BRL by default)
    const fillButton = screen.getByText('Preencher Dados de Teste (Sandbox)');
    fireEvent.click(fillButton);

    const submitBtn = screen.getByText('Confirmar Saque');
    fireEvent.click(submitBtn);

    // Confirm Modal opens
    const confirmBtn = await screen.findByText('Confirmar');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({
        token: 'BRL',
        amount: '150.00',
        address: 'faucet@nexuswallet.com',
        externalId: expect.any(String),
      });
    });

    expect(screen.getByText('Saque Solicitado!')).toBeInTheDocument();
    expect(handleSuccess).toHaveBeenCalled();
  });
});
