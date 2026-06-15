import React, { useState, useEffect } from 'react';
import { HistoryService } from '../services/history.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatToken, formatDate } from '../lib/formatters';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Transaction, LedgerEntry } from '../types';

export const HistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsExecutingMore] = useState(false);
  const [tokenFilter, setTokenFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistory = async (cursor?: string) => {
    try {
      if (cursor) setIsExecutingMore(true);
      else setIsLoading(true);

      const response = await HistoryService.getHistory({
        token: tokenFilter || undefined,
        type: typeFilter || undefined,
        cursor,
        limit: 10,
      });

      if (cursor) {
        setTransactions(prev => [...prev, ...response.data]);
      } else {
        setTransactions(response.data);
      }
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setIsLoading(false);
      setIsExecutingMore(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [tokenFilter, typeFilter]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="text-foam" />;
      case 'WITHDRAWAL': return <ArrowUpRight className="text-love" />;
      case 'SWAP': return <ArrowLeftRight className="text-gold" />;
      default: return <ChevronRight />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'Depósito';
      case 'WITHDRAWAL': return 'Saque';
      case 'SWAP': return 'Conversão';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Histórico de Atividades</h1>
          <p className="text-subtle">Acompanhe todas as suas movimentações e auditorias.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface border border-overlay p-1 rounded-lg">
            <select
              className="bg-transparent text-xs text-subtle px-2 py-1 outline-none"
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value)}
            >
              <option value="">Todos os Tokens</option>
              <option value="BRL">BRL</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
            <div className="w-px h-4 bg-overlay" />
            <select
              className="bg-transparent text-xs text-subtle px-2 py-1 outline-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              <option value="DEPOSIT">Depósitos</option>
              <option value="WITHDRAWAL">Saques</option>
              <option value="SWAP">Conversões</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-surface animate-pulse rounded-lg border border-overlay" />)
        ) : transactions.length > 0 ? (
          <>
            {transactions.map((tx) => (
              <Card key={tx.id} className="p-0 overflow-hidden border-overlay hover:border-subtle/30 transition-colors">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer group"
                  onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-base rounded-xl border border-overlay group-hover:border-subtle/20">
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{getLabel(tx.type)}</p>
                      <p className="text-xs text-subtle">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className={cn(
                        "font-bold",
                        tx.type === 'DEPOSIT' ? "text-foam" : tx.type === 'WITHDRAWAL' ? "text-love" : "text-primary"
                      )}>
                        {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : ''}
                        {tx.type === 'SWAP' ? formatToken(tx.fromAmount || 0) : formatToken(tx.toAmount || tx.fromAmount || 0)} {tx.toToken || tx.fromToken}
                      </p>
                      {tx.type === 'SWAP' && (
                        <p className="text-[10px] text-gold font-medium uppercase tracking-tight">
                          → {formatToken(tx.toAmount || 0)} {tx.toToken}
                        </p>
                      )}
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-subtle transition-transform duration-300", expandedId === tx.id && "rotate-180")} />
                  </div>
                </div>

                {expandedId === tx.id && (
                  <div className="bg-base/30 border-t border-overlay p-4 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-[10px] font-bold text-subtle uppercase tracking-widest mb-3">Detalhamento do Ledger (Auditável)</h4>
                    <div className="space-y-2">
                      {tx.ledgerEntries.map((entry: LedgerEntry) => (
                        <div key={entry.id} className="flex items-center justify-between text-xs py-1.5 border-b border-overlay/30 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              Number(entry.delta) > 0 ? "bg-foam" : "bg-love"
                            )} />
                            <span className="text-primary font-medium">{entry.type}</span>
                            <span className="text-subtle">({entry.token})</span>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-mono font-bold", Number(entry.delta) > 0 ? "text-foam" : "text-love")}>
                              {Number(entry.delta) > 0 ? '+' : ''}{formatToken(entry.delta)}
                            </p>
                            <p className="text-[10px] text-subtle italic">Saldo após: {formatToken(entry.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-overlay/50 flex justify-between items-center opacity-50">
                      <span className="text-[9px] font-mono text-subtle">TX-ID: {tx.id}</span>
                      <span className="text-[9px] text-subtle bg-overlay px-1.5 py-0.5 rounded">SERIALIZABLE_BLOCK</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            
            {nextCursor && (
              <div className="flex justify-center pt-4">
                <Button variant="ghost" onClick={() => loadHistory(nextCursor)} isLoading={isFetchingMore}>
                  Carregar mais transações
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="py-20 text-center">
            <p className="text-subtle italic">Nenhuma transação encontrada para os filtros selecionados.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
