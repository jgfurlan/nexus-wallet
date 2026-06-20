import React, { useState, useEffect } from 'react';
import { HistoryService } from '../../services/history.service';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { formatToken, formatDate } from '../../lib/formatters';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Transaction, LedgerEntry } from '../../types';

/**
 * Properties for the HistoryDrawer component.
 */
interface HistoryDrawerProps {
  /** If true, the transaction history drawer is displayed */
  isOpen: boolean;
  /** Callback function to close the drawer overlay */
  onClose: () => void;
}

/**
 * HistoryDrawer displays a list of the user's past transactions (deposits,
 * withdrawals, swaps) with optional filtering by token and transaction type.
 */
export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose }) => {
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
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, tokenFilter, typeFilter]);

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
    <Drawer isOpen={isOpen} onClose={onClose} title="Histórico">
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center gap-2 bg-white/5 border border-overlay p-1 rounded-2xl overflow-x-auto no-scrollbar">
          <select
            className="bg-transparent text-xs text-subtle px-2 py-2 outline-none flex-1 min-w-[120px] focus:text-primary"
            value={tokenFilter}
            onChange={(e) => setTokenFilter(e.target.value)}
          >
            <option value="">Tokens (Todos)</option>
            <option value="BRL">BRL</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
          <div className="w-px h-4 bg-overlay shrink-0" />
          <select
            className="bg-transparent text-xs text-subtle px-2 py-2 outline-none flex-1 min-w-[120px] focus:text-primary"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tipos (Todos)</option>
            <option value="DEPOSIT">Depósitos</option>
            <option value="WITHDRAWAL">Saques</option>
            <option value="SWAP">Conversões</option>
          </select>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl border border-overlay" />)
          ) : transactions.length > 0 ? (
            <>
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white/5 border border-overlay rounded-2xl overflow-hidden hover:border-subtle/30 transition-colors">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer group"
                    onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-base rounded-xl border border-overlay group-hover:border-subtle/20 shrink-0">
                        {getIcon(tx.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-primary text-sm truncate">{getLabel(tx.type)}</p>
                        <p className="text-[10px] text-subtle">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div>
                        <p className={cn(
                          "font-bold text-sm",
                          tx.type === 'DEPOSIT' ? "text-foam" : tx.type === 'WITHDRAWAL' ? "text-love" : "text-primary"
                        )}>
                          {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : ''}
                          {tx.type === 'SWAP' ? formatToken(tx.fromAmount || 0) : formatToken(tx.toAmount || tx.fromAmount || 0)}
                        </p>
                        <p className="text-[10px] text-subtle uppercase tracking-tight">
                          {tx.type === 'SWAP' ? (
                            <>→ {formatToken(tx.toAmount || 0)} {tx.toToken}</>
                          ) : (
                            <>{tx.toToken || tx.fromToken}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedId === tx.id && (
                    <div className="bg-base/30 border-t border-overlay p-4 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-[10px] font-bold text-subtle uppercase tracking-widest mb-3">Auditoria (Ledger)</h4>
                      <div className="space-y-2">
                        {tx.ledgerEntries.map((entry: LedgerEntry) => (
                          <div key={entry.id} className="flex items-center justify-between text-xs py-1 border-b border-overlay/30 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                Number(entry.delta) > 0 ? "bg-foam" : "bg-love"
                              )} />
                              <span className="text-primary font-medium">{entry.type}</span>
                            </div>
                            <div className="text-right">
                              <p className={cn("font-mono font-bold text-[10px]", Number(entry.delta) > 0 ? "text-foam" : "text-love")}>
                                {Number(entry.delta) > 0 ? '+' : ''}{formatToken(entry.delta)} {entry.token}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-overlay/50 flex justify-between items-center opacity-50">
                        <span className="text-[9px] font-mono text-subtle">TX: {tx.id.slice(0,12)}...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {nextCursor && (
                <div className="pt-2">
                  <Button variant="ghost" className="w-full text-xs h-10" onClick={() => loadHistory(nextCursor)} isLoading={isFetchingMore}>
                    Carregar mais
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center border border-dashed border-overlay rounded-2xl">
              <p className="text-sm text-subtle italic">Nenhuma transação.</p>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
