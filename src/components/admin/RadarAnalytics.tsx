"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Signal } from "lucide-react";

export function RadarAnalytics() {
    const [logs, setLogs] = useState<any[]>([]);
    const [radiusSettings, setRadiusSettings] = useState(200);

    // Fetch logs & settings
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logsRes, settingsRes] = await Promise.all([
                    fetch("/api/admin/scan-logs"),
                    fetch("/api/admin/settings")
                ]);

                if (logsRes.ok) {
                    const data = await logsRes.json();
                    setLogs(data.logs || []);
                }

                if (settingsRes.ok) {
                    const settings = await settingsRes.json();
                    if (settings.allowed_radius_meters) setRadiusSettings(Number(settings.allowed_radius_meters));
                }

            } catch (e) {
                console.error("Error fetching analytics", e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const radarBlips = logs.slice(0, 15).map((log, i) => {
        const idChar = log.id ? log.id.charCodeAt(log.id.length - 1) : Math.random() * 100;
        const randomAngle = (idChar % 360) * (Math.PI / 180);

        const rawDist = log.distance_meters || 0;
        const normalizedDist = Math.min((rawDist / radiusSettings) * 45, 48);

        const isOutOfRange = rawDist > radiusSettings;
        const finalDist = isOutOfRange ? 48 : normalizedDist;

        return {
            ...log,
            angle: randomAngle,
            r: finalDist,
            isOutOfRange
        };
    });

    return (
        <Card className="col-span-full bg-white shadow-sm border border-gray-200 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                    <Signal className="w-5 h-5 text-green-600" />
                    Real-time Geolocation Radar
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-gray-500">Live Monitoring</span>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">

                    {/* RADAR VISUALIZATION (Standard Layout) */}
                    <div className="relative flex items-center justify-center bg-gray-50/50 border-r border-gray-100">
                        {/* Radar Grid */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-gray-300 bg-white shadow-sm">
                            <div className="absolute inset-0 rounded-full border border-gray-100 scale-75"></div>
                            <div className="absolute inset-0 rounded-full border border-gray-100 scale-50"></div>
                            <div className="absolute inset-0 rounded-full border border-gray-100 scale-25"></div>

                            {/* Crosshairs */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200"></div>
                            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200"></div>

                            {/* Rotating Sweep (Green) */}
                            <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] origin-center bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(34,197,94,0.1)_360deg)]"></div>

                            {/* Campus Center */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-md z-10"></div>

                            {/* Blips */}
                            {radarBlips.map((blip) => (
                                <div
                                    key={blip.id}
                                    className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full shadow-sm transition-all duration-1000 group cursor-pointer z-20 border border-white"
                                    style={{
                                        top: `${50 - Math.sin(blip.angle) * blip.r}%`,
                                        left: `${50 + Math.cos(blip.angle) * blip.r}%`,
                                        backgroundColor: blip.scan_status === 'SUCCESS' ? '#22c55e' : '#ef4444'
                                    }}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-30">
                                        {blip.student_name} ({Math.round(blip.distance_meters)}m)
                                    </div>

                                    {/* Ping animation */}
                                    <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${blip.scan_status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                            ))}
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-4 left-4 text-xs font-medium text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur border border-gray-100">
                            Range: {radiusSettings}m • Active: {radarBlips.length}
                        </div>
                    </div>

                    {/* LOGS LIST */}
                    <div className="bg-white p-4 h-full flex flex-col">
                        <h4 className="text-gray-500 mb-4 text-xs font-bold uppercase tracking-wider">
                            Recent Activity Log
                        </h4>
                        <div className="flex-1 overflow-y-auto pr-2 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-300">
                            <div className="space-y-3">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${log.scan_status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <div className="text-gray-900 font-medium text-sm">{log.student_name || 'Unknown Student'}</div>
                                                <div className="text-gray-500 text-xs flex items-center gap-1">
                                                    <Badge variant="secondary" className="h-5 px-1 text-[10px] font-normal text-gray-400 rounded-sm">
                                                        {log.enrollment_no}
                                                    </Badge>
                                                    <span>•</span>
                                                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`text-xs font-bold ${log.scan_status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                                {log.scan_status === 'SUCCESS' ? 'Verified' : log.scan_status}
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {Math.round(log.distance_meters)}m
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <div className="text-gray-400 text-center py-10 text-sm">No recent scans detected.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
