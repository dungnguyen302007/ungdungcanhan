import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { loadModels } from '../../utils/faceService';
import { useStore } from '../../store/useStore';
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

export const FaceCheckIn: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { userId } = useStore();

    const [initializing, setInitializing] = useState(true);
    const [message, setMessage] = useState("Đang tải dữ liệu...");
    const [userDescriptor, setUserDescriptor] = useState<Float32Array | null>(null);
    const [isMatched, setIsMatched] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);

    // New State for Advanced Flow
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [actionType, setActionType] = useState<'check-in' | 'check-out'>('check-in');

    useEffect(() => {
        const start = async () => {
            if (!userId) return;

            // Load Models
            await loadModels();

            // 1. Fetch User Face Descriptor
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (!userDoc.exists() || !userDoc.data().faceDescriptor) {
                setMessage("Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước.");
                setInitializing(false);
                return;
            }
            setUserDescriptor(new Float32Array(userDoc.data().faceDescriptor));

            // 2. Check Today's Attendance Record
            const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
            const recordId = `${userId}_${today}`;
            const recordDoc = await getDoc(doc(db, 'attendance_days', recordId));

            if (recordDoc.exists()) {
                setTodayRecord(recordDoc.data());
                // If checked in but not checked out -> Next action is Check-out
                if (recordDoc.data().checkInTime && !recordDoc.data().checkOutTime) {
                    setActionType('check-out');
                    setMessage("Chào bạn! Nhìn vào camera để Check-out 🏠");
                } else if (recordDoc.data().checkOutTime) {
                    setMessage("Bạn đã hoàn thành công việc hôm nay! ✅");
                    // Optional: Allow re-checkin? For now, just show status
                }
            } else {
                setActionType('check-in');
                setMessage("Chào buổi sáng! Nhìn vào camera để Check-in ☀️");
            }

            setInitializing(false);
            startVideo();
        };
        start();

        return () => stopVideo();
    }, [userId]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Camera error:", err);
                toast.error("Không thể truy cập camera");
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const handleVideoPlay = () => {
        // ... (Keep existing detection loop logic, just change handleCheckInSuccess call)
        const interval = setInterval(async () => {
            if (videoRef.current && canvasRef.current && userDescriptor && !checking && !isMatched) {
                // If today is fully done, stop checking
                if (todayRecord?.checkOutTime) return;

                setChecking(true);

                const detection = await faceapi.detectSingleFace(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                    const resizedResult = faceapi.resizeResults(detection, dims);
                    faceapi.draw.drawDetections(canvasRef.current, resizedResult);

                    const distance = faceapi.euclideanDistance(detection.descriptor, userDescriptor);
                    if (distance < 0.5) {
                        setIsMatched(true);
                        handleProccessAttendance(); // Call new handler
                        clearInterval(interval);
                    }
                } else {
                    const context = canvasRef.current.getContext('2d');
                    context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                setChecking(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    };

    const handleProccessAttendance = async () => {
        if (!userId) return;
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const recordId = `${userId}_${today}`;

        let notifMessage = "";
        let notifTitle = "";

        // Play Sound & Confetti
        const { playCelebrationSound } = await import('../../utils/sound');
        playCelebrationSound();
        const confetti = (await import('canvas-confetti')).default;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399'] });

        try {
            if (actionType === 'check-in') {
                // LOGIC CHECK-IN
                const { calculateLateMinutes } = await import('../../utils/attendanceUtils');
                const lateMinutes = calculateLateMinutes(now);

                notifTitle = lateMinutes > 0 ? "Check-in Trễ ⚠️" : "Check-in Thành Công ✅";
                notifMessage = lateMinutes > 0
                    ? `Bạn đi trễ ${lateMinutes} phút. Cố gắng hơn nhé!`
                    : `Tuyệt vời! Bạn đã đến đúng giờ.`;

                await setDoc(doc(db, 'attendance_days', recordId), {
                    id: recordId,
                    userId,
                    date: today,
                    checkInTime: serverTimestamp(),
                    checkOutTime: null,
                    details: {
                        lateMinutes,
                        earlyLeaveMinutes: 0,
                        totalWorkHours: 0
                    },
                    status: lateMinutes > 0 ? 'late' : 'present',
                    logs: [{ time: new Date(), type: 'check-in', method: 'face-id' }]
                }, { merge: true });

                setActionType('check-out'); // Switch to next step

            } else {
                // LOGIC CHECK-OUT
                const { calculateEarlyLeaveMinutes, calculateTotalWorkHours } = await import('../../utils/attendanceUtils');

                // Need checkInTime to calculate totals. If from state it might be old, but we can trust firestore or state if refreshed.
                // Better use server time, but for calculation we need approximation
                const checkInDate = todayRecord?.checkInTime?.toDate ? todayRecord.checkInTime.toDate() : now; // Fallback?

                const earlyMinutes = calculateEarlyLeaveMinutes(now);
                const totalHours = calculateTotalWorkHours(checkInDate, now);

                notifTitle = "Check-out Thành Công 🏠";
                notifMessage = `Tổng giờ làm: ${totalHours}h. ${earlyMinutes > 0 ? `Về sớm ${earlyMinutes} phút.` : "Hẹn gặp lại mai!"}`;

                // Update record
                // We use arrayUnion to append log, but update fields
                await updateDoc(doc(db, 'attendance_days', recordId), {
                    checkOutTime: serverTimestamp(),
                    'details.earlyLeaveMinutes': earlyMinutes,
                    'details.totalWorkHours': totalHours,
                    // If already late, keep late. If not late but early leave -> 'early' (or 'late-early' if both)
                    // Complexity: status update logic... lets keep simple for now or fetch logs to update status
                });
            }

            // Show Notification
            toast.success(notifTitle + ": " + notifMessage, { duration: 5000 });
            setMessage(notifMessage);

            // Save Notification to collection
            await addDoc(collection(db, 'notifications'), {
                userId,
                type: 'system',
                title: notifTitle,
                message: notifMessage,
                date: new Date().toISOString(),
                isRead: false
            });

        } catch (e) {
            console.error("Attendance Error:", e);
            toast.error("Lỗi xử lý chấm công");
        }

        setTimeout(stopVideo, 3000);
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-3 mb-6">
                <Camera className="w-8 h-8 text-blue-500" />
                {initializing ? "Đang tải..." :
                    todayRecord?.checkOutTime ? "Hoàn thành hôm nay" :
                        actionType === 'check-in' ? "Check-in Vào Làm" : "Check-out Ra Về"}
            </h2>

            {initializing ? (
                <div className="py-10 text-slate-500">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    {message}
                </div>
            ) : !userDescriptor ? (
                <div className="bg-amber-50 text-amber-600 p-6 rounded-2xl">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-bold">{message}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            onPlay={handleVideoPlay}
                            className={`absolute inset-0 w-full h-full object-cover mirror ${isMatched ? 'border-4 border-green-500' : ''}`}
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />

                        {isMatched && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                                <div className="bg-white p-4 rounded-full shadow-2xl scale-150">
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                            </div>
                        )}

                        {/* Status Badge Overlay */}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white font-bold text-xs uppercase">
                            {actionType} Mode
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className={`text-lg font-bold ${isMatched ? 'text-green-600' : 'text-slate-700'}`}>
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
