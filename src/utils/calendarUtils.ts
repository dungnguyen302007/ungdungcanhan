// Calendar utility functions for attendance calendar view

/**
 * Generate all days for a given month with proper positioning
 */
export const generateCalendarDays = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday start

    for (let i = daysFromPrevMonth; i > 0; i--) {
        const prevDate = new Date(year, month, 1 - i);
        days.push(prevDate);
    }

    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    // Add days from next month to complete grid (6 weeks = 42 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
    }

    return days;
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

/**
 * Check if date is in current month
 */
export const isCurrentMonth = (date: Date, currentMonth: number): boolean => {
    return date.getMonth() === currentMonth;
};

/**
 * Format date to YYYY-MM-DD for Firestore query
 */
export const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Get total workdays in a month (excluding weekends)
 */
export const getWorkdaysInMonth = (year: number, month: number): number => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    let workdays = 0;

    for (let i = 1; i <= lastDay; i++) {
        const date = new Date(year, month, i);
        if (!isWeekend(date)) {
            workdays++;
        }
    }

    return workdays;
};

/**
 * Determine day status based on attendance record
 */
export const getDayStatus = (
    date: Date,
    attendanceRecord?: any
): 'present' | 'late' | 'early' | 'late-early' | 'absent' | 'weekend' | 'future' => {
    // Future dates
    if (isFuture(date)) return 'future';

    // Weekends
    if (isWeekend(date)) return 'weekend';

    // No attendance record = absent
    if (!attendanceRecord) return 'absent';

    // Has record, check details
    const isLate = attendanceRecord.details?.lateMinutes > 0;
    const isEarly = attendanceRecord.details?.earlyLeaveMinutes > 0;

    if (isLate && isEarly) return 'late-early';
    if (isLate) return 'late';
    if (isEarly) return 'early';
    return 'present';
};

/**
 * Get month name in Vietnamese
 */
export const getMonthName = (month: number): string => {
    const months = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
        'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
        'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[month];
};

/**
 * Get weekday names in Vietnamese
 */
export const getWeekdayNames = (): string[] => {
    return ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
};
