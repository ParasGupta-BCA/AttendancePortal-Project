"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/overview";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, Activity } from "lucide-react";
import { RadarAnalytics } from "@/components/admin/RadarAnalytics";

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
                <div className="flex items-center space-x-2">
                    <SettingsDialog />
                </div>
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
                <div className="col-span-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview data={chartData || []} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="font-medium">Data Structures</div>
                                        <div className="text-muted-foreground">85%</div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[85%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="font-medium">Web Technologies</div>
                                        <div className="text-muted-foreground">92%</div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[92%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="font-medium">Operating Systems</div>
                                        <div className="text-muted-foreground">78%</div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 w-[78%]"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

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

                    <RadarAnalytics />
                </div>
            </div>
        </div >
    );
}

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings as SettingsIcon, MapPin } from "lucide-react";
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

function SettingsDialog() {
    const [settings, setSettings] = useState({ campus_lat: '', campus_long: '', allowed_radius_meters: '' });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetch("/api/admin/settings").then(r => r.json()).then(setSettings);
        }
    }, [open]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert("Settings Saved!");
            else alert("Failed to save");
        } catch (e) {
            alert("Error saving settings");
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setSettings(prev => ({
                    ...prev,
                    campus_lat: pos.coords.latitude.toString(),
                    campus_long: pos.coords.longitude.toString()
                }));
            });
        } else {
            alert("Geolocation not supported");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Configure Location
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attendance Settings</DialogTitle>
                    <DialogDescription>Set the campus location and allowed radius for scanning.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input value={settings.campus_lat} onChange={e => setSettings({ ...settings, campus_lat: e.target.value })} placeholder="28.1234" />
                        </div>
                        <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input value={settings.campus_long} onChange={e => setSettings({ ...settings, campus_long: e.target.value })} placeholder="77.1234" />
                        </div>
                    </div>
                    <Button type="button" variant="secondary" size="sm" className="w-full" onClick={getCurrentLocation}>
                        <MapPin className="w-4 h-4 mr-2" /> Use Current Location
                    </Button>
                    <div className="space-y-2">
                        <Label>Allowed Radius (meters)</Label>
                        <Input value={settings.allowed_radius_meters} onChange={e => setSettings({ ...settings, allowed_radius_meters: e.target.value })} placeholder="100" />
                    </div>
                    <Button className="w-full" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Configuration"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

