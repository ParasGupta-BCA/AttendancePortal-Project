import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'faculty') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        // 1. Init: Fetch available classes (sections) and subjects
        if (type === 'init') {
            const userId = (session.user as any).id;

            // Get Faculty ID
            const facultyRes = await query('SELECT id FROM faculty WHERE user_id = $1', [userId]);
            if ((facultyRes.rowCount ?? 0) === 0) {
                return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
            }
            const facultyId = facultyRes.rows[0].id;

            // Fetch Classes assigned to this faculty
            const classesRes = await query(`
                SELECT DISTINCT c.name, c.section 
                FROM classes c
                JOIN timetable t ON c.id = t.class_id
                WHERE t.faculty_id = $1
                ORDER BY c.name, c.section
            `, [facultyId]);

            // Fetch Subjects assigned to this faculty
            const subjectsRes = await query(`
                SELECT DISTINCT s.id, s.name, s.code 
                FROM subjects s
                JOIN timetable t ON s.id = t.subject_id
                WHERE t.faculty_id = $1
                ORDER BY s.name
            `, [facultyId]);

            return NextResponse.json({
                classes: classesRes.rows,
                subjects: subjectsRes.rows
            });
        }

        // 2. Fetch Students for a specific class/section
        if (type === 'students') {
            const className = searchParams.get('class');
            const section = searchParams.get('section');
            const subjectId = searchParams.get('subjectId');
            const dateStr = searchParams.get('date'); // YYYY-MM-DD

            if (!className || !section || !subjectId || !dateStr) {
                return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
            }

            // A. Get Students in that class
            const studentsRes = await query(`
                SELECT s.id, s.enrollment_no, u.full_name
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.course_year = $1 AND s.section = $2
                ORDER BY u.full_name
            `, [className, section]);

            // B. Check if there's already an attendance session for this Subject + Class + Date
            // We need to find the timetable entry first to match correctly, 
            // OR we just look for a session linked to a timetable entry that matches this subject/class on this day.

            // Allow manual attendance for ANY timetable slot of this subject on this day
            const date = new Date(dateStr);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

            const timetableRes = await query(`
                SELECT t.id FROM timetable t
                JOIN classes c ON t.class_id = c.id
                WHERE c.name = $1 AND c.section = $2
                AND t.subject_id = $3
                AND t.day_of_week = $4
            `, [className, section, subjectId, dayOfWeek]);

            let attendanceMap: any = {};

            if (timetableRes.rowCount && timetableRes.rowCount > 0) {
                // If multiple slots exist for the same subject same day, we might have an issue.
                // For simplicity, we'll take the first one or try to merge.
                // Ideal: Let user pick slot. For now: Assume first slot or aggregate.
                const timetableId = timetableRes.rows[0].id;

                const sessionRes = await query(`
                    SELECT id FROM attendance_sessions 
                    WHERE timetable_id = $1 
                    AND created_at::date = $2::date
                `, [timetableId, dateStr]);

                if (sessionRes.rowCount && sessionRes.rowCount > 0) {
                    const sessionId = sessionRes.rows[0].id;
                    const recordsRes = await query(`
                        SELECT student_id, status FROM attendance_records WHERE session_id = $1
                    `, [sessionId]);

                    recordsRes.rows.forEach((row) => {
                        attendanceMap[row.student_id] = row.status;
                    });
                }
            }

            return NextResponse.json({
                students: studentsRes.rows.map(s => ({
                    ...s,
                    status: attendanceMap[s.id] || 'Absent' // Default to Absent if no record
                }))
            });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error: any) {
        console.error("Manual Attendance API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'faculty') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { className, section, subjectId, date, attendance } = body;
        // attendance: { studentId: 'Present' | 'Absent' }

        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        // 1. Find Timetable Entry
        const timetableRes = await query(`
            SELECT t.id FROM timetable t
            JOIN classes c ON t.class_id = c.id
            WHERE c.name = $1 AND c.section = $2
            AND t.subject_id = $3
            AND t.day_of_week = $4
        `, [className, section, subjectId, dayOfWeek]);

        if (timetableRes.rowCount === 0) {
            return NextResponse.json({ error: 'No timetable slot found for this subject on the selected date.' }, { status: 404 });
        }
        const timetableId = timetableRes.rows[0].id;

        // 2. Find or Create Session
        let sessionId;
        const sessionRes = await query(`
            SELECT id FROM attendance_sessions 
            WHERE timetable_id = $1 
            AND created_at::date = $2::date
        `, [timetableId, date]);

        if (sessionRes.rowCount && sessionRes.rowCount > 0) {
            sessionId = sessionRes.rows[0].id;
        } else {
            // Create new "Manual" session
            // We set end_time to now + 1 hour just to have a valid range, or matches class time
            const newSessionRes = await query(`
                INSERT INTO attendance_sessions (timetable_id, faculty_id, start_time, end_time, qr_code, is_active, created_at)
                VALUES ($1, $2, $3::timestamp, $3::timestamp + interval '1 hour', 'MANUAL', FALSE, $3::timestamp)
                RETURNING id
            `, [timetableId, (session.user as any).id, date + ' 12:00:00']); // Hacky time, but date matters
            sessionId = newSessionRes.rows[0].id;
        }

        // 3. Upsert Attendance Records
        const queries = Object.entries(attendance).map(([studentId, status]) => {
            if (status === 'Present') {
                return query(`
                    INSERT INTO attendance_records (session_id, student_id, status, marked_at)
                    VALUES ($1, $2, 'Present', NOW())
                    ON CONFLICT (session_id, student_id) 
                    DO UPDATE SET status = 'Present', marked_at = NOW()
                `, [sessionId, studentId]);
            } else {
                // If marked Absent, remove record or update to Absent?
                // Usually we just delete the 'Present' record or set to 'Absent'
                return query(`
                    INSERT INTO attendance_records (session_id, student_id, status, marked_at)
                    VALUES ($1, $2, 'Absent', NOW())
                    ON CONFLICT (session_id, student_id) 
                    DO UPDATE SET status = 'Absent', marked_at = NOW()
                `, [sessionId, studentId]);
            }
        });

        await Promise.all(queries);

        return NextResponse.json({ success: true, message: 'Attendance saved successfully' });

    } catch (error: any) {
        console.error("Manual Attendance Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
