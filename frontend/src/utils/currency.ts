export const INR_SYMBOL = '\u20b9';

export const formatCurrency = (value: number | string | null | undefined, maximumFractionDigits = 0) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatCompactCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return `${INR_SYMBOL}0`;
  if (Math.abs(amount) >= 10000000) return `${INR_SYMBOL}${(amount / 10000000).toFixed(1)}Cr`;
  if (Math.abs(amount) >= 100000) return `${INR_SYMBOL}${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000) return `${INR_SYMBOL}${Math.round(amount / 1000)}k`;
  return formatCurrency(amount);
};
