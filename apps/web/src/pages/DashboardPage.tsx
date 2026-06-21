import React, { useEffect, useState } from 'react';
import { Coins, TrendingUp, ArrowUpRight, ArrowLeftRight, ArrowDownLeft } from 'lucide-react';
import { WalletService } from '../services/wallet.service';
import { BalanceCard } from '../components/ui/BalanceCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatCurrency, formatToken, formatDate } from '../lib/formatters';
import { cn } from '../lib/utils';
import { Balance, Transaction } from '../types';
import { HistoryService } from '../services/history.service';

export const DashboardPage: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const balancesData = await WalletService.getBalances();
      setBalances(balancesData.balances);
      
      const historyData = await HistoryService.getHistory({ limit: 5 });
      setRecentTransactions(historyData.data);

    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSuccess = () => {
      loadData();
    };

    window.addEventListener('transaction-success', handleSuccess);
    return () => {
      window.removeEventListener('transaction-success', handleSuccess);
    };
  }, []);

  const getBalance = (token: string) => {
    return balances.find(b => b.token === token)?.amount || '0';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Bem-vindo de volta!</h1>
          <p className="text-subtle mt-1">Aqui está o resumo dos seus ativos.</p>
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          token="Real Brasileiro"
          amount={formatCurrency(getBalance('BRL'))}
          icon={<Coins className="w-6 h-6" />}
          isLoading={isLoading}
        />
        <BalanceCard
          token="Bitcoin"
          amount={`${formatToken(getBalance('BTC'))} BTC`}
          icon={<TrendingUp className="w-6 h-6" />}
          isLoading={isLoading}
        />
        <BalanceCard
          token="Ethereum"
          amount={`${formatToken(getBalance('ETH'))} ETH`}
          icon={<TrendingUp className="w-6 h-6" />}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-14 bg-white/5 animate-pulse rounded-2xl" />)
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-overlay">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl border border-overlay",
                      tx.type === 'DEPOSIT' ? "bg-foam/10 text-foam border-foam/20" : 
                      tx.type === 'WITHDRAWAL' ? "bg-love/10 text-love border-love/20" : "bg-gold/10 text-gold border-gold/20"
                    )}>
                      {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-4 h-4" /> : 
                       tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {tx.type === 'DEPOSIT' ? 'Depósito Recebido' : 
                         tx.type === 'WITHDRAWAL' ? 'Saque Solicitado' : 'Conversão Realizada'}
                      </p>
                      <p className="text-xs text-subtle">{formatDate(new Date(tx.createdAt))}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      tx.type === 'DEPOSIT' ? "text-foam" : 
                      tx.type === 'WITHDRAWAL' ? "text-love" : "text-primary"
                    )}>
                      {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : ''}
                      {tx.type === 'SWAP' ? formatToken(tx.fromAmount || 0) : formatToken(tx.toAmount || tx.fromAmount || 0)} {tx.type === 'SWAP' ? tx.fromToken : (tx.toToken || tx.fromToken)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-overlay rounded-2xl">
                <p className="text-subtle italic text-sm">Nenhuma atividade recente.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
