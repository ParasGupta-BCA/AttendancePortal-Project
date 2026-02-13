
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface Section {
    id: string;
    name: string;
}

export default function SectionsPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [newSection, setNewSection] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const fetchSections = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/sections");
            if (res.ok) {
                const data = await res.json();
                setSections(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleAdd = async () => {
        if (!newSection.trim()) return;
        setAdding(true);
        setError("");

        try {
            const res = await fetch("/api/admin/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSection }),
            });

            if (res.ok) {
                setNewSection("");
                fetchSections();
            } else {
                const data = await res.json();
                setError(data.message || "Failed to add section");
            }
        } catch (error) {
            setError("Failed to add section");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This value might be used by existing students.")) return;
        try {
            const res = await fetch(`/api/admin/sections?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchSections();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Section Management</h1>
            <p className="text-muted-foreground">Manage the list of available sections (e.g., Morning, Evening).</p>

            <div className="flex items-start gap-6">
                {/* Add New Section */}
                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Add New Section</CardTitle>
                        <CardDescription>e.g., 'Night Shift'</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Section Name"
                                value={newSection}
                                onChange={(e) => setNewSection(e.target.value)}
                            />
                            <Button onClick={handleAdd} disabled={adding || !newSection.trim()}>
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                </Card>

                {/* List Sections */}
                <Card className="w-2/3">
                    <CardHeader>
                        <CardTitle>Existing Sections</CardTitle>
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
                                    {sections.map((section, index) => (
                                        <TableRow key={section.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{section.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(section.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sections.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No sections found</TableCell>
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
