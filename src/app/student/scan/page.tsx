"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export default function ScanPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'checking-gps' | 'gps-error' | 'scanning' | 'loading' | 'success' | 'error' | 'expired'>('checking-gps');
    const [message, setMessage] = useState("Acquiring GPS location...");
    const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);

    // Zoom State
    const [zoom, setZoom] = useState(1);
    const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number; step: number } | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    // 1. Initial GPS Check
    useEffect(() => {
        checkLocation();
        return () => {
            stopScanner();
        };
    }, []);

    const checkLocation = () => {
        setStatus('checking-gps');
        setMessage("Acquiring GPS lock...");

        if (!("geolocation" in navigator)) {
            setStatus('gps-error');
            setMessage("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                });
                setStatus('scanning');
                setMessage("Ready to scan.");
            },
            (error) => {
                console.error("GPS Error:", error);
                setStatus('gps-error');
                if (error.code === error.PERMISSION_DENIED) {
                    setMessage("Location permission denied. Please enable Location Services.");
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setMessage("Location active but signal lost. Move to an open area.");
                } else {
                    setMessage("Failed to get location. Ensure GPS is on.");
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    // 2. Initialize Scanner ONLY when status is 'scanning'
    useEffect(() => {
        if (status === 'scanning' && !html5QrCodeRef.current) {
            startScanner();
        } else if (status !== 'scanning') {
            stopScanner();
        }
    }, [status]);

    const startScanner = async () => {
        try {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    stopScanner();
                    markAttendance(decodedText);
                },
                (errorMessage) => {
                    // ignore errors during scanning
                }
            );

            // Check for zoom capabilities
            // Access the running track to get capabilities
            // @ts-ignore - access internal video element or track if exposed, or use getRunningTrackCameraCapabilities if available in newer versions
            // HTML5-qrcode library might handle this differently, but let's try standard getUserMedia pattern if needed or use internal methods if available.
            // Actually, html5-qrcode doesn't expose the track directly easily in all versions.
            // Let's use the `applyVideoConstraints` method if we can simply try applying zoom.
            // BETTER APPROACH: Get the media stream track from the internal scanner if possible, or blindly try zoom.
            // Wait a moment for camera to fully start
            setTimeout(() => {
               checkZoomCapabilities();
            }, 500);

        } catch (err) {
            console.error("Error starting scanner", err);
            // setStatus('error');
            // setMessage("Camera permission denied or error.");
        }
    };

    const checkZoomCapabilities = () => {
        // This is a bit of a hack since html5-qrcode encapsulates the video element.
        // We look for the video element inside the 'reader' div.
        const videoElement = document.querySelector("#reader video") as HTMLVideoElement;
        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any; // Cast to any because 'zoom' might not be in standard TS lib yet

            if (capabilities && 'zoom' in capabilities) {
                setZoomCaps({
                    min: capabilities.zoom.min,
                    max: capabilities.zoom.max,
                    step: capabilities.zoom.step
                });
                setZoom(capabilities.zoom.min); // Start at min zoom usually
            }
        }
    };

    const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = Number(e.target.value);
        setZoom(newZoom);
        
        if (html5QrCodeRef.current) {
             try {
                // @ts-ignore
                await html5QrCodeRef.current.applyVideoConstraints({
                    advanced: [{ zoom: newZoom }]
                });
             } catch (err) {
                 console.error("Failed to apply zoom", err);
             }
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
                html5QrCodeRef.current = null;
            } catch (e) {
                console.error("Failed to stop scanner", e);
            }
        }
    };

    const markAttendance = async (qr_code: string) => {
        // We already have coords from the initial check, but let's refresh them for precision if possible
        if (!coords) {
            checkLocation();
            return;
        }

        setStatus('loading');
        setMessage("Verifying presence...");

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                await sendRequest(qr_code, pos.coords.latitude, pos.coords.longitude);
            },
            async (err) => {
                setStatus('error');
                setMessage("Lost GPS signal while scanning. Please retry.");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const sendRequest = async (qr_code: string, lat: number, long: number) => {
        try {
            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qr_code, lat, long }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || "Attendance Marked!");
                setTimeout(() => router.push("/student/dashboard"), 2500);
            } else {
                const errMsg = data.error || "Failed to mark.";
                if (errMsg.includes("period is over")) {
                    setStatus('expired');
                } else {
                    setStatus('error');
                }
                setMessage(errMsg);
                setTimeout(() => window.location.reload(), 4000);
            }
        } catch (e) {
            setStatus('error');
            setMessage("Network Error");
        }
    };

    return (
        <div className="flex flex-col items-center p-4 space-y-6 min-h-[80vh] justify-center text-center">

            {/* 1. Checking GPS */}
            {status === 'checking-gps' && (
                <div className="flex flex-col items-center space-y-4 animate-pulse">
                    <MapPin className="w-16 h-16 text-blue-500 animate-bounce" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Checking Location...</h3>
                    <p className="text-sm text-gray-500 max-w-xs">Please allow location access when prompted.</p>
                </div>
            )}

            {/* 2. GPS Error */}
            {status === 'gps-error' && (
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                        <MapPin className="w-12 h-12 text-red-600 dark:text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Location Required</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-xs">{message}</p>
                    <Button onClick={checkLocation} className="mt-4">Retry Location Check</Button>
                </div>
            )}

            {/* 3. Scanning */}
            {status === 'scanning' && (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Scan QR Code</h2>
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-medium">
                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
                        <span>GPS Active</span>
                    </div>

                    <Card className="w-full max-w-sm p-0 bg-black overflow-hidden relative shadow-2xl rounded-3xl border-0">
                         {/* Scanner Viewport */}
                        <div id="reader" className="w-full h-[350px] bg-black"></div>
                        
                        {/* Zoom Controls Overlay */}
                        {zoomCaps && (
                            <div className="absolute bottom-4 left-0 right-0 px-6 pb-2 pt-4 bg-gradient-to-t from-black/80 to-transparent flex items-center space-x-4">
                                <ZoomOut className="w-5 h-5 text-white/80" />
                                <input
                                    type="range"
                                    min={zoomCaps.min}
                                    max={zoomCaps.max}
                                    step={zoomCaps.step}
                                    value={zoom}
                                    onChange={handleZoomChange}
                                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                                <ZoomIn className="w-5 h-5 text-white/80" />
                            </div>
                        )}
                         {/* Overlay Text */}
                         {!zoomCaps && (
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs">
                               Move camera to fit QR code
                            </div>
                         )}
                    </Card>
                    
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        Use the zoom slider for distant codes.
                    </p>
                </>
            )}

            {/* 4. Processing / Results */}
            {(status === 'loading' || status === 'success' || status === 'error' || status === 'expired') && (
                <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                    {status === 'loading' && (
                        <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {status === 'success' && (
                        <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                            <svg className="w-20 h-20 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    )}
                    {(status === 'error' || status === 'expired') && (
                        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
                             {status === 'expired' ? (
                                <svg className="w-20 h-20 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             ) : (
                                <svg className="w-20 h-20 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             )}
                        </div>
                    )}

                    <div className="text-center space-y-2">
                        <h3 className={`text-2xl font-bold ${status === 'success' ? 'text-green-600' :
                            status === 'error' ? 'text-red-600' :
                                status === 'expired' ? 'text-yellow-600' : 'text-blue-600'
                            }`}>
                            {status === 'loading' ? 'Processing...' :
                                status === 'success' ? 'Success!' :
                                    status === 'expired' ? 'Session Expired' : 'Failed'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-medium max-w-xs mx-auto">
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

