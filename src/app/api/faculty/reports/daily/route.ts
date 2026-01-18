import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'faculty') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const facultyUserId = (session.user as any).id;

        // Get Date Range from params
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Start and End dates are required' }, { status: 400 });
        }

        // 1. Get Faculty ID
        const facultyRes = await query('SELECT id FROM faculty WHERE user_id = $1', [facultyUserId]);
        if (facultyRes.rowCount === 0) return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
        const facultyId = facultyRes.rows[0].id;

        // 2. Fetch Sessions for that Date Range
        const sessionsRes = await query(`
            SELECT 
                as_sess.id as session_id,
                as_sess.start_time,
                as_sess.end_time,
                s.name as subject_name,
                c.name as class_name,
                c.section
            FROM attendance_sessions as_sess
            JOIN timetable t ON as_sess.timetable_id = t.id
            JOIN subjects s ON t.subject_id = s.id
            JOIN classes c ON t.class_id = c.id
            WHERE as_sess.faculty_id = $1
            AND as_sess.start_time >= $2::timestamp
            AND as_sess.start_time <= $3::timestamp
            ORDER BY as_sess.start_time ASC
        `, [facultyId, `${startDate} 00:00:00`, `${endDate} 23:59:59`]);

        const sessions = sessionsRes.rows;
        const reportData = [];

        // 3. For each session, fetch attendance list
        for (const sess of sessions) {
            const studentsRes = await query(`
                SELECT 
                    st.enrollment_no,
                    u.full_name,
                    ar.status,
                    ar.marked_at
                FROM attendance_records ar
                JOIN students st ON ar.student_id = st.id
                JOIN users u ON st.user_id = u.id
                WHERE ar.session_id = $1
                ORDER BY st.enrollment_no ASC
            `, [sess.session_id]);

            // Also need list of absent students?
            // Usually daily report just shows who was present, or a full list.
            // Let's get the full class list to show Absents too.

            const allStudentsRes = await query(`
                SELECT st.id, st.enrollment_no, u.full_name
                FROM students st
                JOIN users u ON st.user_id = u.id
                WHERE st.course_year = $1 AND st.section = $2
                ORDER BY st.enrollment_no ASC
            `, [sess.class_name, sess.section]);

            const fullList = allStudentsRes.rows.map((st: any) => {
                const record = studentsRes.rows.find((r: any) => r.enrollment_no === st.enrollment_no);
                return {
                    name: st.full_name,
                    enrollment_no: st.enrollment_no,
                    status: record ? record.status : 'Absent',
                    time: record ? new Date(record.marked_at).toLocaleTimeString() : '-'
                };
            });

            reportData.push({
                session_info: sess,
                attendance: fullList
            });
        }

        return NextResponse.json({
            startDate,
            endDate,
            sessions: reportData
        });

    } catch (error: any) {
        console.error("Daily Report API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
