import Decimal from 'decimal.js';

export const formatCurrency = (value: string | number, currency = 'BRL') => {
  try {
    if (value === '' || value === null || value === undefined) return 'R$ 0,00';
    const amount = new Decimal(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount.toNumber());
  } catch {
    return 'R$ 0,00';
  }
};

export const formatToken = (value: string | number, digits = 8) => {
  try {
    if (value === '' || value === null || value === undefined) return '0';
    const amount = new Decimal(value);
    let formatted = amount.toFixed(digits);
    if (formatted.includes('.')) {
      formatted = formatted.replace(/\.?0+$/, '');
      if (formatted === '') formatted = '0';
    }
    return formatted;
  } catch {
    return '0';
  }
};

export const formatDate = (date: string | Date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return 'Data inválida';
  }
};
