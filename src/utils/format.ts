import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const formatDate = (date: string | Date | number, formatStr: string = 'dd/MM/yyyy'): string => {
    return format(new Date(date), formatStr, { locale: vi });
};

export const formatMonth = (date: string | Date | number): string => {
    return format(new Date(date), 'MMMM yyyy', { locale: vi });
};
