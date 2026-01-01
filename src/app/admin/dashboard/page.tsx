"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/overview";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, Activity } from "lucide-react";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/stats");
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    }

    const { stats, recentActivity, chartData } = data || {};

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Students
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Enrolled in BCA VI
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Present Today
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Distinct students present
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.absentToday || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on daily enrollment
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Attendance Rate
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.monthlyRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Average for this month
                        </p>
                    </CardContent>
                </Card>
            </div>


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={chartData || []} />
                    </CardContent>
                </Card>

                {/* Active Sessions & Recent Activity Column */}
                <div className="col-span-3 space-y-4">
                    {/* Active Sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data?.activeSessions?.length === 0 && <p className="text-sm text-muted-foreground">No active sessions.</p>}
                                {data?.activeSessions?.map((session: any) => (
                                    <div key={session.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{session.subject_name}</p>
                                            <p className="text-xs text-muted-foreground">{session.class_name} ({session.section}) • {session.faculty_name || 'Admin'}</p>
                                        </div>
                                        <ActiveSessionDialog session={session} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {(!recentActivity || recentActivity.length === 0) && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                                {recentActivity?.map((activity: any, i: number) => (
                                    <div key={i} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.enrollment_no}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Marked Present in {activity.subject_code}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {new Date(activity.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode";

function ActiveSessionDialog({ session }: { session: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">View / End</Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center sm:max-w-md">
                <h3 className="text-xl font-bold mb-4">{session.subject_name}</h3>
                <p className="text-sm text-muted-foreground mb-4">Scan to mark attendance</p>

                <QRDisplay code={session.qr_code} />

                <div className="w-full mt-6 border-t pt-4">
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={async () => {
                            if (!confirm("Are you sure? This will END the session and mark remaining students as ABSENT.")) return;

                            try {
                                const res = await fetch("/api/faculty/finalize-attendance", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ sessionId: session.id })
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
                </div>
            </DialogContent>
        </Dialog>
    );
}

function QRDisplay({ code }: { code: string }) {
    const [src, setSrc] = useState("");
    useEffect(() => {
        QRCode.toDataURL(code).then(setSrc);
    }, [code]);
    return src ? <img src={src} alt="Attendance QR" className="w-64 h-64 border-4 border-white shadow-lg rounded-lg" /> : <p>Loading QR...</p>;
}
