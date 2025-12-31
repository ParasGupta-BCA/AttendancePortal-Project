"use client";

import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Video, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today

    const [subjects, setSubjects] = useState<string[]>([]);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/student/attendance");
            const data = await res.json();
            const hist = data.history || [];

            setHistory(hist);

            // Extract unique subjects
            const uniqueSubjects = Array.from(new Set(hist.map((r: any) => r.subject_name))) as string[];
            setSubjects(uniqueSubjects);

            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData(); // Initial load

        const interval = setInterval(() => {
            fetchData();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Filter Logic
    const filteredRecords = history.filter(r => {
        const recordDate = new Date(r.session_date);
        const isSameDate = recordDate.getDate() === selectedDate.getDate() &&
            recordDate.getMonth() === selectedDate.getMonth() &&
            recordDate.getFullYear() === selectedDate.getFullYear();

        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesSubject = subjectFilter === "all" || r.subject_name === subjectFilter;

        return isSameDate && matchesStatus && matchesSubject;
    });

    // Calendar Generation (Rolling window of 14 days)
    const generateCalendarDates = () => {
        const dates = [];
        // Show previous 10 days and next 3 days
        for (let i = -10; i <= 3; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    // Sort records by time
    filteredRecords.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    if (loading) return <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
    </div>;

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h2 className="text-2xl font-bold">History</h2>
                    <p className="text-muted-foreground">{filteredRecords.length} Lectures for {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                </div>

                {/* Secondary Filters (Dropdowns) */}
                <div className="flex gap-2">
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[120px] h-9 text-xs">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[90px] h-9 text-xs">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Calendar Strip - Horizontal Scroll */}
            <div className="flex items-center overflow-x-auto pb-4 gap-2 no-scrollbar snap-x touch-pan-x" style={{ scrollbarWidth: 'none' }}>
                {generateCalendarDates().map((date, i) => {
                    const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-2xl transition-all duration-200 snap-center shrink-0",
                                isSelected ? "bg-blue-600 text-white scale-105 shadow-md" : "bg-white border hover:bg-accent text-muted-foreground",
                                isToday && !isSelected && "border-blue-400 text-blue-500"
                            )}
                        >
                            <span className="text-[10px] font-bold tracking-wider opacity-80">{days[date.getDay()]}</span>
                            <span className="text-xl font-bold mt-1">{date.getDate()}</span>
                            {isToday && !isSelected && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>}
                        </button>
                    )
                })}
            </div>

            {/* Timeline Cards */}
            <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-accent/20 rounded-3xl border-dashed border-2">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>No classes found for this date.</p>
                        <button onClick={() => setSelectedDate(new Date())} className="text-blue-500 text-sm mt-2 hover:underline">Go to Today</button>
                    </div>
                ) : (
                    filteredRecords.map((record: any) => {
                        const start = record.start_time ? new Date(record.start_time) : new Date(record.session_date);
                        // Fallback duration if end_time missing
                        const end = record.end_time ? new Date(record.end_time) : new Date(start.getTime() + 60 * 60000);
                        const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

                        const isPresent = record.status === 'Present';

                        return (
                            <div key={record.id} className={cn(
                                "relative overflow-hidden rounded-[2rem] p-6 transition-all hover:shadow-md border",
                                isPresent ? "bg-[#EFFCF4] border-[#E0F5E6]" : "bg-[#FEF2F2] border-[#FEE2E2]"
                            )}>
                                {/* Status Icon Top Right */}
                                <div className={cn(
                                    "absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full",
                                    isPresent ? "bg-white text-green-600 shadow-sm" : "bg-white text-red-600 shadow-sm"
                                )}>
                                    {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    <span>{record.status}</span>
                                </div>

                                {/* Time & Duration */}
                                <div className="flex items-center gap-3 text-sm font-medium opacity-80 mb-3">
                                    <Clock className="w-4 h-4 opacity-50" />
                                    <span>
                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {' - '}
                                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="w-px h-3 bg-current opacity-30"></span>
                                    <span>{durationMin} Min</span>
                                </div>

                                {/* Subject & Class Info */}
                                <div className="mb-6">
                                    <h3 className={cn("text-lg font-bold mb-1 leading-tight", isPresent ? "text-green-950" : "text-red-950")}>
                                        {record.subject_name}
                                    </h3>
                                    <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Sem 6 (Morning)</p>
                                </div>

                                {/* Footer: Faculty */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isPresent ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700")}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Faculty</p>
                                            <p className="text-sm font-bold opacity-90">{record.faculty_name || "Unknown"}</p>
                                        </div>
                                    </div>

                                    <Video className="w-5 h-5 opacity-30" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
