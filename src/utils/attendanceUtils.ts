import type { DailyAttendance, AttendanceRequest } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Work Configuration Interface
 */
interface WorkConfig {
    START_TIME: string;
    END_TIME: string;
    LATE_BUFFER_MINUTES: number;
    EARLY_LEAVE_BUFFER_MINUTES: number;
    LUNCH_BREAK_HOURS: number;
}

const DEFAULT_CONFIG: WorkConfig = {
    START_TIME: '08:00',
    END_TIME: '17:30',
    LATE_BUFFER_MINUTES: 15,
    EARLY_LEAVE_BUFFER_MINUTES: 0,
    LUNCH_BREAK_HOURS: 1.5,
};

/**
 * Fetch work attendance config from Firestore
 */
export const getAttendanceConfig = async (): Promise<WorkConfig> => {
    try {
        const docRef = doc(db, 'settings', 'work_config');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...DEFAULT_CONFIG, ...docSnap.data() } as WorkConfig;
        }
        return DEFAULT_CONFIG;
    } catch (error) {
        console.error('Error fetching work config:', error);
        return DEFAULT_CONFIG;
    }
};

/**
 * Calculate late minutes for check-in
 */
export const calculateLateMinutes = (checkInTime: Date, config: WorkConfig): number => {
    const [startH, startM] = config.START_TIME.split(':').map(Number);
    const standardStart = new Date(checkInTime);
    standardStart.setHours(startH, startM, 0, 0);

    // Add buffer
    const bufferTime = new Date(standardStart.getTime() + config.LATE_BUFFER_MINUTES * 60 * 1000);

    if (checkInTime > bufferTime) {
        return Math.floor((checkInTime.getTime() - standardStart.getTime()) / (1000 * 60));
    }
    return 0;
};

/**
 * Calculate early leave minutes for check-out
 */
export const calculateEarlyLeaveMinutes = (checkOutTime: Date, config: WorkConfig): number => {
    const [endH, endM] = config.END_TIME.split(':').map(Number);
    const standardEnd = new Date(checkOutTime);
    standardEnd.setHours(endH, endM, 0, 0);

    // Subtract buffer
    const bufferTime = new Date(standardEnd.getTime() - config.EARLY_LEAVE_BUFFER_MINUTES * 60 * 1000);

    if (checkOutTime < bufferTime) {
        return Math.floor((standardEnd.getTime() - checkOutTime.getTime()) / (1000 * 60));
    }
    return 0;
};

/**
 * Calculate total work hours
 */
export const calculateTotalWorkHours = (checkInTime: Date, checkOutTime: Date, config: WorkConfig): number => {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    let hours = diffMs / (1000 * 60 * 60);

    // Subtract lunch break if worked more than 4 hours
    if (hours > 4) {
        hours -= config.LUNCH_BREAK_HOURS;
    }

    return Math.max(0, parseFloat(hours.toFixed(1)));
};

/**
 * Calculates the "Work Day" (Công) credit for a given attendance record.
 * 
 * Rules:
 * 1. Priority: 'remote_work' or 'leave' approved -> 1.0
 * 2. If 'checkIn' or 'checkOut' missing -> Need 'missing_in'/'missing_out' approved -> 1.0, otherwise 0.
 * 3. If full check:
 *    - Late > 0 -> Need 'late_in' approved.
 *    - Early > 0 -> Need 'early_out' approved.
 *    - If any error exists and is NOT covered -> 0.0.
 *    - If all errors covered (or no errors) -> 1.0.
 */
