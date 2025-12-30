"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Save, Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function ManualAttendancePage() {
    // Selection States
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [selectedClassRaw, setSelectedClassRaw] = useState<string>(""); // "Name|Section"
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Data States
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({}); // studentId -> 'Present' | 'Absent'
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Init: Fetch Options
    useEffect(() => {
        const fetchInit = async () => {
            const res = await fetch('/api/faculty/manual-attendance?type=init');
            if (res.ok) {
                const data = await res.json();
                setClasses(data.classes);
                setSubjects(data.subjects);
            }
        };
        fetchInit();
    }, []);

    // 2. Fetch Students when filters change
    useEffect(() => {
        if (selectedClassRaw && selectedSubject && selectedDate) {
            fetchStudents();
        } else {
            setStudents([]);
            setAttendanceMap({});
        }
    }, [selectedClassRaw, selectedSubject, selectedDate]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const [className, section] = selectedClassRaw.split('|');
            const res = await fetch(`/api/faculty/manual-attendance?type=students&class=${className}&section=${section}&subjectId=${selectedSubject}&date=${selectedDate}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students);

                // Initialize local map
                const map: any = {};
                data.students.forEach((s: any) => {
                    map[s.id] = s.status;
                });
                setAttendanceMap(map);
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const markAll = (status: 'Present' | 'Absent') => {
        const map: any = { ...attendanceMap };
        students.forEach(s => {
            // Respect search filter if applied? Optional. 
            // For now, mark all visible or all loaded. Let's mark all loaded.
            map[s.id] = status;
        });
        setAttendanceMap(map);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const [className, section] = selectedClassRaw.split('|');
            const res = await fetch('/api/faculty/manual-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    className,
                    section,
                    subjectId: selectedSubject,
                    date: selectedDate,
                    attendance: attendanceMap
                })
            });

            if (res.ok) {
                alert("Attendance saved successfully!");
                fetchStudents(); // Refresh to be sure
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (error) {
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    // Filter students by search
    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const presentCount = students.filter(s => attendanceMap[s.id] === 'Present').length;
    const absentCount = students.length - presentCount;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Manual Attendance</h2>
            </div>

            {/* Filters */}
            <Card className="border-t-4 border-t-blue-500 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Select Class Session</CardTitle>
                    <CardDescription>Choose the class details to mark attendance.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Class & Section</label>
                        <Select onValueChange={setSelectedClassRaw} value={selectedClassRaw}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls, idx) => (
                                    <SelectItem key={idx} value={`${cls.name}|${cls.section}`}>
                                        {cls.name} ({cls.section})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Subject</label>
                        <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name} ({sub.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Date</label>
                        <Input
                            type="date"
                            className="w-full"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Student List */}
            {selectedClassRaw && selectedSubject && students.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Stats for this session */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{students.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Marked Present</CardTitle>
                                <Check className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Marked Absent</CardTitle>
                                <X className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-lg">
                        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Student List</CardTitle>
                                <CardDescription>Manage attendance for the selected session.</CardDescription>
                            </div>
                            <div className="flex w-full md:w-auto flex-col md:flex-row gap-3">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search student..."
                                        className="pl-9 w-full md:w-[250px]"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => markAll('Present')} className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">All Present</Button>
                                    <Button size="sm" variant="outline" onClick={() => markAll('Absent')} className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">All Absent</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredStudents.map((student) => {
                                        const isPresent = attendanceMap[student.id] === 'Present';
                                        return (
                                            <div
                                                key={student.id}
                                                onClick={() => toggleAttendance(student.id)}
                                                className={`
                                                    group cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                                                    ${isPresent
                                                        ? 'bg-green-50/50 border-green-200 hover:border-green-300 hover:bg-green-100/50 shadow-sm'
                                                        : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm transition-colors
                                                        ${isPresent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}
                                                    `}>
                                                        {student.full_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold text-sm ${isPresent ? 'text-green-900' : 'text-gray-900'}`}>{student.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{student.enrollment_no}</p>
                                                    </div>
                                                </div>
                                                <div className={`
                                                    rounded-full p-1 transition-all
                                                    ${isPresent ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-500'}
                                                `}>
                                                    {isPresent ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-8 flex justify-end sticky bottom-6 z-10">
                                <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-xl w-full md:w-auto min-w-[200px] h-12 text-base bg-primary hover:bg-primary/90 transition-transform active:scale-95">
                                    <Save className="w-5 h-5 mr-2" />
                                    {saving ? 'Saving Records...' : 'Save Attendance'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {selectedClassRaw && selectedSubject && students.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300">
                    <User className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Students Found</h3>
                    <p className="text-gray-500 max-w-sm">There are no students registered for this class section, or the timetable does not match.</p>
                </div>
            )}
        </div>
    );
}
