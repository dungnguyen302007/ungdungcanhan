/**
 * Get time-based greeting in Vietnamese
 * Returns appropriate greeting based on current hour
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return 'Chào buổi sáng';
    } else if (hour >= 12 && hour < 18) {
        return 'Chào buổi chiều';
    } else if (hour >= 18 && hour < 22) {
        return 'Chào buổi tối';
    } else {
        return 'Chào bạn';
    }
};

/**
 * Get emoji based on time of day
 */
export const getGreetingEmoji = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return '☀️';
    } else if (hour >= 12 && hour < 18) {
        return '🌤️';
    } else if (hour >= 18 && hour < 22) {
        return '🌙';
    } else {
        return '⭐';
    }
};
