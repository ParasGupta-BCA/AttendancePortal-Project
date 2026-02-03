"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
}

export default function StudentRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/requests");
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
        try {
            const res = await fetch("/api/admin/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: action === 'approve' ? "Approved" : "Rejected",
                    description: data.message,
                    variant: action === 'approve' ? "default" : "destructive", // default is usually success-like or neutral
                });
                // Remove from list
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Student Requests</h1>
                <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                    Refresh
                </Button>
            </div>

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
                                    {requests.map((req, index) => (
                                        <TableRow key={req.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{req.full_name}</TableCell>
                                            <TableCell>{req.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs text-muted-foreground">
                                                    <span>{req.enrollment_no}</span>
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
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
