import { useState } from 'react';
import type { Transaction } from '../types';

/**
 * Custom hook for managing transaction modal state
 * Handles opening/closing modal and editing transaction
 * 
 * @returns Object containing modal state and handlers
 */
export const useTransactionModal = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const openModal = () => {
        setIsFormOpen(true);
    };

    const closeModal = () => {
        setIsFormOpen(false);
        setEditingTransaction(null);
    };

    const editTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    return {
        isFormOpen,
        editingTransaction,
        openModal,
        closeModal,
        editTransaction,
    };
};
