"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "", email: "", enrollment_no: "", erp_id: "", course_year: "", section: ""
    });

    // Filters
    const [selectedCourse, setSelectedCourse] = useState("All");
    const [selectedSection, setSelectedSection] = useState("All");

    // Meta Data
    const [courses, setCourses] = useState<{ id: string, name: string }[]>([]);
    const [sections, setSections] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        // Fetch Meta Data
        fetch('/api/meta')
            .then(res => res.json())
            .then(data => {
                setCourses(data.courses || []);
                setSections(data.sections || []);
            });
    }, []);

    const fetchStudents = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCourse && selectedCourse !== "All") params.append("course", selectedCourse);
        if (selectedSection && selectedSection !== "All") params.append("section", selectedSection);

        fetch(`/api/admin/students?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setStudents(data.students);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, [selectedCourse, selectedSection]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/admin/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        setOpen(false);
        fetchStudents();
        setFormData({ full_name: "", email: "", enrollment_no: "", erp_id: "", course_year: "", section: "" });
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input placeholder="Full Name" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                            <Input placeholder="Email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <Input placeholder="Enrollment No" required value={formData.enrollment_no} onChange={e => setFormData({ ...formData, enrollment_no: e.target.value })} />
                            <Input placeholder="ERP ID" required value={formData.erp_id} onChange={e => setFormData({ ...formData, erp_id: e.target.value })} />

                            {/* Course Select */}
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.course_year}
                                onChange={e => setFormData({ ...formData, course_year: e.target.value })}
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>

                            {/* Section Select */}
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.section}
                                onChange={e => setFormData({ ...formData, section: e.target.value })}
                                required
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>

                            <Button type="submit" className="w-full">Save</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                >
                    <option value="All">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                >
                    <option value="All">All Sections</option>
                    {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Student List
                        {(selectedCourse !== "All" || selectedSection !== "All") &&
                            ` (${selectedCourse !== "All" ? selectedCourse : ''} ${selectedSection !== "All" ? '- ' + selectedSection : ''})`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Enrollment</TableHead>
                                <TableHead>ERP ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Section</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.enrollment_no}</TableCell>
                                    <TableCell>{student.erp_id}</TableCell>
                                    <TableCell>{student.full_name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{student.course_year}</TableCell>
                                    <TableCell>{student.section}</TableCell>
                                </TableRow>
                            ))}
                            {students.length === 0 && !loading && <TableRow><TableCell colSpan={6} className="text-center">No students found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
