"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/subjects")
            .then((res) => res.json())
            .then((data) => {
                setSubjects(data.subjects || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Subject List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Credits</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>{sub.code}</TableCell>
                                    <TableCell>{sub.name}</TableCell>
                                    <TableCell>{sub.credits}</TableCell>
                                </TableRow>
                            ))}
                            {subjects.length === 0 && !loading && <TableRow><TableCell colSpan={3} className="text-center">No subjects found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
