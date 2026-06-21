// React implícito via JSX
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DepositDrawer } from '../DepositDrawer';
import api from '../../../services/api';
import { expect, test, describe, vi, beforeEach } from 'vitest';

// Mock api service
vi.mock('../../../services/api', () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

describe('DepositDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render form with default values when open', () => {
    render(<DepositDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/ambiente de testes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toHaveValue('1000');
    expect(screen.getByRole('combobox')).toHaveValue('BRL');
  });

  test('should submit successfully and display confirmation screen', async () => {
    const mockPost = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { message: 'Success' } });
    const handleSuccess = vi.fn();

    render(<DepositDrawer isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />);

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '500' } });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'BTC' } });

    const submitBtn = screen.getByText('Simular Depósito');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/test/faucet', {
        amount: '500',
        token: 'BTC',
      });
    });

    expect(screen.getByText('Depósito Confirmado!')).toBeInTheDocument();
    expect(screen.getByText('Você recebeu 500 BTC em sua conta.')).toBeInTheDocument();
    expect(handleSuccess).toHaveBeenCalled();
  });

  test('should display API error when submit fails', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce({
      response: {
        data: {
          message: 'Tokens limit reached',
        },
      },
    });

    render(<DepositDrawer isOpen={true} onClose={vi.fn()} />);

    const submitBtn = screen.getByText('Simular Depósito');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Tokens limit reached')).toBeInTheDocument();
    });
  });
});
