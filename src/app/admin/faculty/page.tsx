"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function FacultyPage() {
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/faculty")
            .then((res) => res.json())
            .then((data) => {
                setFaculty(data.faculty || []);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Faculty</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Faculty List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Designation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {faculty.map((fac) => (
                                <TableRow key={fac.id}>
                                    <TableCell>{fac.full_name}</TableCell>
                                    <TableCell>{fac.email}</TableCell>
                                    <TableCell>{fac.designation}</TableCell>
                                </TableRow>
                            ))}
                            {faculty.length === 0 && !loading && <TableRow><TableCell colSpan={3} className="text-center">No faculty found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
