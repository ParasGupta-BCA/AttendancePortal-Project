"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ZoomIn, ZoomOut } from "lucide-react";

export default function ScanPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'checking-gps' | 'gps-error' | 'scanning' | 'loading' | 'success' | 'error' | 'expired'>('checking-gps');
    const [message, setMessage] = useState("Acquiring GPS location...");
    const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);

    // Zoom State
    const [zoom, setZoom] = useState(1);
    const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number; step: number } | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // 1. Initial GPS Check
    useEffect(() => {
        checkLocation();
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Scanner clear error", e));
            }
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
        if (status !== 'scanning') return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: 250 },
            false
        );
        scannerRef.current = scanner;

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string, decodedResult: any) {
            scanner.clear();
            markAttendance(decodedText);
        }

        function onScanFailure(error: any) {
            // handle scan failure, usually better to ignore and keep scanning.
        }

        // --- ZOOM LOGIC INJECTION ---
        // Since Html5QrcodeScanner doesn't expose the track directly, we poll the DOM for the video element
        const checkVideoInterval = setInterval(() => {
            const videoElement = document.querySelector("#reader video") as HTMLVideoElement;
            if (videoElement && videoElement.srcObject) {
                const stream = videoElement.srcObject as MediaStream;
                const track = stream.getVideoTracks()[0];
                if (track) {
                    const capabilities = track.getCapabilities() as any;
                    if (capabilities && 'zoom' in capabilities) {
                        setZoomCaps({
                            min: capabilities.zoom.min,
                            max: capabilities.zoom.max,
                            step: capabilities.zoom.step
                        });
                        setZoom(capabilities.zoom.min);
                        clearInterval(checkVideoInterval); // Found capabilities, stop polling
                    }
                }
            }
        }, 1000); // Check every second until found

        return () => {
            clearInterval(checkVideoInterval);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.log("Cleanup error", e));
            }
        };
        // -----------------------------

    }, [status]);

    // Handle Zoom Change
    const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newZoom = Number(e.target.value);
        setZoom(newZoom);

        // Apply to the active video track directly
        const videoElement = document.querySelector("#reader video") as HTMLVideoElement;
        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            if (track) {
                try {
                    await track.applyConstraints({
                        advanced: [{ zoom: newZoom } as any]
                    });
                } catch (err) {
                    console.error("Failed to apply zoom", err);
                }
            }
        }
    };

    const markAttendance = async (qr_code: string) => {
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

                    <Card className="w-full max-w-sm p-4 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden relative">
                        <div id="reader" className="w-full"></div>
                    </Card>

                    {/* Zoom Slider (Only shown if caps detected) */}
                    {zoomCaps && (
                        <div className="w-full max-w-xs flex items-center space-x-4 bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <ZoomOut className="w-5 h-5 text-gray-500" />
                            <input
                                type="range"
                                min={zoomCaps.min}
                                max={zoomCaps.max}
                                step={zoomCaps.step}
                                value={zoom}
                                onChange={handleZoomChange}
                                className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <ZoomIn className="w-5 h-5 text-gray-500" />
                        </div>
                    )}

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
