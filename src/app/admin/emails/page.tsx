"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmailPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const { register, handleSubmit, reset, watch, setValue } = useForm();

    const recipientType = watch("recipientType", "all");

    const onSubmit = async (data: any) => {
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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Email Center</h1>
                <p className="text-gray-500">Send notifications manually to students.</p>
            </div>

            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
                        <Send className="h-5 w-5 text-blue-600" />
                        Compose Email
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Send alerts, reminders, or updates directly to student inboxes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Recipient Selection */}
                        <div className="space-y-2">
                            <Label className="text-gray-900 font-medium">Recipient</Label>
                            <Select
                                onValueChange={(val) => setValue("recipientType", val)}
                                defaultValue="all"
                            >
                                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                    <SelectValue placeholder="Select who to message" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200">
                                    <SelectItem value="all" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer">All Students</SelectItem>
                                    <SelectItem value="class" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer">Specific Class</SelectItem>
                                    <SelectItem value="single" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900 cursor-pointer">Single Student (Email)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {recipientType === 'class' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-gray-900 font-medium">Class Name</Label>
                                <Input
                                    {...register("className")}
                                    placeholder="e.g. BCA VI Morning"
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                />
                                <p className="text-xs text-gray-500">Must match exactly for now (e.g. "BCA VI" or check DB)</p>
                            </div>
                        )}

                        {recipientType === 'single' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-gray-900 font-medium">Student Email</Label>
                                <Input
                                    {...register("studentEmail")}
                                    type="email"
                                    placeholder="student@example.com"
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        )}

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label className="text-gray-900 font-medium">Subject</Label>
                            <Input
                                {...register("subject", { required: true })}
                                placeholder="Enter email subject..."
                                className="bg-white border-gray-300 text-gray-900 font-medium placeholder:text-gray-400"
                            />
                        </div>

                        {/* Body */}
                        <div className="space-y-2">
                            <Label className="text-gray-900 font-medium">Message Content</Label>
                            <Textarea
                                {...register("content", { required: true })}
                                placeholder="Type your message here..."
                                className="bg-white border-gray-300 text-gray-900 min-h-[200px] placeholder:text-gray-400"
                            />
                            <p className="text-xs text-gray-500">Standard HTML tags are supported but kept simple for safety.</p>
                        </div>

                        {status && (
                            <Alert className={`border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                {status.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                                <AlertTitle className="font-semibold">{status.type === 'success' ? "Success" : "Error"}</AlertTitle>
                                <AlertDescription>{status.message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white w-full md:w-auto transition-all">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Email
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
