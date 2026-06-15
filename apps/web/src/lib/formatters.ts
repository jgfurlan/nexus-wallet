import Decimal from 'decimal.js';

export const formatCurrency = (value: string | number, currency = 'BRL') => {
  const amount = new Decimal(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount.toNumber());
};

export const formatToken = (value: string | number, digits = 8) => {
  const amount = new Decimal(value);
  return amount.toFixed(digits);
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
