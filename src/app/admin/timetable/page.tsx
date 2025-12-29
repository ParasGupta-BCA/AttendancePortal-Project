"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

export default function TimetablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrValues, setQrValues] = useState<Record<string, string>>({}); // valid QR image data URLs
    const [activeSession, setActiveSession] = useState<any>(null); // Details of session just created

    useEffect(() => {
        fetch("/api/timetable")
            .then((res) => res.json())
            .then((data) => {
                setTimetable(data.timetable);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, []);

    const handleGenerateQR = async (slot: any) => {
        try {
            // 1. Create Session via API
            // For MVP, we assume current user is Admin/Faculty (handled by backend session check, 
            // but here on client we rely on cookie. If dev environment has no cookie, this might fail 401. 
            // User needs to login first. I haven't built login page yet. 
            // *** CRITICAL ***: If I am testing without login, I need to bypass auth or login.
            // I'll proceed assuming auth works or I'll fix it if it fails.)

            const res = await fetch("/api/attendance/session/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timetable_id: slot.id
                    // device location could be sent here
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to create session");
                return;
            }

            // 2. Generate QR Image
            const qrImage = await QRCode.toDataURL(data.qr_code);

            setActiveSession({
                ...slot,
                qrImage,
                expiry: new Date(Date.now() + 10 * 60 * 1000) // Mock expiry visual or use real one
            });

        } catch (error) {
            console.error("QR Error", error);
            alert("Error generating QR");
        }
    };

    if (loading) return <div className="p-8">Loading Timetable...</div>;

    // Group by Day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = days.reduce((acc, day) => {
        acc[day] = timetable.filter((t) => t.day_of_week === day);
        return acc;
    }, {} as any);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Timetable & Attendance</h2>
            </div>

            <div className="space-y-6">
                {days.map((day) => (
                    <div key={day} className="space-y-4">
                        <h3 className="text-xl font-semibold">{day}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(grouped[day] || []).length === 0 && <p className="text-muted-foreground text-sm">No classes.</p>}
                            {grouped[day]?.map((slot: any) => (
                                <Card key={slot.id} className="relative overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <Badge variant="outline" className="w-fit mb-2">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</Badge>
                                        <CardTitle className="text-base">{slot.subject_name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{slot.faculty_name || "Unknown Faculty"}</p>
                                        <Button size="sm" className="w-full" onClick={() => handleGenerateQR(slot)}>
                                            Generate QR
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!activeSession} onOpenChange={(open: boolean) => !open && setActiveSession(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="text-center space-y-1">
                            <h3 className="font-semibold">{activeSession?.subject_name} ({activeSession?.subject_code})</h3>
                            <p className="text-sm text-muted-foreground">{activeSession?.start_time?.slice(0, 5)} - {activeSession?.end_time?.slice(0, 5)}</p>
                        </div>
                        {activeSession?.qrImage && (
                            <img src={activeSession.qrImage} alt="QR Code" className="w-64 h-64 border-4 border-white shadow-lg rounded-lg" />
                        )}
                        <p className="text-xs text-red-500 font-medium animate-pulse">
                            QR acts as session token. Expires automatically.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
