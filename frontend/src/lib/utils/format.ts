import { format } from 'date-fns';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date | number, pattern = 'PPP') => {
  if (!date) return '';
  return format(new Date(date), pattern);
};

export const formatDateTime = (date: string | Date | number) => {
  if (!date) return '';
  return format(new Date(date), 'PPp');
};
