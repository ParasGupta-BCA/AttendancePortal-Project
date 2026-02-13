"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClassItem {
    id: string;
    name: string; // Course
    section: string; // Section
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [courses, setCourses] = useState<{ id: string, name: string }[]>([]);
    const [sections, setSections] = useState<{ id: string, name: string }[]>([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Metadata
        fetch('/api/meta')
            .then(res => res.json())
            .then(data => {
                setCourses(data.courses || []);
                setSections(data.sections || []);
            });

        // Fetch Classes
        const res = await fetch("/api/admin/classes");
        const data = await res.json();
        if (Array.isArray(data)) {
            setClasses(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async () => {
        if (!selectedCourse || !selectedSection) return;

        const res = await fetch("/api/admin/classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ course_year: selectedCourse, section: selectedSection })
        });

        if (res.ok) {
            setSelectedCourse("");
            setSelectedSection("");
            fetchData();
        } else {
            const d = await res.json();
            alert(d.message || "Failed to add class");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might affect Timetables linked to this class.")) return;
        const res = await fetch(`/api/admin/classes?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            fetchData();
        } else {
            alert("Failed to delete");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
                    <p className="text-muted-foreground">Combine Course and Section to create a Class (e.g., BCA VI Morning).</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Class</CardTitle>
                    <CardDescription>Select a Course and a Section to create a valid Class combination.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleAdd} disabled={!selectedCourse || !selectedSection}>
                            <Plus className="mr-2 h-4 w-4" /> Add Class
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Classes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.section}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {classes.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No classes found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
