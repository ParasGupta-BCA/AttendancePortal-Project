"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle, AlertCircle, FileBarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
    id: string;
    full_name: string;
    email: string;
    course_year: string;
    section: string;
}

export default function EmailPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [students, setStudents] = useState<Student[]>([]);

    // Form 1: General Email
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const recipientType = watch("recipientType", "all");

    // Form 2: Report
    const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>("");

    useEffect(() => {
        // Fetch students for the dropdown
        const fetchStudents = async () => {
            try {
                const res = await fetch("/api/admin/students");
                const data = await res.json();
                if (data.students) setStudents(data.students);
            } catch (error) {
                console.error("Failed to fetch students", error);
            }
        };
        fetchStudents();
    }, []);

    const onSendGeneralEmail = async (data: any) => {
        setIsLoading(true);
        setStatus(null);
        try {
            const res = await fetch("/api/admin/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to send email");
            setStatus({ type: 'success', message: `Successfully sent ${result.count} emails.` });
            reset();
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const onSendReport = async () => {
        if (!selectedStudentForReport) {
            setStatus({ type: 'error', message: "Please select a student first." });
            return;
        }

        setIsLoading(true);
        setStatus(null);
        try {
            // Find student ID
            const student = students.find(s => s.email === selectedStudentForReport);
            if (!student) throw new Error("Student not found");

            const res = await fetch("/api/admin/send-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: student.id }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to send report");

            setStatus({
                type: 'success',
                message: `Report sent to ${result.data.student}. Usage: ${result.data.percentage}% (${result.data.present}/${result.data.total})`
            });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Email Center</h1>
                <p className="text-gray-500">Manage communications and reports.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1 bg-gray-100 rounded-lg">
                    <TabsTrigger value="general" className="py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium transition-all">
                        <Send className="w-4 h-4 mr-2" />
                        General Notification
                    </TabsTrigger>
                    <TabsTrigger value="report" className="py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm font-medium transition-all">
                        <FileBarChart className="w-4 h-4 mr-2" />
                        Attendance Report
                    </TabsTrigger>
                </TabsList>

                {status && (
                    <Alert className={`mb-6 border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {status.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                        <AlertTitle className="font-semibold">{status.type === 'success' ? "Success" : "Error"}</AlertTitle>
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}

                <TabsContent value="general">
                    <Card className="bg-white border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
                                <Send className="h-5 w-5 text-blue-600" />
                                Compose Message
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Send broad announcements or specific alerts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSendGeneralEmail)} className="space-y-6">
                                {/* ... Same Form as Before ... */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-gray-900 font-medium">To</Label>
                                        <Select onValueChange={(val) => setValue("recipientType", val)} defaultValue="all">
                                            <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10"><SelectValue placeholder="Select Recipient" /></SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200">
                                                <SelectItem value="all">All Students</SelectItem>
                                                <SelectItem value="class">Specific Class</SelectItem>
                                                <SelectItem value="single">Individual Student</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {recipientType === 'class' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-gray-900 font-medium">Class Name</Label>
                                            <Input {...register("className")} placeholder="e.g. BCA VI" className="bg-white border-gray-300 text-gray-900 h-10" />
                                        </div>
                                    )}
                                    {recipientType === 'single' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-gray-900 font-medium">Student Email</Label>
                                            <Input {...register("studentEmail")} type="email" placeholder="student@example.com" className="bg-white border-gray-300 text-gray-900 h-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-900 font-medium">Subject</Label>
                                    <Input {...register("subject", { required: true })} placeholder="Brief summary" className="bg-white border-gray-300 text-gray-900 font-medium h-10" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><Label className="text-gray-900 font-medium">Message</Label><span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">Plain Text Only</span></div>
                                    <Textarea {...register("content", { required: true })} placeholder="Write your update here..." className="bg-white border-gray-300 text-gray-900 min-h-[250px] resize-y text-base" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white px-8 h-10 transition-all rounded-md font-medium">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Notification
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="report">
                    <Card className="bg-white border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
                                <FileBarChart className="h-5 w-5 text-violet-600" />
                                Send Attendance Report
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Automatically calculate and email a detailed attendance summary to a specific student.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            <div className="space-y-2">
                                <Label className="text-gray-900 font-medium">Select Student</Label>
                                <Select onValueChange={setSelectedStudentForReport}>
                                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10">
                                        <SelectValue placeholder="Search or select a student..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 max-h-[300px]">
                                        {students.length === 0 ? (
                                            <div className="p-2 text-sm text-gray-500 text-center">Loading students...</div>
                                        ) : (
                                            students.map((student) => (
                                                <SelectItem key={student.id} value={student.email} className="cursor-pointer">
                                                    {student.full_name} ({student.course_year} {student.section})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                    This will trigger a calculation of their total attendance % and send an email report immediately.
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={onSendReport}
                                    disabled={isLoading || !selectedStudentForReport}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-10 transition-all rounded-md font-medium"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Calculate & Send Report
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
