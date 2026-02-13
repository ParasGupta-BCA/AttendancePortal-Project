"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";

interface Request {
    id: string;
    full_name: string;
    email: string;
    enrollment_no: string;
    erp_id: string;
    course_year: string;
    section: string;
    status: string;
    created_at: string;
    // Validation fields (from backend)
    email_exists: boolean;
    enrollment_exists: boolean;
}

export default function StudentRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchRequests = async () => {
        setLoading(true); // Show loading state on refresh
        try {
            const res = await fetch("/api/admin/requests", {
                cache: "no-store", // Ensure fresh data
                headers: { "Pragma": "no-cache" }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        setProcessingId(requestId);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                // Remove from list
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Something went wrong" });
        } finally {
            setProcessingId(null);
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // Verification Logic
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidName = (name: string) => {
        // Allow letters, spaces, dots, hyphens, apostrophes. No numbers.
        const nameRegex = /^[a-zA-Z\s.'-]+$/;
        return nameRegex.test(name) && name.length >= 2;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Student Requests</h1>
                <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                    Refresh
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {message.text}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Review and approve new student registration requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No pending requests found.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Enrollment / ERP</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((req, index) => {
                                        const nameValid = isValidName(req.full_name);
                                        const emailFormatValid = isValidEmail(req.email);
                                        const emailDuplicate = req.email_exists;
                                        const enrollmentDuplicate = req.enrollment_exists;

                                        return (
                                            <TableRow key={req.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <span>{req.full_name}</span>
                                                        {nameValid ? (
                                                            <Check className="h-4 w-4 text-green-500" title="Valid Name Format" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-red-500" title="Invalid Name Format (Contains numbers or special chars)" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <span>{req.email}</span>
                                                        {!emailFormatValid ? (
                                                            <X className="h-4 w-4 text-red-500" title="Invalid Email Format" />
                                                        ) : emailDuplicate ? (
                                                            <div className="flex items-center text-orange-500" title="Email already registered in system">
                                                                <span className="text-xs font-bold mr-1">!</span>
                                                            </div>
                                                        ) : (
                                                            <Check className="h-4 w-4 text-green-500" title="Valid & Unique Email" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs text-muted-foreground">
                                                        <div className="flex items-center space-x-1">
                                                            <span>{req.enrollment_no}</span>
                                                            {enrollmentDuplicate && (
                                                                <span className="text-orange-500 font-bold" title="Enrollment No. already exists">(!)</span>
                                                            )}
                                                        </div>
                                                        <span>{req.erp_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="mr-1">{req.course_year}</Badge>
                                                    <Badge variant="outline">{req.section}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                                        disabled={!!processingId}
                                                        onClick={() => handleAction(req.id, 'approve')}
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Check className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 w-8 p-0"
                                                        disabled={!!processingId}
                                                        onClick={() => handleAction(req.id, 'reject')}
                                                    >
                                                        {processingId === req.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <X className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
