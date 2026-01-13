import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { MAX_TRANSACTION_AMOUNT } from '../types';
// ...

export const formatCurrency = (amount: number): string => {
    // Safety check for Infinity/NaN
    let safeAmount = Number.isFinite(amount) ? amount : 0;

    // Cap display for absurdly large numbers
    if (safeAmount > MAX_TRANSACTION_AMOUNT) {
        return '99 tỷ+';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(safeAmount);
};

export const formatDate = (date: string | Date | number, formatStr: string = 'dd/MM/yyyy'): string => {
    return format(new Date(date), formatStr, { locale: vi });
};

export const formatMonth = (date: string | Date | number): string => {
    return format(new Date(date), 'MMMM yyyy', { locale: vi });
};
