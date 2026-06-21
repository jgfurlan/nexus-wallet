import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import api from '../../services/api';

/** Propriedades do drawer de depósito via Faucet (sandbox). */
interface DepositDrawerProps {
  /** Se true, o drawer fica visível. */
  isOpen: boolean;
  /** Callback ao fechar o drawer. */
  onClose: () => void;
  /** Callback disparado após um depósito bem-sucedido. */
  onSuccess?: () => void;
}

const depositSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor inválido'),
});

type DepositForm = z.infer<typeof depositSchema>;

/**
 * Drawer de depósito via Faucet (ambiente sandbox).
 * Permite selecionar moeda (BRL/BTC/ETH) e valor para simular
 * um depósito via endpoint `/test/faucet`.
 *
 * Estados:
 * - **Formulário**: token + amount, validação com Zod.
 * - **Carregamento**: chamada API em andamento.
 * - **Erro**: mensagem de erro da API.
 * - **Sucesso**: tela de confirmação com valor recebido.
 */
export const DepositDrawer: React.FC<DepositDrawerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, watch, handleSubmit, formState: { errors }, reset } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      token: 'BRL',
      amount: '',
    }
  });

  const token = watch('token');
  const amount = watch('amount');

  const onSubmit = async (data: DepositForm) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/test/faucet', {
        amount: data.amount,
        token: data.token,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Erro ao realizar depósito de teste.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSuccess(false);
      setError(null);
      onClose();
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Depositar">
      {success ? (
        <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-center mb-6">
            <div className="bg-foam/20 p-4 rounded-full">
              <CheckCircle2 className="text-foam w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Depósito Confirmado!</h2>
          <p className="text-subtle mb-8">
            Você recebeu {amount} {token} em sua conta.
          </p>
          <Button onClick={handleClose} className="w-full h-12">
            Voltar ao Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="space-y-6 flex-1">
            <p className="text-subtle text-sm">
              Como este é um ambiente de testes (Sandbox), você pode utilizar nosso Faucet para injetar fundos virtuais em sua carteira e testar as conversões.
            </p>

            {error && (
              <div className="bg-love/10 border border-love/20 text-love text-sm p-3 rounded-2xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Moeda e Valor</Label>
              <div className="flex gap-2">
                <select
                  {...register('token')}
                  className="bg-white/5 border border-overlay rounded-2xl px-3 text-sm text-primary focus:ring-2 focus:ring-pine outline-none"
                >
                  <option value="BRL">BRL</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
                <Input
                  placeholder="0.00"
                  inputMode="decimal"
                  {...register('amount')}
                  error={errors.amount?.message}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-pine/20"
              isLoading={isLoading}
            >
              Simular Depósito
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
};
