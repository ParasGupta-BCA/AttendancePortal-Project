"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Plus, Edit } from "lucide-react";
import { DynamicQRDisplay } from "@/components/common/DynamicQRDisplay";

export default function TimetablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [qrInterval, setQrInterval] = useState(5);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

    // Form Data Lists — Supabase has subjects & faculty
    const [subjects, setSubjects] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);

    // New Slot Form — uses course_year + section (not class_id)
    const [newSlot, setNewSlot] = useState({
        course_year: "",
        section: "",
        subject_id: "",
        faculty_id: "",
        day_of_week: "Monday",
        start_time: "",
        end_time: "",
        room_no: "Lab 1"
    });

    const refreshTimetable = () => {
        setLoading(true);
        fetch("/api/tuition/timetable")
            .then((res) => res.json())
            .then((data) => {
                setTimetable(data.timetable || []);
                if (data.qrInterval) setQrInterval(data.qrInterval);
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });
    };

    useEffect(() => {
        refreshTimetable();
    }, []);

    // Load Form Data when Add Modal opens
    useEffect(() => {
        if (showAddModal) {
            Promise.all([
                fetch("/api/tuition/subjects").then(res => res.json()),
                fetch("/api/tuition/faculty").then(res => res.json())
            ]).then(([subjectsData, facultyData]) => {
                setSubjects(subjectsData.subjects || []);
                setFaculty(facultyData.faculty || []);
            });
        }
    }, [showAddModal]);

    const handleGenerateQR = async (slot: any) => {
        if (slot.active_session) {
            setActiveSession({ ...slot, qr_code: slot.active_session.qr_code });
            return;
        }

        try {
            const res = await fetch("/api/attendance/session/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timetable_id: slot.id }),
            });
            const data = await res.json();
            if (!res.ok) { alert(data.error || "Failed"); return; }

            const updatedTimetable = timetable.map(t => {
                if (t.id === slot.id) {
                    return { ...t, active_session: { id: data.session_id, qr_code: data.qr_code } };
                }
                return t;
            });
            setTimetable(updatedTimetable);
            setActiveSession({ ...slot, qr_code: data.qr_code });
        } catch (error) { alert("Error generating QR"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this class? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/tuition/timetable/manage?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                refreshTimetable();
            } else {
                alert("Failed to delete");
            }
        } catch (e) { alert("Error deleting"); }
    };

    const handleSaveSlot = async () => {
        try {
            const method = editingSlotId ? "PUT" : "POST";
            const body = editingSlotId ? { ...newSlot, id: editingSlotId } : newSlot;

            const res = await fetch("/api/tuition/timetable/manage", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setShowAddModal(false);
                refreshTimetable();
                resetForm();
            } else {
                const d = await res.json();
                alert(d.error || "Failed to save");
            }
        } catch (e) { alert("Error saving"); }
    };

    const handleEdit = (slot: any) => {
        setEditingSlotId(slot.id);
        setNewSlot({
            course_year: slot.course_year || "",
            section: slot.section || "",
            subject_id: slot.subject_id,
            faculty_id: slot.faculty_id || "",
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            room_no: slot.room_no || ""
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setEditingSlotId(null);
        setNewSlot({
            course_year: "",
            section: "",
            subject_id: "",
            faculty_id: "",
            day_of_week: "Monday",
            start_time: "",
            end_time: "",
            room_no: "Lab 1"
        });
    };

    useEffect(() => {
        if (!showAddModal) resetForm();
    }, [showAddModal]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = days.reduce((acc, day) => {
        acc[day] = timetable.filter((t) => t.day_of_week === day);
        return acc;
    }, {} as any);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Loading Timetable...</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Timetable &amp; Attendance</h2>
                <div className="flex gap-2">
                    <Button variant={isEditing ? "secondary" : "default"} onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Done Editing" : "Edit Timetable"}
                        <Edit className="ml-2 w-4 h-4" />
                    </Button>
                    {isEditing && (
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Class
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {days.map((day) => (
                    <div key={day} className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">{day}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(grouped[day] || []).length === 0 && <p className="text-muted-foreground text-sm italic">No classes scheduled.</p>}
                            {grouped[day]?.map((slot: any) => (
                                <Card key={slot.id} className={`relative overflow-hidden ${isEditing ? 'border-dashed border-2' : ''} ${slot.active_session ? 'border-green-500 border-2' : ''}`}>
                                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                        <Badge variant={slot.active_session ? "default" : "outline"} className={`w-fit ${slot.active_session ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                                            {slot.active_session ? 'Live Now' : `${String(slot.start_time).slice(0, 5)} - ${String(slot.end_time).slice(0, 5)}`}
                                        </Badge>
                                        {isEditing && (
                                            <div className="flex gap-1">
                                                <Button variant="secondary" size="icon" className="h-6 w-6" onClick={() => handleEdit(slot)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => handleDelete(slot.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle className="text-base mb-1">{slot.subject_name}</CardTitle>
                                        <p className="text-xs text-muted-foreground mb-1">{slot.course_year} • {slot.section}</p>
                                        <p className="text-sm text-muted-foreground mb-4">{slot.faculty_name || "No Faculty Assigned"}</p>

                                        {!isEditing && (
                                            <Button size="sm" className={`w-full ${slot.active_session ? 'bg-green-600 hover:bg-green-700' : ''}`} onClick={() => handleGenerateQR(slot)}>
                                                {slot.active_session ? 'View Active QR' : 'Generate QR'}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Dialog */}
            <Dialog open={!!activeSession} onOpenChange={(open) => !open && setActiveSession(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Scan Attendance</DialogTitle></DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {activeSession?.qr_code && (
                            <DynamicQRDisplay code={activeSession.qr_code} interval={qrInterval} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Class Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-[475px]">
                    <DialogHeader>
                        <DialogTitle>{editingSlotId ? "Edit Class" : "Add New Class"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Day</Label>
                            <Select onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: v })} value={newSlot.day_of_week}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Day" /></SelectTrigger>
                                <SelectContent>
                                    {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Year</Label>
                            <Input className="col-span-3" placeholder="e.g. BCA VI, MCA II" value={newSlot.course_year} onChange={e => setNewSlot({ ...newSlot, course_year: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Section</Label>
                            <Input className="col-span-3" placeholder="e.g. A, B, Morning" value={newSlot.section} onChange={e => setNewSlot({ ...newSlot, section: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Subject</Label>
                            <Select onValueChange={(v) => setNewSlot({ ...newSlot, subject_id: v })} value={newSlot.subject_id}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Faculty</Label>
                            <Select onValueChange={(v) => setNewSlot({ ...newSlot, faculty_id: v })} value={newSlot.faculty_id}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Faculty (optional)" /></SelectTrigger>
                                <SelectContent>
                                    {faculty.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.full_name} ({f.designation || 'Faculty'})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Start</Label>
                            <Input className="col-span-3" type="time" value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">End</Label>
                            <Input className="col-span-3" type="time" value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Room</Label>
                            <Input className="col-span-3" value={newSlot.room_no} onChange={e => setNewSlot({ ...newSlot, room_no: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveSlot}>{editingSlotId ? "Update Class" : "Save Class"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
