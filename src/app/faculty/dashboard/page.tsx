"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode";

export default function FacultyDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/faculty/dashboard")
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const generateQR = async (slotId: string) => {
        try {
            const res = await fetch("/api/attendance/session/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timetable_id: slotId })
            });
            const json = await res.json();
            if (json.success) {
                // Refresh data to show active session
                window.location.reload();
            } else {
                alert("Error: " + json.error);
            }
        } catch (e) {
            alert("Failed to create session");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    const { stats, todaySchedule } = data || {};

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h2>

            <h3 className="text-xl font-bold mb-4">Daily Overview</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.classesToday || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students Present</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.studentsPresent || 0}</div>
                        <p className="text-xs text-muted-foreground">in your classes today</p>
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Class Analysis</h3>
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data?.analysis?.totalPresent || 0}</div>
                        <p className="text-xs text-muted-foreground">Students marked present across all your classes</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                        <Users className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data?.analysis?.totalAbsent || 0}</div>
                        <p className="text-xs text-muted-foreground">Students absent across all your classes</p>
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Today's Schedule</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todaySchedule?.map((slot: any) => (
                    <Card key={slot.id} className={slot.activeSession ? "border-green-500 border-2" : ""}>
                        <CardHeader>
                            <CardTitle>{slot.subject_name}</CardTitle>
                            <CardDescription>{slot.class_name} ({slot.section})</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">Time: {slot.start_time} - {slot.end_time}</p>
                            <p className="text-sm mb-4">Room: {slot.room_no || 'N/A'}</p>

                            {slot.activeSession ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">View Active QR</Button>
                                    </DialogTrigger>
                                    <DialogContent className="flex flex-col items-center sm:max-w-md">
                                        <h3 className="text-xl font-bold mb-4">Scan to Mark Attendance</h3>
                                        <QRDisplay code={slot.activeSession.qr_code} />
                                        <p className="text-sm text-muted-foreground mt-4 mb-6 text-center">
                                            Ask students to scan this QR code with their app to mark their attendance.
                                        </p>
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={async () => {
                                                if (!confirm("Are you sure? This will mark all remaining students as ABSENT.")) return;

                                                try {
                                                    const res = await fetch("/api/faculty/finalize-attendance", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ sessionId: slot.activeSession.id })
                                                    });
                                                    const json = await res.json();
                                                    if (json.success) {
                                                        alert(json.message);
                                                        window.location.reload();
                                                    } else {
                                                        alert("Error: " + json.error);
                                                    }
                                                } catch (e) {
                                                    alert("Failed to finalize session");
                                                }
                                            }}
                                        >
                                            End Session & Mark Absentees
                                        </Button>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <Button onClick={() => generateQR(slot.id)} className="w-full">
                                    <QrCode className="mr-2 h-4 w-4" /> Start Session
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {todaySchedule?.length === 0 && <p>No classes scheduled for today.</p>}
            </div>
        </div>
    );
}

function QRDisplay({ code }: { code: string }) {
    const [src, setSrc] = useState("");
    useEffect(() => {
        QRCode.toDataURL(code).then(setSrc);
    }, [code]);
    return src ? <img src={src} alt="Attendance QR" className="w-64 h-64 border-4 border-white shadow-lg rounded-lg" /> : <p>Loading QR...</p>;
}