export const calculateWorkDay = (attendance: DailyAttendance | null | undefined, requests: AttendanceRequest[] = []): number => {
    // Filter approved requests only
    const approvedRequests = requests.filter(r => r.status === 'approved');

    // 1. Global Override (Remote Work / Leave)
    if (approvedRequests.some(r => r.type === 'remote_work' || r.type === 'leave')) {
        return 1.0;
    }

    if (!attendance) return 0.0;

    const { checkInTime, checkOutTime } = attendance;
    const lateMinutes = attendance.details?.lateMinutes || 0;
    const earlyLeaveMinutes = attendance.details?.earlyLeaveMinutes || 0;

    // 2. Missing Checks
    if (!checkInTime) {
        // Need missing_in explanation
        const covered = approvedRequests.some(r => r.type === 'missing_in');
        if (!covered) return 0.0;
    }
    if (!checkOutTime) {
        // Need missing_out explanation
        const covered = approvedRequests.some(r => r.type === 'missing_out');
        if (!covered) return 0.0;
    }

    // If we have missing checks but they ARE covered, we proceed (or just return 1 if we consider missing check explained = full day).
    // Usually missing check explained = assume full day.
    if (!checkInTime || !checkOutTime) {
        // If we are here, it means missing parts were covered.
        // But what if one is missing (covered) and the other is present (and Late/Early)?
        // E.g. CheckIn Late (Unexcused) + Missing Out (Excused).
        // If CheckIn exists, we check Late.
        if (checkInTime && lateMinutes > 0) {
            const lateCovered = approvedRequests.some(r => r.type === 'late_in');
            if (!lateCovered) return 0.0;
        }
        // If CheckOut exists, we check Early.
        if (checkOutTime && earlyLeaveMinutes > 0) {
            const earlyCovered = approvedRequests.some(r => r.type === 'early_out');
            if (!earlyCovered) return 0.0;
        }
        return 1.0;
    }

    // 3. Full Check-in/out Present
    let valid = true;

    if (lateMinutes > 0) {
        const lateCovered = approvedRequests.some(r => r.type === 'late_in');
        if (!lateCovered) valid = false;
    }

    if (earlyLeaveMinutes > 0) {
        const earlyCovered = approvedRequests.some(r => r.type === 'early_out');
        if (!earlyCovered) valid = false;
    }

    return valid ? 1.0 : 0.0;
};

export interface WorkDayStatus {
    credit: number;
    label: string;
    color: string;
    textColor: string;
    borderColor: string;
}

export const getWorkDayStatus = (attendance: DailyAttendance | null | undefined, requests: AttendanceRequest[] = []): WorkDayStatus => {
    const defaultStatus = {
        credit: 0,
        label: 'Vắng mặt',
        color: 'bg-slate-100',
        textColor: 'text-slate-500',
        borderColor: 'border-slate-200'
    };

    if (!attendance && requests.length === 0) return defaultStatus;

    const credit = calculateWorkDay(attendance, requests);
    const approvedRequests = requests.filter(r => r.status === 'approved');

    // If Credit is 1 (Full Day)
    if (credit === 1) {
        const hasExplanation = approvedRequests.length > 0;
        return {
            credit: 1,
            label: hasExplanation ? 'Đủ công (Đã giải trình)' : 'Đủ công',
            color: 'bg-green-100',
            textColor: 'text-green-700',
            borderColor: 'border-green-200'
        };
    }

    // If Credit 0 - Analyze WHY
    // Check for Pending requests
    const pendingRequests = requests.filter(r => r.status === 'pending');
    if (pendingRequests.length > 0) {
        return {
            credit: 0,
            label: 'Chờ duyệt',
            color: 'bg-amber-100',
            textColor: 'text-amber-700',
            borderColor: 'border-amber-200'
        };
    }

    // Check for Rejected requests
    const rejectedRequests = requests.filter(r => r.status === 'rejected');

    if (attendance) {
        const errors = [];
        const lateMinutes = attendance.details?.lateMinutes || 0;
        const earlyLeaveMinutes = attendance.details?.earlyLeaveMinutes || 0;

        // Check specifics
        if (lateMinutes > 0 && !approvedRequests.some(r => r.type === 'late_in' || r.type === 'remote_work' || r.type === 'leave')) {
            if (rejectedRequests.some(r => r.type === 'late_in')) {
                errors.push('Đi muộn (Từ chối)');
            } else {
                errors.push('Đi muộn');
            }
        }

        if (earlyLeaveMinutes > 0 && !approvedRequests.some(r => r.type === 'early_out' || r.type === 'remote_work' || r.type === 'leave')) {
            if (rejectedRequests.some(r => r.type === 'early_out')) {
                errors.push('Về sớm (Từ chối)');
            } else {
                errors.push('Về sớm');
            }
        }

        if (!attendance.checkInTime && !approvedRequests.some(r => r.type === 'missing_in')) errors.push('Thiếu Check-in');
        if (!attendance.checkOutTime && !approvedRequests.some(r => r.type === 'missing_out')) errors.push('Thiếu Check-out');

        if (errors.length > 0) {
            return {
                credit: 0,
                label: `Không đủ (${errors.join(', ')})`,
                color: 'bg-orange-50',
                textColor: 'text-orange-600',
                borderColor: 'border-orange-100'
            };
        }
    }

    return {
        credit: 0,
        label: 'Không đủ',
        color: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-100'
    };
};
