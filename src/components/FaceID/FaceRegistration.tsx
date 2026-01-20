import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCcw, Save, AlertCircle } from 'lucide-react';
import { loadModels, getFaceDescriptor } from '../../utils/faceService';
import { useAuthStore } from '../../store/useAuthStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

export const FaceRegistration: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { user } = useAuthStore();

    const [initializing, setInitializing] = useState(true);
    // const [detecting, setDetecting] = useState(false);
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const [videoError, setVideoError] = useState(false);

    // Permission check
    if (!user || user.role === 'pending') {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto text-center">
                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Tài khoản chưa được duyệt</h2>
                <p className="text-slate-500">
                    Vui lòng liên hệ Admin để duyệt tài khoản trước khi đăng ký Face ID.
                </p>
            </div>
        );
    }

    useEffect(() => {
        const start = async () => {
            const loaded = await loadModels();
            if (loaded) {
                setInitializing(false);
                startVideo();
            }
        };
        start();

        return () => {
            stopVideo();
        }
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Camera error:", err);
                setVideoError(true);
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
            if (videoRef.current && canvasRef.current && !descriptor) {
                // setDetecting(true);
                const result = await faceapi.detectSingleFace(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (result) {
                    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                    const resizedResult = faceapi.resizeResults(result, dims);
                    faceapi.draw.drawDetections(canvasRef.current, resizedResult);
                    // Automatically capture if high confidence? Better let user click "Capture" manually to pick best frame, 
                    // OR just show box and let them click.
                    // For registration, let's auto-detect to show green box, but save manually? 
                    // Actually, if we want to "Register", we capture when user is ready.
                } else {
                    const context = canvasRef.current.getContext('2d');
                    context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                // setDetecting(false);
            }
        }, 500); // Check every 500ms

        return () => clearInterval(interval);
    };

    const captureFace = async () => {
        if (!videoRef.current) return;

        const desc = await getFaceDescriptor(videoRef.current);
        if (desc) {
            setDescriptor(desc);
            toast.success("Đã chụp khuôn mặt! Vui lòng lưu lại.");
        } else {
            toast.error("Không tìm thấy khuôn mặt. Hãy nhìn thẳng vào camera.");
        }
    };

    const saveFaceID = async () => {
        if (!user || !descriptor) return;

        try {
            // Convert Float32Array to regular array for Firestore
            const faceData = Array.from(descriptor);

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                faceDescriptor: faceData,
                hasFaceRegistered: true
            });

            toast.success("Đăng ký khuôn mặt thành công!");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Lỗi khi lưu dữ liệu.");
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                <Camera className="w-8 h-8 text-blue-500" />
                Đăng ký Face ID
            </h2>

            {initializing ? (
                <div className="text-center py-10 text-slate-500">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Đang tải mô hình AI...
                </div>
            ) : videoError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle />
                    Không tìm thấy Camera. Hãy kiểm tra quyền truy cập.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            onPlay={handleVideoPlay}
                            className="absolute inset-0 w-full h-full object-cover mirror"
                            style={{ transform: 'scaleX(-1)' }} // Mirror effect
                        />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />

                        {!descriptor && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm backdrop-blur-md">
                                Nhìn thẳng vào camera
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4">
                        {!descriptor ? (
                            <button
                                onClick={captureFace}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
                            >
                                <Camera className="w-5 h-5" />
                                Chụp Khuôn Mặt
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setDescriptor(null)}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 transition-all"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    Chụp Lại
                                </button>
                                <button
                                    onClick={saveFaceID}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-200"
                                >
                                    <Save className="w-5 h-5" />
                                    Lưu Face ID
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
