"use client";

import { useEffect, useState, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Video, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Filter, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Extracted Components to prevent re-renders ---

const SessionCard = memo(({ record, index }: { record: any, index: number }) => {
    const start = record.start_time ? new Date(record.start_time) : new Date(record.session_date);
    const end = record.end_time ? new Date(record.end_time) : new Date(start.getTime() + 60 * 60000);
    const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
    const isPresent = record.status === 'Present';
    const sessionDate = new Date(record.session_date);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[2rem] p-4 sm:p-6 transition-all hover:shadow-md border animate-in fade-in slide-in-from-bottom-4 duration-500",
                isPresent
                    ? "bg-[#EFFCF4] border-[#E0F5E6] dark:bg-green-950/20 dark:border-green-900/50"
                    : "bg-[#FEF2F2] border-[#FEE2E2] dark:bg-red-950/20 dark:border-red-900/50"
            )}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
            <div className="flex justify-between items-start mb-3 gap-2">
                {/* Time & Duration */}
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium opacity-80 dark:text-gray-300">
                    <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                        <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-xs">{sessionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 opacity-50" />
                        <span>
                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <span className="hidden sm:inline w-px h-3 bg-current opacity-30"></span>
                    <span className="text-xs opacity-60">({durationMin} Min)</span>
                </div>

                {/* Status Icon */}
                <div className={cn(
                    "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0",
                    isPresent
                        ? "bg-white text-green-600 shadow-sm dark:bg-green-900/40 dark:text-green-300"
                        : "bg-white text-red-600 shadow-sm dark:bg-red-900/40 dark:text-red-300"
                )}>
                    {isPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{record.status}</span>
                </div>
            </div>

            {/* Subject & Class Info */}
            <div className="mb-6">
                <h3 className={cn("text-lg font-bold mb-1 leading-tight",
                    isPresent ? "text-green-950 dark:text-green-100" : "text-red-950 dark:text-red-100"
                )}>
                    {record.subject_name}
                </h3>
                <p className="text-xs font-semibold opacity-60 uppercase tracking-wider dark:text-gray-400">Sem 6 (Morning)</p>
            </div>

            {/* Footer: Faculty */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                        isPresent
                            ? "bg-green-200 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    )}>
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold dark:text-gray-500">Faculty</p>
                        <p className="text-sm font-bold opacity-90 dark:text-gray-200">{record.faculty_name || "Unknown"}</p>
                    </div>
                </div>

                <Video className="w-5 h-5 opacity-30 dark:opacity-50 dark:text-gray-400" />
            </div>
        </div>
    )
});
SessionCard.displayName = "SessionCard";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today

    const [subjects, setSubjects] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' or 'list'

    const fetchData = async () => {
        try {
            const res = await fetch("/api/student/attendance");
            const data = await res.json();
            const hist = data.history || [];

            // Perform deep comparison before calling any state setters
            const isSameHistory = JSON.stringify(history) === JSON.stringify(hist);

            if (!isSameHistory) {
                setHistory(hist);

                // Extract unique subjects only if data changed
                const uniqueSubjects = Array.from(new Set(hist.map((r: any) => r.subject_name))) as string[];
                setSubjects(uniqueSubjects);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData(); // Initial load

        const interval = setInterval(() => {
            fetchData();
        }, 5000); // Poll every 5 seconds (Silent update)

        return () => clearInterval(interval);
    }, []);

    // --- Filter Logic ---

    // 1. Base Filter (Subject & Status) - Shared by both views
    const baseFilteredHistory = history.filter(r => {
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesSubject = subjectFilter === "all" || r.subject_name === subjectFilter;
        return matchesStatus && matchesSubject;
    });

    // 2. Calendar View Filter (Specific Date)
    const calendarViewRecords = baseFilteredHistory.filter(r => {
        const recordDate = new Date(r.session_date);
        return recordDate.getDate() === selectedDate.getDate() &&
            recordDate.getMonth() === selectedDate.getMonth() &&
            recordDate.getFullYear() === selectedDate.getFullYear();
    });

    // Sort Calendar records by time
    calendarViewRecords.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    // 3. List View Grouping (Group by Month/Year)
    // Sort all records by date descending first
    const listViewRecords = [...baseFilteredHistory].sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

    // Grouping by Month Year
    const groupedHistory = listViewRecords.reduce((groups: any, record: any) => {
        const date = new Date(record.session_date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) {
            groups[monthYear] = [];
        }
        groups[monthYear].push(record);
        return groups;
    }, {});


    // Auto-scroll to selected date on mount/change (only relevant for calendar view)
    useEffect(() => {
        if (activeTab === 'calendar') {
            const el = document.getElementById("selected-date");
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        }
    }, [selectedDate, activeTab]);

    // Calendar Generation (Rolling window)
    const generateCalendarDates = () => {
        const dates = [];
        for (let i = -10; i <= 3; i++) { // Show previous 10 days and next 3 days
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    if (loading) return (
        <div className="space-y-6 pt-6">
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-[2rem]" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 pb-20">
            {/* Header Area with Tabs */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end px-1">
                    <div>
                        <h2 className="text-2xl font-bold">History</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {activeTab === 'calendar'
                                ? `${calendarViewRecords.length} Lectures on ${selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
                                : `Total ${listViewRecords.length} Sessions`
                            }
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* Compact Filters */}
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                            <SelectTrigger className="w-[120px] h-8 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 border-none shadow-none px-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-0">
                                <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent align="end" className="max-h-[250px] w-[240px]">
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[70px] h-8 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 border-none shadow-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:ring-0">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent align="end" className="max-h-[250px]">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="Present">Present</SelectItem>
                                <SelectItem value="Absent">Absent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Custom Pill Tabs */}
                <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full h-12 rounded-full p-1 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                        <TabsTrigger
                            value="calendar"
                            className="w-1/2 rounded-full h-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-gray-500 font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Calendar</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="list"
                            className="w-1/2 rounded-full h-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-gray-500 font-medium"
                        >
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4" />
                                <span>Session List</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    {/* --- CALENDAR VIEW CONTENT --- */}
                    <TabsContent value="calendar" className="mt-6 space-y-6 focus-visible:ring-0 focus-visible:outline-none">

                        {/* Calendar Strip */}
                        <div className="flex items-center overflow-x-auto pb-4 gap-2 no-scrollbar snap-x touch-pan-x" style={{ scrollbarWidth: 'none' }}>
                            {generateCalendarDates().map((date, i) => {
                                const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                                const isToday = new Date().toDateString() === date.toDateString();

                                return (
                                    <button
                                        key={i}
                                        id={isSelected ? "selected-date" : ""}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-2xl transition-all duration-200 snap-center shrink-0",
                                            isSelected ? "bg-blue-600 text-white scale-105 shadow-md" : "bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-accent dark:hover:bg-gray-700 text-muted-foreground dark:text-gray-400",
                                            isToday && !isSelected && "border-blue-400 text-blue-500 dark:text-blue-400"
                                        )}
                                    >
                                        <span className="text-[10px] font-bold tracking-wider opacity-80">{days[date.getDay()]}</span>
                                        <span className="text-xl font-bold mt-1">{date.getDate()}</span>
                                        {isToday && !isSelected && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="min-h-[40vh]">
                            {calendarViewRecords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-accent/20 dark:bg-gray-800/50 rounded-3xl border-dashed border-2 dark:border-gray-700">
                                    <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-sm">No classes for this date.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {calendarViewRecords.map((record, index) => (
                                        <SessionCard key={record.id} record={record} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* --- LIST VIEW CONTENT --- */}
                    <TabsContent value="list" className="mt-6 focus-visible:ring-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300">
                        {listViewRecords.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <List className="w-12 h-12 mb-3 opacity-20" />
                                <p>No attendance history found.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {Object.keys(groupedHistory).map((monthYear) => (
                                    <div key={monthYear} className="space-y-4">
                                        <div className="sticky top-[4.5rem] z-10 flex justify-center pointer-events-none">
                                            <h3 className="text-xs font-bold text-muted-foreground bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border dark:border-gray-700">
                                                {monthYear}
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            {groupedHistory[monthYear].map((record: any, index: number) => (
                                                <SessionCard key={record.id} record={record} index={index} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
