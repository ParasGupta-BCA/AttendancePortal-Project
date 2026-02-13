"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";
import { generateToken } from "@/utils/dynamicQrClient";
import { DynamicQRDisplay } from "@/components/common/DynamicQRDisplay";

export default function FacultyTimetablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [interval, setIntervalVal] = useState(5);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        fetch("/api/faculty/timetable")
            .then(res => res.json())
            .then(data => {
                setTimetable(data.timetable || []);
                if (data.qrInterval) setIntervalVal(data.qrInterval);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const generateQR = async (slotId: string) => {
        try {
            const res = await fetch("/api/attendance/session/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timetable_id: slotId })
            });
            const json = await res.json();
            if (json.success) {
                window.location.reload();
            } else {
                alert("Error: " + json.error);
            }
        } catch (e) {
            alert("Failed to create session");
        }
    };

    const filteredTimetable = timetable.filter(t => t.day_of_week === selectedDay);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Access Your Timetable</h2>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent>
                        {days.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{selectedDay}'s Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : filteredTimetable.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No classes scheduled.</TableCell>
                                </TableRow>
                            ) : (
                                filteredTimetable.map((slot) => (
                                    <TableRow key={slot.id}>
                                        <TableCell>{slot.start_time} - {slot.end_time}</TableCell>
                                        <TableCell className="font-medium">{slot.subject_name}</TableCell>
                                        <TableCell>{slot.class_name} ({slot.section})</TableCell>
                                        <TableCell>{slot.room_no || 'N/A'}</TableCell>
                                        <TableCell>
                                            {slot.activeSession ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">View QR</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="flex flex-col items-center">
                                                        <h3 className="text-lg font-bold mb-4">Scan to Mark Attendance</h3>
                                                        <DynamicQRDisplay code={slot.activeSession.qr_code} interval={interval} />
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Button size="sm" onClick={() => generateQR(slot.id)}>
                                                    <QrCode className="mr-2 h-4 w-4" /> Start
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// ... (removed local QRDisplay)
