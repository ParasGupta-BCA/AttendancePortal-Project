"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, BookOpen, Loader2, Search, CheckCircle } from "lucide-react";

interface Subject {
    id: string;
    name: string;
    code: string;
    semester: string | null;
    type: "Theory" | "Practical";
    institution_id: string;
}

const emptyForm = { name: "", code: "", semester: "", type: "Theory" as "Theory" | "Practical" };

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tuition/subjects");
            const data = await res.json();
            setSubjects(data.subjects || []);
        } catch (e) {
            alert("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const openAdd = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowModal(true);
    };

    const openEdit = (sub: Subject) => {
        setEditingId(sub.id);
        setForm({ name: sub.name, code: sub.code, semester: sub.semester || "", type: sub.type || "Theory" });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingId ? `/api/tuition/subjects/${editingId}` : "/api/tuition/subjects";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            showSuccess(editingId ? "Subject updated successfully!" : "Subject added successfully!");
            setShowModal(false);
            fetchSubjects();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this subject? This may affect timetable entries.")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/tuition/subjects/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Failed to delete");
            }
            showSuccess("Subject deleted successfully");
            setSubjects(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.semester || "").toLowerCase().includes(search.toLowerCase())
    );

    const theory = subjects.filter(s => s.type === "Theory").length;
    const practical = subjects.filter(s => s.type === "Practical").length;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Success Banner */}
            {successMsg && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{successMsg}</span>
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
                    <p className="text-muted-foreground mt-1">Manage subjects offered at your institution.</p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Subject
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Subjects</p>
                            <p className="text-2xl font-bold">{subjects.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Theory</p>
                            <p className="text-2xl font-bold">{theory}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Practical</p>
                            <p className="text-2xl font-bold">{practical}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Subject List</CardTitle>
                            <CardDescription>{subjects.length} subjects total</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search subjects..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            {search ? "No subjects match your search." : "No subjects added yet. Click 'Add Subject' to start."}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filtered.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-mono font-semibold">{sub.code}</TableCell>
                                        <TableCell className="font-medium">{sub.name}</TableCell>
                                        <TableCell>{sub.semester || <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.type === "Practical" ? "secondary" : "default"}>
                                                {sub.type || "Theory"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                                    onClick={() => openEdit(sub)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(sub.id)}
                                                    disabled={deletingId === sub.id}
                                                >
                                                    {deletingId === sub.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add / Edit Modal */}
            <Dialog open={showModal} onOpenChange={(open) => { if (!open) setShowModal(false); }}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update subject details below." : "Fill in the details to add a new subject."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Subject Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Data Structures & Algorithms"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Subject Code *</Label>
                            <Input
                                id="code"
                                placeholder="e.g. BCA401"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    placeholder="e.g. IV, 4th"
                                    value={form.semester}
                                    onChange={e => setForm({ ...form, semester: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(v: "Theory" | "Practical") => setForm({ ...form, type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Theory">Theory</SelectItem>
                                        <SelectItem value="Practical">Practical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{editingId ? "Saving..." : "Adding..."}</>
                                    : editingId ? "Save Changes" : "Add Subject"
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
