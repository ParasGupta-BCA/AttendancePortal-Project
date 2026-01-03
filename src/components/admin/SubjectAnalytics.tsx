"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";


export function SubjectAnalytics() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

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

    const displayedSubjects = showAll ? subjects : subjects.slice(0, 3);

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
                        <>
                            {displayedSubjects.map((sub, i) => (
                                <div key={i} className="space-y-2 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="font-medium">{sub.subject}</div>
                                        <div className="text-muted-foreground">
                                            {sub.hasData ? `${sub.percentage}%` : 'No Data'}
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${!sub.hasData ? 'bg-gray-200 dark:bg-gray-800' :
                                                sub.percentage >= 75 ? 'bg-green-500' :
                                                    sub.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: sub.hasData ? `${sub.percentage}%` : '100%' }}
                                        ></div>
                                    </div>
                                </div>

                            ))}

                            {subjects.length > 3 && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary pt-3 transition-colors font-medium border-t mt-2"
                                >
                                    {showAll ? (
                                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>Show More ({subjects.length - 3} others) <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card >
    );
}
