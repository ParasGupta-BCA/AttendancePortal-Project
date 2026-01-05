"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/student/dashboard", { cache: 'no-store' });
            const json = await res.json();
            if (res.ok) {
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 5 seconds for real-time updates
        const interval = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (loading && !data) return (
        <div className="space-y-6 p-4">
            {/* Welcome Card Skeleton */}
            <Skeleton className="h-48 w-full rounded-2xl" />
            
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            {/* Today's Classes Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-40 rounded-md" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    );

    if (!data) return <div className="p-4">Failed to load data. <Button onClick={fetchData}>Retry</Button></div>;

    const { stats, todayClasses, studentDetails } = data;

    return (
        <div className="space-y-6">
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Welcome!</h2>
                        <p className="opacity-90 text-sm">{studentDetails.course} ({studentDetails.section})</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 transition-colors"
                        onClick={() => fetchData()}
                        disabled={loading}
                    >
                        <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </Button>
                </div>

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
                {todayClasses.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No classes scheduled for today.</p>
                ) : (
                    todayClasses.map((cls: any) => (
                        <Card key={cls.id} className={`p-4 border-l-4 ${cls.status === 'Present'
                            ? 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10'
                            : cls.status === 'Absent'
                                ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
                                : cls.isActive
                                    ? 'border-l-blue-500 shadow-md animate-pulse dark:bg-blue-900/10'
                                    : 'border-l-gray-300 dark:border-l-gray-600 dark:bg-gray-800/50'
                            }`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">{cls.subject_name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{cls.start_time} - {cls.end_time}</p>
                                </div>
                                {cls.status === 'Present' ? (
                                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                                        <CheckCircle2 className="w-3 h-3" /> Present
                                    </span>
                                ) : cls.status === 'Absent' ? (
                                    <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                                        <XCircle className="w-3 h-3" /> Absent
                                    </span>
                                ) : cls.isActive ? (
                                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-1 rounded-full animate-pulse">Active Now</span>
                                ) : (
                                    <span className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">Scheduled</span>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
