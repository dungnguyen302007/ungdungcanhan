import { useState } from 'react';

/**
 * Custom hook for managing month navigation
 * Handles previous/next month logic and current date state
 * 
 * @returns Object containing currentDate, handlePrevMonth, handleNextMonth
 */
export const useMonthNavigation = (initialDate: Date = new Date()) => {
    const [currentDate, setCurrentDate] = useState(initialDate);

    const handlePrevMonth = () => {
        const prevDate = new Date(currentDate);
        prevDate.setMonth(prevDate.getMonth() - 1);
        setCurrentDate(prevDate);
    };

    const handleNextMonth = () => {
        const nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        setCurrentDate(nextDate);
    };

    return {
        currentDate,
        handlePrevMonth,
        handleNextMonth,
        setCurrentDate,
    };
};
