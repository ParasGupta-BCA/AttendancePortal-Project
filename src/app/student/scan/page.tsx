"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: 250 },
        /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string, decodedResult: any) {
            // Handle the scanned code
            console.log(`Scan result: ${decodedText}`, decodedResult);
            setScanResult(decodedText);
            scanner.clear();
            markAttendance(decodedText);
        }

        function onScanFailure(error: any) {
            // handle scan failure, usually better to ignore and keep scanning.
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    const markAttendance = async (qr_code: string) => {
        setMessage("Marking attendance...");
        try {
            // Get device location
            let lat = null, long = null;
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    lat = position.coords.latitude;
                    long = position.coords.longitude;

                    await sendRequest(qr_code, lat, long);
                }, async (error) => {
                    console.warn("Location denied", error);
                    await sendRequest(qr_code, null, null);
                });
            } else {
                await sendRequest(qr_code, null, null);
            }
        } catch (e) {
            setMessage("Error marking attendance.");
        }
    };

    const sendRequest = async (qr_code: string, lat: any, long: any) => {
        try {
            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qr_code, lat, long }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage("✅ " + (data.message || "Attendance Marked!"));
                setTimeout(() => router.push("/student/dashboard"), 2000);
            } else {
                setMessage("❌ " + (data.error || "Failed to mark."));
            }
        } catch (e) {
            setMessage("❌ Network Error");
        }
    };

    return (
        <div className="flex flex-col items-center p-4 space-y-4">
            <h2 className="text-xl font-bold">Scan QR Code</h2>
            <Card className="w-full max-w-sm p-4 bg-black">
                <div id="reader" className="w-full bg-white"></div>
            </Card>
            {message && (
                <div className="p-4 bg-white shadow rounded-lg w-full text-center font-semibold animate-pulse">
                    {message}
                </div>
            )}
        </div>
    );
}
