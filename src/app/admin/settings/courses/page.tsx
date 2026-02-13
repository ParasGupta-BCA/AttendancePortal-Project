
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface Course {
    id: string;
    name: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [newCourse, setNewCourse] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleAdd = async () => {
        if (!newCourse.trim()) return;
        setAdding(true);
        setError("");

        try {
            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCourse }),
            });

            if (res.ok) {
                setNewCourse("");
                fetchCourses();
            } else {
                const data = await res.json();
                setError(data.message || "Failed to add course");
            }
        } catch (error) {
            setError("Failed to add course");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This value might be used by existing students.")) return;
        try {
            const res = await fetch(`/api/admin/courses?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchCourses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-muted-foreground">Manage the list of available courses for student registration.</p>

            <div className="flex items-start gap-6">
                {/* Add New Course */}
                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Add New Course</CardTitle>
                        <CardDescription>e.g., 'BCA VII', 'MCA I'</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Course Name"
                                value={newCourse}
                                onChange={(e) => setNewCourse(e.target.value)}
                            />
                            <Button onClick={handleAdd} disabled={adding || !newCourse.trim()}>
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                </Card>

                {/* List Courses */}
                <Card className="w-2/3">
                    <CardHeader>
                        <CardTitle>Existing Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((course, index) => (
                                        <TableRow key={course.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(course.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {courses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No courses found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
