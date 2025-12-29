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
        full_name: "", email: "", enrollment_no: "", erp_id: ""
    });

    const fetchStudents = () => {
        fetch("/api/admin/students")
            .then((res) => res.json())
            .then((data) => {
                setStudents(data.students);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch("/api/admin/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        setOpen(false);
        fetchStudents();
        setFormData({ full_name: "", email: "", enrollment_no: "", erp_id: "" });
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
                            <Button type="submit" className="w-full">Save</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student List (BCA VI - Morning)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Enrollment</TableHead>
                                <TableHead>ERP ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.enrollment_no}</TableCell>
                                    <TableCell>{student.erp_id}</TableCell>
                                    <TableCell>{student.full_name}</TableCell>
                                    <TableCell>{student.email}</TableCell>
                                </TableRow>
                            ))}
                            {students.length === 0 && !loading && <TableRow><TableCell colSpan={4} className="text-center">No students found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
