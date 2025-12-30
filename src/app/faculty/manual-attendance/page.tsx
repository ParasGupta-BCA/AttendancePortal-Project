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

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold">Manual Attendance</h1>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Class Session</CardTitle>
                    <CardDescription>Choose the class details to mark attendance.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Class & Section</label>
                        <Select onValueChange={setSelectedClassRaw} value={selectedClassRaw}>
                            <SelectTrigger>
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
                        <label className="text-sm font-medium">Subject</label>
                        <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                            <SelectTrigger>
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
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Student List */}
            {selectedClassRaw && selectedSubject && students.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Students ({filteredStudents.length})</CardTitle>
                            <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => markAll('Present')}>Mark All Present</Button>
                                <Button size="sm" variant="outline" onClick={() => markAll('Absent')}>Mark All Absent</Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search student..."
                                className="w-[200px]"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading records...</div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredStudents.map((student) => {
                                    const isPresent = attendanceMap[student.id] === 'Present';
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`
                                                cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all
                                                ${isPresent
                                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                                    ${isPresent ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}
                                                `}>
                                                    {student.full_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{student.full_name}</p>
                                                    <p className="text-xs text-gray-500">{student.enrollment_no}</p>
                                                </div>
                                            </div>
                                            <div>
                                                {isPresent ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-300" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end sticky bottom-4 bg-white/90 p-4 border-t backdrop-blur-sm rounded-lg shadow-lg">
                            <Button size="lg" onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Attendance Record'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedClassRaw && selectedSubject && students.length === 0 && !loading && (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500">No students found for this class or no timetable session matches this criteria.</p>
                </div>
            )}
        </div>
    );
}
