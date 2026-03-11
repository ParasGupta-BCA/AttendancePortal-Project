import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { searchParams } = new URL(request.url);
        const day = searchParams.get('day');

        // Supabase schema: timetable has course_year + section (no class_id, no is_active)
        // faculty has no full_name — need to JOIN users to get name
        // attendance_sessions has no end_time — uses actual_end_time
        let queryText = `
        SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_no,
               t.course_year, t.section, t.subject_id, t.faculty_id,
               s.name as subject_name, s.code as subject_code,
               u.full_name as faculty_name,
               (SELECT json_build_object('id', ans.id, 'qr_code', ans.qr_code) 
                FROM attendance_sessions ans 
                WHERE ans.timetable_id = t.id 
                AND ans.is_active = TRUE
                LIMIT 1) as active_session
        FROM timetable t
        JOIN subjects s ON t.subject_id = s.id
        LEFT JOIN faculty f ON t.faculty_id = f.id
        LEFT JOIN users u ON f.user_id = u.id
        WHERE t.institution_id = $1
    `;

        const params: any[] = [institutionId];
        if (day) {
            queryText += ` AND t.day_of_week = $2`;
            params.push(day);
        }

        queryText += ` ORDER BY case 
        when t.day_of_week = 'Monday' then 1 
        when t.day_of_week = 'Tuesday' then 2 
        when t.day_of_week = 'Wednesday' then 3 
        when t.day_of_week = 'Thursday' then 4 
        when t.day_of_week = 'Friday' then 5 
        when t.day_of_week = 'Saturday' then 6 
        else 7 end, t.start_time`;

        const res = await query(queryText, params);

        return NextResponse.json({
            timetable: res.rows,
            qrInterval: 5
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
