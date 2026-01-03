"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export function SubjectAnalytics() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                if (data.subjectPerformance) {
                    setSubjects(data.subjectPerformance);
                }
            } catch (e) {
                console.error("Failed to fetch subject stats");
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground">Loading stats...</div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground">No attendance data yet.</div>
                    ) : (
                        subjects.map((sub, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="font-medium">{sub.subject}</div>
                                    <div className="text-muted-foreground">{sub.percentage}%</div>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${sub.percentage >= 75 ? 'bg-green-500' :
                                            sub.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${sub.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
