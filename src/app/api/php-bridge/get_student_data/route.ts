import { NextResponse } from 'next/server';

export async function GET() {
    const students = [
        {
            id: "STU001",
            name: "Aarav Patel",
            course: "BCA",
            attendance: 85,
            status: "Good"
        },
        {
            id: "STU002",
            name: "Sneha Gupta",
            course: "B.Tech",
            attendance: 62,
            status: "Warning"
        },
        {
            id: "STU003",
            name: "Rohan Kumar",
            course: "BBA",
            attendance: 91,
            status: "Excellent"
        },
        {
            id: "STU004",
            name: "Priya Singh",
            course: "BCA",
            attendance: 78,
            status: "Average"
        }
    ];

    return NextResponse.json({
        status: "success",
        count: students.length,
        data: students,
        query_time: "0.002s (Simulated)"
    });
}
