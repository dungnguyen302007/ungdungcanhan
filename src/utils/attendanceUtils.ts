// Configuration (Could be moved to Firestore settings later)
export const ATTENDANCE_CONFIG = {
    START_TIME: '08:00', // 8:00 AM
    END_TIME: '17:30',   // 5:30 PM
    LATE_BUFFER_MINUTES: 15, // Allow until 8:15
    LUNCH_BREAK_HOURS: 1.5, // 1.5h lunch break
};

export const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const calculateLateMinutes = (checkInTime: Date): number => {
    const startWork = parseTime(ATTENDANCE_CONFIG.START_TIME);
    // Add buffer
    startWork.setMinutes(startWork.getMinutes() + ATTENDANCE_CONFIG.LATE_BUFFER_MINUTES);

    if (checkInTime > startWork) {
        const diffMs = checkInTime.getTime() - startWork.getTime();
        return Math.floor(diffMs / 60000); // Convert ms to minutes
    }
    return 0;
};

export const calculateEarlyLeaveMinutes = (checkOutTime: Date): number => {
    const endWork = parseTime(ATTENDANCE_CONFIG.END_TIME);

    if (checkOutTime < endWork) {
        const diffMs = endWork.getTime() - checkOutTime.getTime();
        return Math.floor(diffMs / 60000); // Convert ms to minutes
    }
    return 0;
};

export const calculateTotalWorkHours = (checkIn: Date, checkOut: Date): number => {
    let diffMs = checkOut.getTime() - checkIn.getTime();

    // Create Date objects for lunch calculations logic can be complex
    // Simple logic: If worked across lunch time (12:00 - 13:30), deduct 1.5h
    // Assuming standard shift covers lunch

    // Basic Total Hours
    let totalHours = diffMs / (1000 * 60 * 60);

    // Deduct Lunch Break if total hours > 5 (assuming full day includes lunch)
    if (totalHours > 5) {
        totalHours -= ATTENDANCE_CONFIG.LUNCH_BREAK_HOURS;
    }

    return Math.max(0, parseFloat(totalHours.toFixed(2)));
};

export const getAttendanceStatus = (lateMinutes: number, earlyMinutes: number): 'present' | 'late' | 'early' | 'late-early' => {
    if (lateMinutes > 0 && earlyMinutes > 0) return 'late-early';
    if (lateMinutes > 0) return 'late';
    if (earlyMinutes > 0) return 'early';
    return 'present';
};
