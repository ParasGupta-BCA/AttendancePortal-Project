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

        const { searchParams } = new URL(request.url);
        const timetableId = searchParams.get('timetable_id');

        if (!timetableId) {
            return NextResponse.json({ error: 'Timetable ID is required' }, { status: 400 });
        }

        // 1. Fetch Class & Subject Details
        const classDetails = await query(`
            SELECT 
                c.name as class_name, 
                c.section, 
                s.name as subject_name, 
                s.code as subject_code
            FROM timetable t
            JOIN classes c ON t.class_id = c.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE t.id = $1
        `, [timetableId]);

        if (classDetails.rowCount === 0) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // 2. Fetch All Students in this Class
        // (Assuming all students in class 'BCA VI' 'Morning' are eligible)
        // We get class_id from timetable first
        const classIdRes = await query('SELECT class_id FROM timetable WHERE id = $1', [timetableId]);
        const classId = classIdRes.rows[0].class_id;

        // Get class name/section to filter students
        const classNameRes = await query('SELECT name, section FROM classes WHERE id = $1', [classId]);
        const { name: courseName, section } = classNameRes.rows[0];

        const studentsRes = await query(`
            SELECT id, enrollment_no, erp_id, user_id 
            FROM students 
            WHERE course_year = $1 AND section = $2
            ORDER BY enrollment_no ASC
        `, [courseName, section]);

        const students = studentsRes.rows;

        // 3. Fetch All Sessions for this Timetable Slot
        const sessionsRes = await query(`
            SELECT id, start_time 
            FROM attendance_sessions 
            WHERE timetable_id = $1 
            ORDER BY start_time ASC
        `, [timetableId]);
        
        const sessions = sessionsRes.rows;
        const totalSessions = sessions.length;

        // 4. Fetch All Attendance Records for these Sessions
        // We do a single query for efficiency
        const recordsRes = await query(`
            SELECT student_id, session_id, status
            FROM attendance_records
            WHERE session_id IN (SELECT id FROM attendance_sessions WHERE timetable_id = $1)
        `, [timetableId]);

        const records = recordsRes.rows;

        // 5. Aggregate Data
        // Map: student_id -> { present: 0, absent: 0, sessions: { sessionId: status } }
        const studentMap: any = {};

        // Expand students with user names
        for (const student of students) {
             const userRes = await query('SELECT full_name FROM users WHERE id = $1', [student.user_id]);
             const name = userRes.rows[0]?.full_name || 'Unknown';
             
             studentMap[student.id] = {
                 id: student.id,
                 name: name,
                 enrollment_no: student.enrollment_no,
                 total_present: 0,
                 total_absent: 0, // Will be calculated as Total Sessions - Present
                 percentage: 0
             };
        }

        records.forEach((r: any) => {
            if (studentMap[r.student_id]) {
                if (r.status === 'Present') {
                    studentMap[r.student_id].total_present++;
                }
            }
        });

        // Calculate final stats
        const reportData = Object.values(studentMap).map((s: any) => {
            const absent = totalSessions - s.total_present;
            const percentage = totalSessions > 0 ? ((s.total_present / totalSessions) * 100).toFixed(1) : '0.0';
            return {
                ...s,
                total_absent: absent,
                total_sessions: totalSessions,
                percentage: percentage
            };
        });

        return NextResponse.json({
            meta: classDetails.rows[0],
            data: reportData
        });

    } catch (error: any) {
        console.error("Report API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
