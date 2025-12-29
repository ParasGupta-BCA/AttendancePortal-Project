"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data or fetch from API
export default function StudentDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, fetch /api/student/stats
        // Mocking for MVP demo
        setTimeout(() => {
            setStats({
                attendance: 85,
                present: 42,
                absent: 8,
                totalClasses: 50
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>;

    return (
        <div className="space-y-6">
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-1">Welcome back!</h2>
                <p className="opacity-90 text-sm">BCA VI (Morning)</p>

                <div className="mt-6 flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold">{stats.attendance}%</p>
                        <p className="text-xs opacity-75">Attendance Rate</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                        <span className="text-2xl font-bold">{stats.present}</span>
                        <span className="text-xs text-muted-foreground">Present</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <XCircle className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-2xl font-bold">{stats.absent}</span>
                        <span className="text-xs text-muted-foreground">Absent</span>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Today's Classes</h3>
                <Card className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">Web Programming</h4>
                            <p className="text-xs text-gray-500">10:10 AM - 11:05 AM</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-gray-300 opacity-60">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">Digital Marketing</h4>
                            <p className="text-xs text-gray-500">11:20 AM - 12:15 PM</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Upcoming</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
