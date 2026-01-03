"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <Card className="col-span-full bg-white shadow-sm border border-gray-200 rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 px-8 pt-6">
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-800">
                    <div className="p-2 bg-green-50 rounded-full">
                        <Signal className="w-5 h-5 text-green-600" />
                    </div>
                    Real-time Geolocation Radar
                </CardTitle>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-green-700">Live Monitoring</span>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">

                    {/* RADAR VISUALIZATION (Curved Edges & Green) */}
                    <div className="relative flex items-center justify-center bg-gray-50/80 border border-gray-100 rounded-[2rem] overflow-hidden shadow-inner">
                        {/* Radar Grid */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-gray-200 bg-white shadow-sm">
                            <div className="absolute inset-0 rounded-full border border-gray-100 scale-75"></div>
                            <div className="absolute inset-0 rounded-full border border-gray-100 scale-50"></div>
                            <div className="absolute inset-0 rounded-full border border-gray-100 scale-25"></div>

                            {/* Crosshairs */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-100"></div>
                            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-100"></div>

                            {/* Rotating Sweep (Green) */}
                            <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] origin-center bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(34,197,94,0.15)_360deg)]"></div>

                            {/* Campus Center */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-md z-10"></div>

                            {/* Blips */}
                            {radarBlips.map((blip) => (
                                <div
                                    key={blip.id}
                                    className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full shadow-sm transition-all duration-1000 group cursor-pointer z-20 border border-white ring-1 ring-black/5"
                                    style={{
                                        top: `${50 - Math.sin(blip.angle) * blip.r}%`,
                                        left: `${50 + Math.cos(blip.angle) * blip.r}%`,
                                        backgroundColor: blip.scan_status === 'SUCCESS' ? '#22c55e' : '#ef4444'
                                    }}
                                >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0 z-30 shadow-xl">
                                        {blip.student_name}
                                        <span className="opacity-75 block text-[10px] font-normal">{Math.round(blip.distance_meters)}m away</span>
                                    </div>

                                    {/* Ping animation */}
                                    <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${blip.scan_status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                            ))}
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-4 left-6 py-1.5 px-3 rounded-xl bg-white/90 backdrop-blur border border-gray-100 text-xs font-semibold text-gray-500 shadow-sm flex gap-3">
                            <span>Radius: <span className="text-gray-900">{radiusSettings}m</span></span>
                            <span className="w-px h-3 bg-gray-200"></span>
                            <span>Active: <span className="text-gray-900">{radarBlips.length}</span></span>
                        </div>
                    </div>

                    {/* LOGS LIST (Curved Edges) */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 h-full flex flex-col shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/20 to-transparent"></div>

                        <h4 className="text-gray-400 mb-6 text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                            Recent Signal Log
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">Real-time</span>
                        </h4>

                        <ScrollArea className="flex-1 -mr-4 pr-4">
                            <div className="space-y-3">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full ${log.scan_status === 'SUCCESS' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                                            <div>
                                                <div className="text-gray-900 font-semibold text-sm">{log.student_name || 'Unknown Student'}</div>
                                                <div className="text-gray-500 text-[11px] font-medium flex items-center gap-1.5">
                                                    <span>{log.enrollment_no}</span>
                                                    <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                                                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <Badge variant="outline" className={`h-6 text-[10px] font-bold border-0 ${log.scan_status === 'SUCCESS'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {log.scan_status === 'SUCCESS' ? 'VERIFIED' : 'FAILED'}
                                            </Badge>
                                            <div className="text-gray-400 text-[10px] font-medium mt-1">
                                                {Math.round(log.distance_meters)}m away
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                                        <Signal className="w-8 h-8 opacity-20" />
                                        <span className="text-sm font-medium">Scanning for signals...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
