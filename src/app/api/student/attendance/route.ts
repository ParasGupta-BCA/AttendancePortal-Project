import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        // Get Student ID
        const studentRes = await query('SELECT id FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rowCount === 0) return NextResponse.json({ history: [] });
        const studentId = studentRes.rows[0].id;

        // Fetch History
        const historyRes = await query(`
        SELECT ar.marked_at, ar.status, s.name as subject_name, s.code as subject_code, as_sess.start_time as session_date
        FROM attendance_records ar
        JOIN attendance_sessions as_sess ON ar.session_id = as_sess.id
        JOIN timetable t ON as_sess.timetable_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE ar.student_id = $1
        ORDER BY as_sess.start_time DESC
    `, [studentId]);

        return NextResponse.json({ history: historyRes.rows });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
