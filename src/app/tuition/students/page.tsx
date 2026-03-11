"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: "", email: "", enrollment_no: "", erp_id: "", course_year: "", section: ""
    });

    // Filters derived from loaded students
    const [selectedCourse, setSelectedCourse] = useState("All");
    const [selectedSection, setSelectedSection] = useState("All");

    const fetchStudents = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCourse && selectedCourse !== "All") params.append("course", selectedCourse);
        if (selectedSection && selectedSection !== "All") params.append("section", selectedSection);

        fetch(`/api/tuition/students?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setStudents(data.students || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Fetch all students once to derive filter options
    const [allStudents, setAllStudents] = useState<any[]>([]);
    useEffect(() => {
        fetch('/api/tuition/students')
            .then(res => res.json())
            .then(data => setAllStudents(data.students || []));
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [selectedCourse, selectedSection]);

    // Derive unique courses and sections from all students
    const uniqueCourses = Array.from(new Set(allStudents.map(s => s.course_year).filter(Boolean)));
    const uniqueSections = Array.from(new Set(allStudents.map(s => s.section).filter(Boolean)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/tuition/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error || "Failed to add student");
            } else {
                setOpen(false);
                setFormData({ full_name: "", email: "", enrollment_no: "", erp_id: "", course_year: "", section: "" });
                fetchStudents();
                // Refresh all students for filter options
                fetch('/api/tuition/students').then(r => r.json()).then(d => setAllStudents(d.students || []));
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = students;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(null); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-3 py-2">
                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                                    {error}
                                </div>
                            )}
                            <Input placeholder="Full Name *" required value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                            <Input placeholder="Email *" type="email" required value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <Input placeholder="Enrollment No" value={formData.enrollment_no}
                                onChange={e => setFormData({ ...formData, enrollment_no: e.target.value })} />
                            <Input placeholder="ERP ID" value={formData.erp_id}
                                onChange={e => setFormData({ ...formData, erp_id: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Course Year *" required value={formData.course_year}
                                    onChange={e => setFormData({ ...formData, course_year: e.target.value })} />
                                <Input placeholder="Section *" required value={formData.section}
                                    onChange={e => setFormData({ ...formData, section: e.target.value })} />
                            </div>
                            <p className="text-xs text-muted-foreground">Default password: <strong>student</strong></p>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Student"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters - derived from loaded data */}
            <div className="flex gap-3">
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                >
                    <option value="All">All Courses</option>
                    {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                >
                    <option value="All">All Sections</option>
                    {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Student List
                        {(selectedCourse !== "All" || selectedSection !== "All") &&
                            ` — ${selectedCourse !== "All" ? selectedCourse : ""}${selectedSection !== "All" ? " / " + selectedSection : ""}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Enrollment No</TableHead>
                                    <TableHead>ERP ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Section</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.enrollment_no || "—"}</TableCell>
                                        <TableCell>{student.erp_id || "—"}</TableCell>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.course_year}</TableCell>
                                        <TableCell>{student.section}</TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
