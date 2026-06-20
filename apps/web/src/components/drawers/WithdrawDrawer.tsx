import React, { useState } from 'react';
import { ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Drawer } from '../ui/Drawer';
import { ConfirmModal } from '../ui/ConfirmModal';
import { WithdrawalService } from '../../services/withdrawal.service';
import { formatToken } from '../../lib/formatters';
import { getErrorMessage } from '../../lib/error-utils';

const withdrawalSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor inválido'),
  address: z.string().min(5, 'Endereço inválido'),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

interface WithdrawDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawDrawer: React.FC<WithdrawDrawerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, watch, handleSubmit, formState: { errors }, reset } = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      token: 'BRL',
    }
  });

  const token = watch('token');
  const amount = watch('amount');
  const address = watch('address');

  const onExecute = async () => {
    try {
      setIsExecuting(true);
      setError(null);
      await WithdrawalService.requestWithdrawal({
        token: token as string,
        amount,
        address,
        externalId: window.crypto.randomUUID ? window.crypto.randomUUID() : '00000000-0000-0000-0000-000000000000', // fallback if crypto isn't fully supported on old envs, though modern browsers have randomUUID
      });
      setSuccess(true);
      setIsModalOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsModalOpen(false);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    if (!isExecuting) {
      reset();
      setSuccess(false);
      setError(null);
      onClose();
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Sacar Fundos">
      {success ? (
        <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-center mb-6">
            <div className="bg-foam/20 p-4 rounded-full">
              <CheckCircle2 className="text-foam w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Saque Solicitado!</h2>
          <p className="text-subtle mb-8">
            Sua solicitação de saque está sendo processada.
          </p>
          <Button onClick={handleClose} className="w-full h-12">Voltar ao Dashboard</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(() => setIsModalOpen(true))} className="flex flex-col h-full">
          <div className="space-y-6 flex-1">
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

            <div className="space-y-2">
              <Label>Endereço de Destino (PIX ou Carteira)</Label>
              <Input
                placeholder="Chave PIX ou Endereço Crypto"
                {...register('address')}
                error={errors.address?.message}
              />
              <p className="text-xs text-subtle mt-1">Certifique-se de que a rede corresponde à moeda selecionada.</p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-overlay mt-4">
               <div className="flex items-center gap-3">
                 <div className="bg-base p-2 rounded-xl border border-overlay text-love">
                   <ArrowUpRight className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-primary">Tempo de Processamento</p>
                   <p className="text-xs text-subtle">PIX: Instantâneo | Crypto: ~10 min</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-pine/20">
              Confirmar Saque
            </Button>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onExecute}
        isLoading={isExecuting}
        title="Confirmar Saque"
        description={`Você está prestes a sacar ${formatToken(amount || 0)} ${token} para: ${address}`}
      />
    </Drawer>
  );
};
