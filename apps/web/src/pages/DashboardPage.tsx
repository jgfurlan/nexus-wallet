import React, { useEffect, useState } from 'react';
import { Coins, TrendingUp, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { WalletService } from '../services/wallet.service';
import { BalanceCard } from '../components/ui/BalanceCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatCurrency, formatToken, formatDate } from '../lib/formatters';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Balance } from '../types';

interface RecentTx {
  id: string;
  type: 'DEPOSIT' | 'SWAP';
  token?: string;
  fromToken?: string;
  amount: string;
  date: Date;
}

export const DashboardPage: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<RecentTx[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const balancesData = await WalletService.getBalances();
        setBalances(balancesData.balances);
        
        // Mock recent transactions until history service is fully integrated in Dashboard
        setRecentTransactions([
          { id: '1', type: 'DEPOSIT', token: 'BRL', amount: '1000.00', date: new Date() },
          { id: '2', type: 'SWAP', fromToken: 'BRL', amount: '500.00', date: new Date() },
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getBalance = (token: string) => {
    return balances.find(b => b.token === token)?.amount || '0';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Bem-vindo de volta!</h1>
          <p className="text-subtle mt-1">Aqui está o resumo dos seus ativos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/swap">
            <Button variant="secondary">
              <ArrowLeftRight className="w-4 h-4" />
              Converter
            </Button>
          </Link>
          <Button>
            <ArrowUpRight className="w-4 h-4" />
            Sacar
          </Button>
        </div>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          token="Real Brasileiro"
          amount={formatCurrency(getBalance('BRL'))}
          fiatValue="1.00"
          symbol="R$"
          icon={<Coins className="w-6 h-6" />}
          isLoading={isLoading}
        />
        <BalanceCard
          token="Bitcoin"
          amount={`${formatToken(getBalance('BTC'))} BTC`}
          fiatValue="345.230,00" // Mock price
          symbol="R$"
          icon={<TrendingUp className="w-6 h-6" />}
          isLoading={isLoading}
        />
        <BalanceCard
          token="Ethereum"
          amount={`${formatToken(getBalance('ETH'))} ETH`}
          fiatValue="18.450,00" // Mock price
          symbol="R$"
          icon={<TrendingUp className="w-6 h-6" />}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Atividades Recentes</CardTitle>
          <Link to="/history" className="text-sm text-pine hover:underline font-medium">
            Ver histórico completo
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-12 bg-overlay animate-pulse rounded-md" />)
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-overlay/30 transition-colors border border-transparent hover:border-overlay">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-full",
                      tx.type === 'DEPOSIT' ? "bg-foam/10 text-foam" : "bg-gold/10 text-gold"
                    )}>
                      {tx.type === 'DEPOSIT' ? <TrendingUp className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {tx.type === 'DEPOSIT' ? 'Depósito Recebido' : 'Conversão Realizada'}
                      </p>
                      <p className="text-xs text-subtle">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      tx.type === 'DEPOSIT' ? "text-foam" : "text-primary"
                    )}>
                      {tx.type === 'DEPOSIT' ? '+' : ''}{tx.amount} {tx.token || tx.fromToken}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-subtle italic">Nenhuma atividade recente encontrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
