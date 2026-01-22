// Geolocation utilities for attendance verification

/**
 * Office location configuration
 */
export const OFFICE_LOCATIONS = {
    main: {
        name: 'Chung cư Aranya, Huế',
        latitude: 16.4637,
        longitude: 107.5909,
        radiusMeters: 100, // 100m allowed radius
    },
};

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

/**
 * Get user's current GPS position
 */
export const getCurrentPosition = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                });
            },
            (error) => {
                let errorMessage = 'Unable to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Bạn đã từ chối truy cập vị trí. Vui lòng bật định vị trong cài đặt trình duyệt.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Không thể xác định vị trí. Vui lòng kiểm tra GPS của bạn.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Hết thời gian chờ lấy vị trí. Vui lòng thử lại.';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
            }
        );
    });
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns distance in meters
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Check if user is within allowed radius of office
 */
export const isWithinRadius = (
    userLat: number,
    userLon: number,
    officeLat: number,
    officeLon: number,
    radiusMeters: number
): boolean => {
    const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
    return distance <= radiusMeters;
};

/**
 * Get office location from Firestore
 */
const getOfficeLocation = async () => {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');

    try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'office_location'));
        if (settingsDoc.exists()) {
            return settingsDoc.data() as {
                name: string;
                latitude: number;
                longitude: number;
                radiusMeters: number;
            };
        }
    } catch (error) {
        console.warn('Failed to load office location from Firestore, using default');
    }

    // Fallback to default
    // Tăng bán kính lên 3000m theo yêu cầu
    return { ...OFFICE_LOCATIONS.main, radiusMeters: 3000 };
};

/**
 * Validate user location against office location
 */
export const validateLocation = async (): Promise<{
    isValid: boolean;
    distance: number;
    location: LocationData;
    message: string;
}> => {
    try {
        const userLocation = await getCurrentPosition();
        const office = await getOfficeLocation();

        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            office.latitude,
            office.longitude
        );

        const isValid = distance <= office.radiusMeters;

        let message = '';
        if (!isValid) {
            // DEBUG MESSAGE: Hiển thị chi tiết để user biết tại sao sai
            message = `❌ Vị trí không hợp lệ!\n` +
                `Khoảng cách: ${Math.round(distance)}m (Cho phép: ${office.radiusMeters}m)\n` +
                `📍 Bạn: ${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}\n` +
                `🏢 Office: ${office.latitude.toFixed(5)}, ${office.longitude.toFixed(5)}`;
        } else if (userLocation.accuracy > 1000) { // Tăng giới hạn accuracy lên 1000m
            message = `⚠️ Cảnh báo: Độ chính xác GPS thấp (${Math.round(userLocation.accuracy)}m).`;
        } else {
            message = `✅ Vị trí hợp lệ. Cách văn phòng ${Math.round(distance)}m.`;
        }

        return {
            isValid,
            distance: Math.round(distance),
            location: userLocation,
            message,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Format location data for Firestore storage
 */
export const formatLocationForStorage = (
    location: LocationData,
    distance: number,
    isWithinRadius: boolean
) => {
    return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: new Date(location.timestamp),
        distanceFromOffice: distance,
        isWithinRadius,
    };
};

/**
 * Get Google Maps link for coordinates
 */
export const getGoogleMapsLink = (lat: number, lon: number): string => {
    return `https://www.google.com/maps?q=${lat},${lon}`;
};
