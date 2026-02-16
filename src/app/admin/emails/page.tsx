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
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Email Center</h1>
                <p className="text-gray-400">Send notifications manually to students.</p>
            </div>

            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-500" />
                        Compose Email
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Send alerts, reminders, or updates directly to student inboxes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Recipient Selection */}
                        <div className="space-y-2">
                            <Label className="text-gray-200">Recipient</Label>
                            <Select
                                onValueChange={(val) => setValue("recipientType", val)}
                                defaultValue="all"
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select who to message" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    <SelectItem value="all">All Students</SelectItem>
                                    <SelectItem value="class">Specific Class</SelectItem>
                                    <SelectItem value="single">Single Student (Email)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {recipientType === 'class' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-gray-200">Class Name</Label>
                                <Input
                                    {...register("className")}
                                    placeholder="e.g. BCA VI Morning"
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                                <p className="text-xs text-gray-500">Must match exactly for now (e.g. "BCA VI" or check DB)</p>
                            </div>
                        )}

                        {recipientType === 'single' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-gray-200">Student Email</Label>
                                <Input
                                    {...register("studentEmail")}
                                    type="email"
                                    placeholder="student@example.com"
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                        )}

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label className="text-gray-200">Subject</Label>
                            <Input
                                {...register("subject", { required: true })}
                                placeholder="Enter email subject..."
                                className="bg-gray-800 border-gray-700 text-white font-medium"
                            />
                        </div>

                        {/* Body */}
                        <div className="space-y-2">
                            <Label className="text-gray-200">Message Content</Label>
                            <Textarea
                                {...register("content", { required: true })}
                                placeholder="Type your message here..."
                                className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                            />
                            <p className="text-xs text-gray-500">Standard HTML tags are supported but kept simple for safety.</p>
                        </div>

                        {status && (
                            <Alert className={`border-none ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                <AlertTitle>{status.type === 'success' ? "Success" : "Error"}</AlertTitle>
                                <AlertDescription>{status.message}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
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
