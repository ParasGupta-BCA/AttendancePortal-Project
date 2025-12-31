"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    // Derived lists
    const [subjects, setSubjects] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/student/attendance")
            .then((res) => res.json())
            .then((data) => {
                const hist = data.history || [];
                setHistory(hist);
                setFilteredHistory(hist);

                // Extract unique subjects
                const uniqueSubjects = Array.from(new Set(hist.map((r: any) => r.subject_name))) as string[];
                setSubjects(uniqueSubjects);

                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        let res = history;

        if (statusFilter !== "all") {
            res = res.filter(r => r.status === statusFilter);
        }

        if (subjectFilter !== "all") {
            res = res.filter(r => r.subject_name === subjectFilter);
        }

        if (dateFilter) {
            // Compare YYYY-MM-DD
            res = res.filter(r => {
                const recordDate = new Date(r.session_date).toISOString().split('T')[0];
                return recordDate === dateFilter;
            });
        }

        setFilteredHistory(res);
    }, [history, statusFilter, subjectFilter, dateFilter]);

    const resetFilters = () => {
        setStatusFilter("all");
        setSubjectFilter("all");
        setDateFilter("");
    };

    if (loading) return <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>;

    const presentCount = filteredHistory.filter(r => r.status === 'Present').length;
    const absentCount = filteredHistory.filter(r => r.status === 'Absent').length;

    return (
        <div className="space-y-4 pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">Attendance History</h2>

                {/* Stats Summary for the current view */}
                <div className="flex gap-4 text-sm bg-white/5 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Present: <strong>{presentCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Absent: <strong>{absentCount}</strong></span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-lg border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filters
                    </h3>
                    {(statusFilter !== "all" || subjectFilter !== "all" || dateFilter) && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <X className="w-4 h-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Subject Filter */}
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date Filter */}
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-background"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-accent/20 rounded-xl border-dashed border-2">
                        <p>No records found matching your filters.</p>
                        <Button variant="link" onClick={resetFilters}>Clear Filters</Button>
                    </div>
                ) : (
                    filteredHistory.map((record: any, i: number) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-sm sm:text-base">{record.subject_name}</h3>
                                    <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:gap-4">
                                        <span>{new Date(record.session_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        <span>{new Date(record.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <Badge className="ml-2" variant={record.status === 'Present' ? 'default' : 'destructive'}>
                                    {record.status}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
