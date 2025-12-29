import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'faculty') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get Faculty ID
        const facultyRes = await query('SELECT id FROM faculty WHERE user_id = $1', [userId]);
        if ((facultyRes.rowCount ?? 0) === 0) {
            return NextResponse.json({ timetable: [] });
        }
        const facultyId = facultyRes.rows[0].id;

        const timetableRes = await query(`
      SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_no, 
             s.name as subject_name, c.name as class_name, c.section
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      WHERE t.faculty_id = $1
      ORDER BY 
        CASE 
          WHEN day_of_week = 'Monday' THEN 1
          WHEN day_of_week = 'Tuesday' THEN 2
          WHEN day_of_week = 'Wednesday' THEN 3
          WHEN day_of_week = 'Thursday' THEN 4
          WHEN day_of_week = 'Friday' THEN 5
          WHEN day_of_week = 'Saturday' THEN 6
          ELSE 7
        END,
        t.start_time ASC
    `, [facultyId]);

        return NextResponse.json({
            timetable: timetableRes.rows
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
