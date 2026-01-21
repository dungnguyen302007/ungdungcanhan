import React, { useState, useEffect } from 'react';
import { MapPin, Save, Loader, Navigation, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { getCurrentPosition } from '../../utils/locationUtils';

interface OfficeLocation {
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
}

export const LocationSettings: React.FC = () => {
    const [location, setLocation] = useState<OfficeLocation>({
        name: 'Chung cư Aranya, Huế',
        latitude: 16.4637,
        longitude: 107.5909,
        radiusMeters: 100,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settingsDoc = await getDoc(doc(db, 'settings', 'office_location'));
            if (settingsDoc.exists()) {
                setLocation(settingsDoc.data() as OfficeLocation);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetCurrentLocation = async () => {
        setDetecting(true);
        try {
            const position = await getCurrentPosition();
            setLocation(prev => ({
                ...prev,
                latitude: position.latitude,
                longitude: position.longitude,
            }));
            toast.success(`Đã lấy vị trí: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`);
        } catch (error: any) {
            toast.error(error.message || 'Không thể lấy vị trí');
        } finally {
            setDetecting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'office_location'), location);
            toast.success('Đã lưu cài đặt!');
        } catch (error) {
            toast.error('Lỗi khi lưu cài đặt');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-slate-500 mt-4">Đang tải cài đặt...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Cài đặt Vị trí Văn phòng</h2>
                        <p className="text-slate-500 text-sm">Cấu hình vị trí cho hệ thống chấm công</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Office Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Tên văn phòng
                        </label>
                        <input
                            type="text"
                            value={location.name}
                            onChange={(e) => setLocation(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="VD: Chung cư Aranya, Huế"
                        />
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Vĩ độ (Latitude)
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={location.latitude}
                                onChange={(e) => setLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Kinh độ (Longitude)
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={location.longitude}
                                onChange={(e) => setLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Get Current Location Button */}
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={detecting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        {detecting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Đang lấy vị trí...
                            </>
                        ) : (
                            <>
                                <Navigation className="w-5 h-5" />
                                Lấy vị trí hiện tại
                            </>
                        )}
                    </button>

                    {/* Radius */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Bán kính cho phép (mét)
                        </label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {[50, 100, 200, 500].map(radius => (
                                <button
                                    key={radius}
                                    onClick={() => setLocation(prev => ({ ...prev, radiusMeters: radius }))}
                                    className={`py-2 px-4 rounded-lg font-bold text-sm transition-all ${location.radiusMeters === radius
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {radius}m
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={location.radiusMeters}
                            onChange={(e) => setLocation(prev => ({ ...prev, radiusMeters: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Hoặc nhập số khác"
                            min="10"
                            max="10000"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-bold mb-1">Lưu ý:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Nhân viên chỉ có thể chấm công trong bán kính {location.radiusMeters}m từ văn phòng</li>
                                <li>Dùng nút "Lấy vị trí hiện tại" để tự động điền tọa độ chính xác</li>
                                <li>Bán kính 50-100m phù hợp với văn phòng nhỏ, 200-500m cho khu phức hợp</li>
                            </ul>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Lưu cài đặt
                            </>
                        )}
                    </button>

                    {/* Preview */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Xem trước</p>
                        <p className="text-sm text-slate-700">
                            📍 <strong>{location.name}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} • Bán kính: {location.radiusMeters}m
                        </p>
                        <a
                            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs mt-2 inline-block"
                        >
                            📺 Xem trên Google Maps
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
