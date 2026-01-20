import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { loadModels } from '../../utils/faceService';
import { useStore } from '../../store/useStore';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

    useEffect(() => {
        const start = async () => {
            if (!userId) return;

            // Load models
            await loadModels();

            // Fetch user descriptor
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists() && userDoc.data().faceDescriptor) {
                // Convert array back to Float32Array
                setUserDescriptor(new Float32Array(userDoc.data().faceDescriptor));
                setInitializing(false);
                startVideo();
                setMessage("Vui lòng nhìn vào camera để chấm công");
            } else {
                setMessage("Bạn chưa đăng ký khuôn mặt. Vui lòng đăng ký trước.");
                setInitializing(false);
            }
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
        const interval = setInterval(async () => {
            if (videoRef.current && canvasRef.current && userDescriptor && !checking && !isMatched) {
                setChecking(true);

                // Detect face
                const detection = await faceapi.detectSingleFace(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    // Draw box
                    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                    const resizedResult = faceapi.resizeResults(detection, dims);
                    faceapi.draw.drawDetections(canvasRef.current, resizedResult);

                    // Compare
                    const distance = faceapi.euclideanDistance(detection.descriptor, userDescriptor);
                    // threshold 0.5 or 0.6
                    if (distance < 0.5) {
                        setIsMatched(true);
                        handleCheckInSuccess();
                        clearInterval(interval);
                    }
                } else {
                    const context = canvasRef.current.getContext('2d');
                    context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                setChecking(false);
            }
        }, 1000); // Check every 1s

        return () => clearInterval(interval);
    };

    const handleCheckInSuccess = async () => {
        // Play success sound
        const { playCelebrationSound } = await import('../../utils/sound');
        playCelebrationSound();

        // Confetti
        const confetti = (await import('canvas-confetti')).default;
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399']
        });

        toast.success("Chấm công thành công! 🎉");
        setMessage("✅ Chấm công thành công!");

        // Save log
        if (userId) {
            try {
                await addDoc(collection(db, 'attendance_logs'), {
                    userId,
                    timestamp: serverTimestamp(),
                    type: 'check-in',
                    method: 'face-id'
                });
            } catch (e) {
                console.error("Log error:", e);
            }
        }

        // Stop video after success
        setTimeout(stopVideo, 2000);
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-3 mb-6">
                <Camera className="w-8 h-8 text-blue-500" />
                Chấm công khuôn mặt
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
                    <button className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold">
                        Đăng ký ngay
                    </button>
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
                    </div>

                    <p className={`text-lg font-bold ${isMatched ? 'text-green-600' : 'text-slate-600'}`}>
                        {isMatched ? "Xác thực thành công!" : "Đang quét..."}
                    </p>
                </div>
            )}
        </div>
    );
};
