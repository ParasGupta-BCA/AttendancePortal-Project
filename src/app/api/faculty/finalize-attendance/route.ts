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

        // 1. Get Session Details & Timetable Info
        const sessionRes = await query(`
            SELECT s.timetable_id, s.start_time
            FROM attendance_sessions s
            WHERE s.id = $1
        `, [sessionId]);

        if (sessionRes.rowCount === 0) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const { timetable_id, start_time } = sessionRes.rows[0];

        // 2. Identify Missing Students
        // Find students who belong to this class/section but have NO record for this session
        const missingStudentsRes = await query(`
            SELECT s.id 
            FROM students s
            JOIN classes c ON s.course_year = c.name AND s.section = c.section
            JOIN timetable t ON t.class_id = c.id
            WHERE t.id = $1
            AND s.id NOT IN (
                SELECT student_id FROM attendance_records WHERE session_id = $2
            )
        `, [timetable_id, sessionId]);

        const missingStudentIds = missingStudentsRes.rows.map(r => r.id);

        // 3. Insert 'Absent' Records
        if (missingStudentIds.length > 0) {
            // We need a loop or unnest. For simplicity and driver support, let's use a loop or a giant INSERT.
            // Using a loop for safety with UUIDs, though batch insert is better.
            // Construction of batch insert:

            const values: any[] = [];
            const placeholders: string[] = [];

            // We use the Session Start Time as the marked_at time for consistency
            const markedAt = start_time;

            missingStudentIds.forEach((sid, index) => {
                const pIndex = index * 4; // 4 params per row
                placeholders.push(`($${pIndex + 1}, $${pIndex + 2}, $${pIndex + 3}, $${pIndex + 4})`);
                values.push(sessionId, sid, 'Absent', markedAt);
            });

            const queryText = `
                INSERT INTO attendance_records (session_id, student_id, status, marked_at)
                VALUES ${placeholders.join(', ')}
            `;

            await query(queryText, values);
        }

        // 4. Close the Session (Input: is_active = false)
        await query('UPDATE attendance_sessions SET is_active = FALSE WHERE id = $1', [sessionId]);

        return NextResponse.json({
            success: true,
            message: `Session finalized. ${missingStudentIds.length} students marked Absent.`
        });

    } catch (error: any) {
        console.error("Finalize Attendance Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
