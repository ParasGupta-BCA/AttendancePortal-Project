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

        let queryText = `
        SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_no,
               t.class_id, t.subject_id, t.faculty_id,
               s.name as subject_name, s.code as subject_code,
               f.designation as faculty_name,
               (SELECT json_build_object('id', ans.id, 'qr_code', ans.qr_code) 
                FROM attendance_sessions ans 
                WHERE ans.timetable_id = t.id 
                AND ans.is_active = TRUE 
                AND ans.end_time > NOW() 
                LIMIT 1) as active_session
        FROM timetable t
        JOIN subjects s ON t.subject_id = s.id
        LEFT JOIN faculty f ON t.faculty_id = f.id
        WHERE t.is_active = TRUE
        AND t.institution_id = $1
    `;

        const params: any[] = [institutionId];
        if (day) {
            queryText += ` AND t.day_of_week = $2`;
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

        const settingsRes = await query(
            `SELECT value FROM attendance_settings WHERE key = 'qr_refresh_interval' AND institution_id = $1`,
            [institutionId]
        );
        const qrInterval = parseInt(settingsRes.rows[0]?.value || '5', 10);

        return NextResponse.json({
            timetable: res.rows,
            qrInterval
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
