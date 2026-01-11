"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCode from "qrcode";
import { Loader2, Trash2, Plus, Edit } from "lucide-react";

export default function TimetablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState<any>(null); // Details of session just created

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

    // Form Data Lists
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);

    // New Slot Form
    const [newSlot, setNewSlot] = useState({
        class_id: "",
        subject_id: "",
        faculty_id: "",
        day_of_week: "Monday",
        start_time: "",
        end_time: "",
        room_no: "Lab 1"
    });

    const refreshTimetable = () => {
        setLoading(true);
        fetch("/api/timetable")
            .then((res) => res.json())
            .then((data) => {
                setTimetable(data.timetable);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        refreshTimetable();
    }, []);

    // Load Form Data when Add Modal opens
    useEffect(() => {
        if (showAddModal) {
            Promise.all([
                fetch("/api/classes").then(res => res.json()),
                fetch("/api/admin/subjects").then(res => res.json()),
                fetch("/api/admin/faculty").then(res => res.json())
            ]).then(([classesData, subjectsData, facultyData]) => {
                setClasses(classesData.classes || []);
                setSubjects(subjectsData.subjects || []);
                setFaculty(facultyData.faculty || []);
            });
        }
    }, [showAddModal]);

    const handleGenerateQR = async (slot: any) => {
        // If already active, just show it
        if (slot.active_session) {
            try {
                const qrImage = await QRCode.toDataURL(slot.active_session.qr_code);
                setActiveSession({
                    ...slot,
                    qrImage,
                    expiry: new Date(Date.now() + 10 * 60 * 1000) // Visual only
                });
            } catch (e) {
                console.error(e);
                alert("Error displaying QR");
            }
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
            const qrImage = await QRCode.toDataURL(data.qr_code);

            // Optimistically update the list so the button turns green immediately
            const updatedTimetable = timetable.map(t => {
                if (t.id === slot.id) {
                    return { ...t, active_session: { id: data.session_id, qr_code: data.qr_code } };
                }
                return t;
            });
            setTimetable(updatedTimetable);

            setActiveSession({ ...slot, qrImage });
        } catch (error) { alert("Error generating QR"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this class? History will be preserved.")) return;
        try {
            const res = await fetch(`/api/admin/timetable/manage?id=${id}`, { method: "DELETE" });
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

            const res = await fetch("/api/admin/timetable/manage", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setShowAddModal(false);
                refreshTimetable();
                setNewSlot({
                    class_id: "",
                    subject_id: "",
                    faculty_id: "",
                    day_of_week: "Monday",
                    start_time: "",
                    end_time: "",
                    room_no: "Lab 1"
                });
                setEditingSlotId(null);
            } else {
                const d = await res.json();
                alert(d.error || "Failed using Add/Edit API");
            }
        } catch (e) { alert("Error saving"); }
    };

    const handleEdit = (slot: any) => {
        setEditingSlotId(slot.id);
        setNewSlot({
            class_id: slot.class_id,
            subject_id: slot.subject_id,
            faculty_id: slot.faculty_id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            room_no: slot.room_no
        });
        setShowAddModal(true);
    };

    // Reset when modal closes (if cancelled)
    useEffect(() => {
        if (!showAddModal) {
            setEditingSlotId(null);
            setNewSlot({
                class_id: "",
                subject_id: "",
                faculty_id: "",
                day_of_week: "Monday",
                start_time: "",
                end_time: "",
                room_no: "Lab 1"
            });
        }
    }, [showAddModal]);

    // Group by Day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = days.reduce((acc, day) => {
        acc[day] = timetable.filter((t) => t.day_of_week === day);
        return acc;
    }, {} as any);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Loading Timetable...</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Timetable & Attendance</h2>
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
                                            {slot.active_session ? 'Live Now' : `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`}
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
                                        <p className="text-sm text-muted-foreground mb-4">{slot.faculty_name || "Unknown Faculty"}</p>

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
                        <img src={activeSession?.qrImage} alt="QR Code" className="w-64 h-64 border-4 border-white shadow-lg rounded-lg" />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Class Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-[425px]">
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
                            <Label className="text-right">Class</Label>
                            <Select onValueChange={(v) => setNewSlot({ ...newSlot, class_id: v })} value={newSlot.class_id}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Faculty" /></SelectTrigger>
                                <SelectContent>
                                    {faculty.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.full_name} ({f.designation})</SelectItem>)}
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
                        <DialogFooter>
                            <Button onClick={handleSaveSlot}>{editingSlotId ? "Update Class" : "Save Class"}</Button>
                        </DialogFooter>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
