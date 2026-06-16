import React from 'react';
import { Card } from './Card';

interface BalanceCardProps {
  token: string;
  amount: string;
  fiatValue?: string;
  symbol: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  token,
  amount,
  fiatValue,
  symbol,
  icon,
  isLoading
}) => {
  return (
    <Card className="relative overflow-hidden group hover:border-pine/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono text-subtle uppercase tracking-wider">{token}</span>
          <h3 className="text-2xl font-bold text-primary mt-1">
            {isLoading ? (
              <div className="h-8 w-24 bg-overlay animate-pulse rounded" />
            ) : (
              amount
            )}
          </h3>
        </div>
        <div className="p-2 bg-overlay rounded-lg text-foam group-hover:text-pine transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span className="text-subtle">≈</span>
        {isLoading ? (
          <div className="h-4 w-16 bg-overlay animate-pulse rounded" />
        ) : (
          <span className="text-subtle font-medium">
            {symbol} {fiatValue}
          </span>
        )}
      </div>

      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-pine/5 rounded-full blur-2xl group-hover:bg-pine/10 transition-all" />
    </Card>
  );
};
