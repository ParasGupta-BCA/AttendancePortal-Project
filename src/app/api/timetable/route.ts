import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const day = searchParams.get('day'); // 'Monday', etc.

        let queryText = `
        SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_no,
               s.name as subject_name, s.code as subject_code,
               f.designation as faculty_name -- Using designation as placeholder if full name joins are pending
        FROM timetable t
        JOIN subjects s ON t.subject_id = s.id
        LEFT JOIN faculty f ON t.faculty_id = f.id
    `;

        const params: any[] = [];
        if (day) {
            queryText += ` WHERE t.day_of_week = $1`;
            params.push(day);
        }

        queryText += ` ORDER BY case 
        when day_of_week = 'Monday' then 1 
        when day_of_week = 'Tuesday' then 2 
        when day_of_week = 'Wednesday' then 3 
        when day_of_week = 'Thursday' then 4 
        when day_of_week = 'Friday' then 5 
        when day_of_week = 'Saturday' then 6 
        else 7 end, start_time`;

        const res = await query(queryText, params);

        // Add user name via another join if needed, but for now this is fine.

        return NextResponse.json({ timetable: res.rows });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
