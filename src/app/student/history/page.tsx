"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/student/attendance")
            .then((res) => res.json())
            .then((data) => {
                setHistory(data.history || []);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, []);

    if (loading) return <div className="p-4 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Attendance History</h2>

            {history.length === 0 && <p className="text-muted-foreground text-center py-8">No attendance records found.</p>}

            {history.map((record: any, i: number) => (
                <Card key={i}>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">{record.subject_name}</h3>
                            <p className="text-xs text-muted-foreground">{new Date(record.marked_at).toLocaleString()}</p>
                        </div>
                        <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                            {record.status}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
