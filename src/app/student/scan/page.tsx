"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ScanPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'expired'>('idle');
    const [message, setMessage] = useState("");

    useEffect(() => {
        // ... same scanner setup ...
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: 250 },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string, decodedResult: any) {
            scanner.clear();
            markAttendance(decodedText);
        }

        function onScanFailure(error: any) { }

        return () => {
            scanner.clear().catch(e => console.error(e));
        };
    }, []);

    const markAttendance = async (qr_code: string) => {
        setStatus('loading');
        setMessage("Acquiring location...");

        if (!("geolocation" in navigator)) {
            setStatus('error');
            setMessage("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setMessage("Verifying location...");
                await sendRequest(qr_code, position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Geo Error:", error);
                setStatus('error');
                if (error.code === error.PERMISSION_DENIED) {
                    setMessage("Location permission denied. You MUST allow location access to mark attendance.");
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setMessage("Location unavailable. Try moving to an open area.");
                } else {
                    setMessage("Error getting location. Please retry.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
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
                } else if (errMsg.includes("away from class")) {
                    setStatus('error'); // Keep error state for distance
                } else {
                    setStatus('error');
                }
                setMessage(errMsg);
                // Allow user to try again after delay?
                setTimeout(() => window.location.reload(), 4000);
            }
        } catch (e) {
            setStatus('error');
            setMessage("Network Error");
        }
    };

    return (
        <div className="flex flex-col items-center p-4 space-y-6 min-h-[80vh] justify-center">
            {status === 'idle' && (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Scan QR Code</h2>
                    <Card className="w-full max-w-sm p-4 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                        <div id="reader" className="w-full"></div>
                    </Card>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        Align the QR code within the frame. <br />
                        <span className="text-blue-600 font-medium">Location access is required.</span>
                    </p>
                </>
            )}

            {status !== 'idle' && (
                <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">

                    {/* Icons */}
                    {status === 'loading' && (
                        <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}

                    {status === 'success' && (
                        <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
                            <svg className="w-20 h-20 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
                            <svg className="w-20 h-20 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}

                    {status === 'expired' && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-full">
                            <svg className="w-20 h-20 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}

                    {/* Text */}
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

                    {status === 'success' && (
                        <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
                    )}
                </div>
            )}
        </div>
    );
}
