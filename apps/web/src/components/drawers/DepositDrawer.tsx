import React, { useState } from 'react';
import { ArrowDownLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import api from '../../services/api';

interface DepositDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DepositDrawer: React.FC<DepositDrawerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/test/faucet');
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
            Você recebeu 1.000,00 BRL em sua conta.
          </p>
          <Button onClick={handleClose} className="w-full h-12">
            Voltar ao Dashboard
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
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

            <div className="bg-white/5 border border-overlay rounded-2xl p-6 text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="bg-base p-3 rounded-2xl border border-overlay">
                  <ArrowDownLeft className="text-foam w-8 h-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary">Faucet de Testes</h3>
              <p className="text-2xl font-mono text-foam font-bold">+ 1.000,00 BRL</p>
            </div>
          </div>

          <div className="pt-6 mt-auto">
            <Button
              className="w-full h-12 text-base font-bold shadow-lg shadow-pine/20"
              onClick={handleDeposit}
              isLoading={isLoading}
            >
              Simular Depósito
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
