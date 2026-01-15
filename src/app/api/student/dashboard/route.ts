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

        // AUTO-HEALING: Remove sessions with invalid duration (due to timezone bug)
        // If duration > 3 hours, it's a bugged session (valid classes are ~1 hr)
        await query(`DELETE FROM attendance_sessions WHERE EXTRACT(EPOCH FROM (end_time - start_time)) > 10800`);

        const userId = (session.user as any).id;

        // 1. Get Student ID
        // 1. Get Student ID
        const studentRes = await query('SELECT id, course_year, section FROM students WHERE user_id = $1', [userId]);
        if ((studentRes.rowCount ?? 0) === 0) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }
        const student = studentRes.rows[0];

        // 2. Fetch Attendance Stats
        const statsRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Present') as present,
        COUNT(*) FILTER (WHERE status = 'Absent') as absent,
        COUNT(*) as total
      FROM attendance_records 
      WHERE student_id = $1
    `, [student.id]);

        const { present, absent, total } = statsRes.rows[0];
        const attendanceRate = total > 0 ? Math.round((parseInt(present) / parseInt(total)) * 100) : 0;

        // 3. Fetch Subject Performance (Subject-wise breakdown)
        const subjectStatsRes = await query(`
            SELECT 
                s.name as subject_name,
                COUNT(*) FILTER (WHERE ar.status = 'Present') as present_count,
                COUNT(*) as total_count
            FROM attendance_records ar
            JOIN attendance_sessions sess ON ar.session_id = sess.id
            JOIN timetable t ON sess.timetable_id = t.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE ar.student_id = $1
            GROUP BY s.name
            ORDER BY total_count DESC
        `, [student.id]);

        const subjectPerformance = subjectStatsRes.rows.map(row => {
            const present = parseInt(row.present_count);
            const total = parseInt(row.total_count);
            return {
                subject: row.subject_name,
                present,
                total,
                percentage: total > 0 ? Math.round((present / total) * 100) : 0
            };
        });

        // 4. Fetch Today's Classes
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];

        const classesRes = await query(`
      SELECT t.id, t.start_time, t.end_time, s.name as subject_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      WHERE c.name = $1 AND c.section = $2
      AND t.day_of_week = $3
      AND t.is_active = TRUE
      ORDER BY t.start_time ASC
    `, [student.course_year, student.section, todayName]);

        // 4. Check Active Sessions and Attendance Status for Today's Classes
        const todayClasses = await Promise.all(classesRes.rows.map(async (cls) => {
            // Check if there is an active session right now
            const sessionRes = await query(`
            SELECT id FROM attendance_sessions 
            WHERE timetable_id = $1 
            AND is_active = TRUE 
            AND end_time > NOW()
        `, [cls.id]);

            // Check if student is ALREADY marked (Present or Absent) for this class today (active or past session)
            // We join with attendance_sessions to ensure it matches the same class and is TODAY
            const attendanceRes = await query(`
                SELECT ar.status 
                FROM attendance_records ar
                JOIN attendance_sessions as_sess ON ar.session_id = as_sess.id
                WHERE as_sess.timetable_id = $1 
                AND ar.student_id = $2 
                AND as_sess.start_time::date = CURRENT_DATE
            `, [cls.id, student.id]);

            const status = attendanceRes.rows[0]?.status || null;

            return {
                ...cls,
                isActive: (sessionRes.rowCount ?? 0) > 0,
                isMarkedPresent: status === 'Present', // Keep for backward compat if needed, but prefer 'status'
                status: status
            };
        }));

        return NextResponse.json({
            stats: {
                attendance: attendanceRate,
                present: parseInt(present),
                absent: parseInt(absent),
                totalClasses: parseInt(total) // Note: This is recorded classes. Total scheduled classes would require more complex calc.
            },
            subjectPerformance,
            todayClasses: todayClasses,
            studentDetails: {
                course: student.course_year,
                section: student.section
            }
        });

    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
