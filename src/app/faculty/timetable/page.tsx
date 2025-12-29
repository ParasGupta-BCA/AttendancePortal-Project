"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function FacultyTimetablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState("Monday");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        fetch("/api/faculty/timetable")
            .then(res => res.json())
            .then(data => {
                setTimetable(data.timetable || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : filteredTimetable.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No classes scheduled.</TableCell>
                                </TableRow>
                            ) : (
                                filteredTimetable.map((slot) => (
                                    <TableRow key={slot.id}>
                                        <TableCell>{slot.start_time} - {slot.end_time}</TableCell>
                                        <TableCell className="font-medium">{slot.subject_name}</TableCell>
                                        <TableCell>{slot.class_name} ({slot.section})</TableCell>
                                        <TableCell>{slot.room_no || 'N/A'}</TableCell>
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
