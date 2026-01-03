"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Target } from "lucide-react";

export function RadarAnalytics() {
    const [logs, setLogs] = useState<any[]>([]);
    const [radiusSettings, setRadiusSettings] = useState(200); // Default, should fetch

    // Fetch logs & settings
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
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
        const interval = setInterval(fetchData, 3000); // Fast update for real-time feel
        return () => clearInterval(interval);
    }, []);

    // Filter for very recent logs (e.g. last 5 mins) to show on radar to avoid clutter? 
    // Or just show the last 20 regardless of time, but fade them out?
    // Let's show the latest 15 logs on the radar.
    const radarBlips = logs.slice(0, 15).map((log, i) => {
        // Generate a stable random angle based on ID so it doesn't jump around on refresh
        // Simple hash of last char
        const idChar = log.id ? log.id.charCodeAt(log.id.length - 1) : Math.random() * 100;
        const randomAngle = (idChar % 360) * (Math.PI / 180);

        // Calculate distance relative to max radius (cap at 100% + bit)
        const rawDist = log.distance_meters || 0;
        const normalizedDist = Math.min((rawDist / radiusSettings) * 45, 48); // Stick to 48% radius max if inside

        // If out of range, put it on the edge or slightly outside
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
        <Card className="col-span-full border-green-900/20 bg-black text-green-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <CardHeader className="flex flex-row items-center justify-between z-10 relative border-b border-green-900/30 bg-black/50 backdrop-blur">
                <CardTitle className="tracking-widest uppercase text-xs font-bold text-green-400 flex items-center gap-2">
                    <Target className="w-4 h-4 animate-pulse" />
                    Live Geolocation Radar
                </CardTitle>
                <Badge variant="outline" className="border-green-500 text-green-400 animate-pulse bg-green-900/20">
                    Online
                </Badge>
            </CardHeader>

            <CardContent className="p-0 z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">

                    {/* RADAR VISUALIZATION */}
                    <div className="relative flex items-center justify-center bg-black overflow-hidden border-r border-green-900/30">
                        {/* Radar Grid */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-green-800/40 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                            <div className="absolute inset-0 rounded-full border border-green-900/30 scale-75"></div>
                            <div className="absolute inset-0 rounded-full border border-green-900/30 scale-50"></div>
                            <div className="absolute inset-0 rounded-full border border-green-900/30 scale-25"></div>

                            {/* Crosshairs */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-900/50"></div>
                            <div className="absolute left-0 right-0 top-1/2 h-px bg-green-900/50"></div>

                            {/* Rotating Sweep */}
                            <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] origin-center bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(34,197,94,0.3)_360deg)]"></div>

                            {/* Campus Center */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>

                            {/* Blips */}
                            {radarBlips.map((blip) => (
                                <div
                                    key={blip.id}
                                    className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full shadow-[0_0_5px_currentColor] transition-all duration-1000 group hover:scale-150 cursor-pointer z-20"
                                    style={{
                                        top: `${50 - Math.sin(blip.angle) * blip.r}%`,
                                        left: `${50 + Math.cos(blip.angle) * blip.r}%`,
                                        color: blip.scan_status === 'SUCCESS' ? '#4ade80' : '#ef4444',
                                        backgroundColor: blip.scan_status === 'SUCCESS' ? '#4ade80' : '#ef4444'
                                    }}
                                    title={`${blip.student_name}: ${Math.round(blip.distance_meters)}m`}
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 bg-black/80 text-white px-1 py-0.5 rounded border border-green-900/50 pointer-events-none">
                                        {blip.student_name}
                                    </span>
                                    {/* Pulse effect for recent blips */}
                                    <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-current"></div>
                                </div>
                            ))}
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-4 left-4 text-xs font-mono text-green-700">
                            RADIUS: {radiusSettings}M <br />
                            OBJECTS: {radarBlips.length}
                        </div>
                    </div>

                    {/* LOGS LIST */}
                    <div className="bg-black/80 p-4 border-l border-green-900/30 font-mono text-sm h-full flex flex-col">
                        <h4 className="text-green-600 mb-4 text-xs font-bold uppercase tracking-wider flex justify-between">
                            <span>Signal Log</span>
                            <span className="animate-pulse">REC</span>
                        </h4>
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-3">
                                {logs.map((log) => (
                                    <div key={log.id} className="grid grid-cols-[1fr_auto] gap-2 p-2 rounded border border-green-900/20 hover:bg-green-900/10 transition-colors">
                                        <div>
                                            <div className="text-green-400 font-bold truncate">{log.student_name || 'Unknown Signal'}</div>
                                            <div className="text-green-800 text-xs">{log.enrollment_no}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-bold ${log.scan_status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>
                                                [{log.scan_status}]
                                            </div>
                                            <div className="text-green-800 text-xs font-mono">
                                                {Math.round(log.distance_meters)}m
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <div className="text-green-900 text-center italic mt-10">Scanning for signals...</div>}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
