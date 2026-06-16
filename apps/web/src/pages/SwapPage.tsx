import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftRight, AlertCircle, Timer, CheckCircle2 } from 'lucide-react';
import { SwapService } from '../services/swap.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatCurrency, formatToken } from '../lib/formatters';
import { SwapQuoteResponse, Transaction, TokenSymbol } from '../types';
import { getErrorMessage } from '../lib/error-utils';
import Decimal from 'decimal.js';

const swapSchema = z.object({
  fromToken: z.enum(['BRL', 'BTC', 'ETH']),
  toToken: z.enum(['BRL', 'BTC', 'ETH']),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor inválido'),
}).refine(data => data.fromToken !== data.toToken, {
  message: 'Os tokens de origem e destino devem ser diferentes',
  path: ['toToken'],
});

type SwapForm = z.infer<typeof swapSchema>;

export const SwapPage: React.FC = () => {
  const [quote, setQuote] = useState<SwapQuoteResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);

  const { register, watch, handleSubmit, formState: { errors }, setValue } = useForm<SwapForm>({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      fromToken: 'BRL',
      toToken: 'BTC',
    }
  });

  const fromToken = watch('fromToken');
  const toToken = watch('toToken');
  const amount = watch('amount');

  // Fetch quote when amount or tokens change (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (amount && Number(amount) > 0 && fromToken !== toToken) {
        handleGetQuote();
      } else {
        setQuote(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (quote) {
      setQuote(null);
      setError('A cotação expirou. Digite o valor novamente para atualizar.');
    }
  }, [timeLeft, quote]);

  const handleGetQuote = async () => {
    try {
      setIsLoadingQuote(true);
      setError(null);
      const data = await SwapService.getQuote(fromToken, toToken, amount);
      setQuote(data);
      setTimeLeft(30);
    } catch (err) {
      setError(getErrorMessage(err));
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const onExecute = async () => {
    if (!quote) return;
    try {
      setIsExecuting(true);
      const tx = await SwapService.executeSwap(quote.id);
      setSuccessTx(tx);
      setIsModalOpen(false);
      setQuote(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsModalOpen(false);
    } finally {
      setIsExecuting(false);
    }
  };

  const switchTokens = () => {
    const currentFrom = fromToken;
    setValue('fromToken', toToken as TokenSymbol);
    setValue('toToken', currentFrom as TokenSymbol);
  };

  if (successTx) {
    return (
      <div className="max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <Card className="text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="bg-foam/20 p-4 rounded-full">
              <CheckCircle2 className="text-foam w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Conversão Concluída!</h2>
          <p className="text-subtle mb-8">
            Seu saldo foi atualizado com sucesso.
          </p>
          <div className="bg-base/50 p-4 rounded-lg mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-subtle">ID da Transação:</span>
              <span className="text-primary font-mono">{successTx.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-subtle">Convertido:</span>
              <span className="text-primary font-bold">{formatToken(successTx.fromAmount || 0)} {successTx.fromToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-subtle">Recebido:</span>
              <span className="text-foam font-bold">{formatToken(successTx.toAmount || 0)} {successTx.toToken}</span>
            </div>
          </div>
          <Button onClick={() => setSuccessTx(null)} className="w-full">
            Fazer outra conversão
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Converter Ativos</h1>
        <p className="text-subtle">Troque suas moedas instantaneamente com as melhores taxas.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(() => setIsModalOpen(true))}>
          <CardContent className="space-y-6 pt-6">
            {error && (
              <div className="bg-love/10 border border-love/20 text-love text-sm p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* From Token */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="amount">Você envia</Label>
                <span className="text-xs text-subtle">Saldo: --</span>
              </div>
              <div className="flex gap-2">
                <select
                  {...register('fromToken')}
                  className="bg-overlay border border-overlay rounded-md px-3 text-sm text-primary focus:ring-2 focus:ring-pine outline-none"
                >
                  <option value="BRL">BRL</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
                <Input
                  id="amount"
                  placeholder="0.00"
                  {...register('amount')}
                  error={errors.amount?.message}
                />
              </div>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
              <button
                type="button"
                onClick={switchTokens}
                className="bg-surface border border-overlay p-2 rounded-full text-subtle hover:text-pine transition-colors shadow-lg"
              >
                <ArrowLeftRight className="w-4 h-4 rotate-90" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label>Você recebe (estimado)</Label>
              <div className="flex gap-2">
                <select
                  {...register('toToken')}
                  className="bg-overlay border border-overlay rounded-md px-3 text-sm text-primary focus:ring-2 focus:ring-pine outline-none"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="BRL">BRL</option>
                </select>
                <div className="flex-1 h-11 bg-overlay/50 border border-overlay rounded-md px-3 flex items-center text-primary font-bold">
                  {isLoadingQuote ? (
                    <div className="h-4 w-20 bg-overlay animate-pulse rounded" />
                  ) : quote ? (
                    formatToken(quote.destinationAmount)
                  ) : (
                    '0.00'
                  )}
                </div>
              </div>
              {errors.toToken && <p className="text-xs text-love">{errors.toToken.message}</p>}
            </div>

            {/* Quote Details */}
            {quote && (
              <div className="bg-base/30 rounded-lg p-4 space-y-2 text-sm border border-overlay/50">
                <div className="flex justify-between">
                  <span className="text-subtle">Taxa (1.5%)</span>
                  <span className="text-gold">{formatToken(quote.feeAmount)} {quote.fromToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtle">Cotação</span>
                  <span className="text-primary">1 {quote.toToken} = {formatCurrency(new Decimal(1).div(quote.rate).toString())}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-overlay/30 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-subtle">
                    <Timer className="w-3 h-3 text-gold" />
                    A cotação expira em <span className="text-gold font-mono font-bold">{timeLeft}s</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-pine/20"
              disabled={!quote || isLoadingQuote}
            >
              Confirmar Conversão
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onExecute}
        isLoading={isExecuting}
        title="Confirmar Conversão"
        description={`Você está prestes a converter ${formatToken(amount || 0)} ${fromToken} para aproximadamente ${quote ? formatToken(quote.destinationAmount) : ''} ${toToken}. Esta operação é irreversível.`}
      />
    </div>
  );
};
