import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'faculty'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // 1. Get Session Details & Timetable Info with Subject Name
        const sessionRes = await query(`
            SELECT s.timetable_id, s.start_time, sub.name as subject_name
            FROM attendance_sessions s
            JOIN timetable t ON s.timetable_id = t.id
            JOIN subjects sub ON t.subject_id = sub.id
            WHERE s.id = $1
        `, [sessionId]);

        if (sessionRes.rowCount === 0) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const { timetable_id, start_time, subject_name } = sessionRes.rows[0];

        // 2. Identify Missing Students
        // Find students who belong to this class/section but have NO 'Present' record for this Timetable Slot on this Date.
        const missingStudentsRes = await query(`
            SELECT s.id, u.email, u.full_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN classes c ON s.course_year = c.name AND s.section = c.section
            JOIN timetable t ON t.class_id = c.id
            WHERE t.id = $1
            AND s.id NOT IN (
                SELECT ar.student_id 
                FROM attendance_records ar
                JOIN attendance_sessions as_sess ON ar.session_id = as_sess.id
                WHERE as_sess.timetable_id = $1
                AND as_sess.start_time::date = $2::date
                AND ar.status = 'Present'
            )
            AND s.id NOT IN (
                 SELECT student_id FROM attendance_records WHERE session_id = $3
            )
        `, [timetable_id, start_time, sessionId]);

        const missingStudents = missingStudentsRes.rows; // Array of { id, email, full_name }

        // 3. Insert 'Absent' Records
        if (missingStudents.length > 0) {
            const values: any[] = [];
            const placeholders: string[] = [];
            const markedAt = start_time;

            missingStudents.forEach((student, index) => {
                const pIndex = index * 4;
                placeholders.push(`($${pIndex + 1}, $${pIndex + 2}, $${pIndex + 3}, $${pIndex + 4})`);
                values.push(sessionId, student.id, 'Absent', markedAt);
            });

            const queryText = `
                INSERT INTO attendance_records (session_id, student_id, status, marked_at)
                VALUES ${placeholders.join(', ')}
            `;

            await query(queryText, values);

            // --- Email Automation ---
            const { sendEmail } = await import('@/lib/email');
            const { getAttendanceEmailHtml } = await import('@/lib/email-templates');
            const { format } = await import('date-fns');
            const formattedDate = format(new Date(start_time), 'PPP');

            // Send emails in parallel
            // We use Promise.allSettled to ensure one failure doesn't stop the request
            await Promise.allSettled(missingStudents.map(student => {
                if (!student.email) return Promise.resolve();
                const html = getAttendanceEmailHtml(student.full_name, subject_name, formattedDate, 'Absent');
                return sendEmail(student.email, `Attendance Alert: Absent for ${subject_name}`, html);
            }));
            // ------------------------
        }

        // 4. Close the Session (Input: is_active = false)
        await query('UPDATE attendance_sessions SET is_active = FALSE WHERE id = $1', [sessionId]);

        return NextResponse.json({
            success: true,
            message: `Session finalized. ${missingStudents.length} students marked Absent and notified via email.`
        });

    } catch (error: any) {
        console.error("Finalize Attendance Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
