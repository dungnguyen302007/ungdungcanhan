import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Default Configuration (Fallback)
export const DEFAULT_ATTENDANCE_CONFIG = {
    START_TIME: '08:00', // 8:00 AM
    END_TIME: '17:30',   // 5:30 PM
    LATE_BUFFER_MINUTES: 15, // Allow until 8:15
    EARLY_LEAVE_BUFFER_MINUTES: 0, // Default 0 minutes allowed early
    LUNCH_BREAK_HOURS: 1.5, // 1.5h lunch break
};

export interface AttendanceConfig {
    START_TIME: string;
    END_TIME: string;
    LATE_BUFFER_MINUTES: number;
    EARLY_LEAVE_BUFFER_MINUTES: number; // New field
    LUNCH_BREAK_HOURS: number;
}

/**
 * Fetch attendance config from Firestore, fallback to default if not found
 */
export const getAttendanceConfig = async (): Promise<AttendanceConfig> => {
    try {
        const docRef = doc(db, 'settings', 'work_config');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                ...DEFAULT_ATTENDANCE_CONFIG, // Ensure defaults for new fields
                ...docSnap.data()
            } as AttendanceConfig;
        }
    } catch (error) {
        console.warn('Error fetching work config, using default:', error);
    }
    return DEFAULT_ATTENDANCE_CONFIG;
};

export const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const calculateLateMinutes = (checkInTime: Date, config: AttendanceConfig = DEFAULT_ATTENDANCE_CONFIG): number => {
    const startWork = parseTime(config.START_TIME);
    // Add buffer
    startWork.setMinutes(startWork.getMinutes() + config.LATE_BUFFER_MINUTES);

    if (checkInTime > startWork) {
        const diffMs = checkInTime.getTime() - startWork.getTime();
        return Math.floor(diffMs / 60000); // Convert ms to minutes
    }
    return 0;
};

export const calculateEarlyLeaveMinutes = (checkOutTime: Date, config: AttendanceConfig = DEFAULT_ATTENDANCE_CONFIG): number => {
    const endWork = parseTime(config.END_TIME);
    // Subtract buffer (allow leaving X minutes early)
    // Example: End 17:30, Buffer 15m => Can leave at 17:15 without penalty
    const allowedEarlyTime = new Date(endWork);
    const buffer = config.EARLY_LEAVE_BUFFER_MINUTES || 0;
    allowedEarlyTime.setMinutes(allowedEarlyTime.getMinutes() - buffer);

    if (checkOutTime < allowedEarlyTime) {
        const diffMs = endWork.getTime() - checkOutTime.getTime();
        // Return full minutes early from official end time? Or from allowed time?
        // Usually, if you violate buffer, you are counted as leaving early from official time.
        // Let's count from OFFICIAL end time to be strict, or just difference.
        // If 17:14 (leave) < 17:15 (allowed), penalty is 17:30 - 17:14 = 16 mins
        return Math.floor(diffMs / 60000);
    }
    return 0;
};

export const calculateTotalWorkHours = (checkIn: Date, checkOut: Date, config: AttendanceConfig = DEFAULT_ATTENDANCE_CONFIG): number => {
    let diffMs = checkOut.getTime() - checkIn.getTime();

    // Basic Total Hours
    let totalHours = diffMs / (1000 * 60 * 60);

    // Deduct Lunch Break if total hours > 5 (assuming full day includes lunch)
    if (totalHours > 5) {
        totalHours -= config.LUNCH_BREAK_HOURS;
    }

    return Math.max(0, parseFloat(totalHours.toFixed(2)));
};

export const getAttendanceStatus = (lateMinutes: number, earlyMinutes: number): 'present' | 'late' | 'early' | 'late-early' => {
    if (lateMinutes > 0 && earlyMinutes > 0) return 'late-early';
    if (lateMinutes > 0) return 'late';
    if (earlyMinutes > 0) return 'early';
    return 'present';
};
