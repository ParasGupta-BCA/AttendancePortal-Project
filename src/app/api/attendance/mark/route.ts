import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized. Only students can mark attendance.' }, { status: 401 });
        }

        const { qr_code, lat, long } = await request.json();

        if (!qr_code) {
            return NextResponse.json({ error: 'Missing QR Code' }, { status: 400 });
        }

        // 1. Find Session by QR Code (Active or Expired)
        const sessionRes = await query(`
      SELECT * FROM attendance_sessions 
      WHERE qr_code = $1 
      AND is_active = TRUE 
    `, [qr_code]);

        if (sessionRes.rowCount === 0) {
            return NextResponse.json({ error: 'Invalid QR Code' }, { status: 400 });
        }

        const attendanceSession = sessionRes.rows[0];

        // CHECK EXPIRATION
        // We use the database timestamp comparison for accuracy
        const timeCheck = await query(`SELECT NOW() > $1 as is_expired`, [attendanceSession.end_time]);
        if (timeCheck.rows[0].is_expired) {
            return NextResponse.json({
                error: 'Attendance period is over. Please contact faculty.'
            }, { status: 400 });
        }

        // 2. Check if student already marked
        const studentId = (session.user as any).id;
        // We need the ACTUAL student_id from 'students' table, not 'users' table id.
        // My schema has students.user_id -> users.id. 
        // Auth session provides users.id. I should fetch student profile.

        // Fetch Student Profile
        const studentRes = await query('SELECT id FROM students WHERE user_id = $1', [studentId]);
        if (studentRes.rowCount === 0) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }
        const actualStudentId = studentRes.rows[0].id;

        const existingRecord = await query(`
      SELECT id FROM attendance_records 
      WHERE session_id = $1 AND student_id = $2
    `, [attendanceSession.id, actualStudentId]);

        if ((existingRecord.rowCount || 0) > 0) {
            return NextResponse.json({ message: 'Attendance already marked' }, { status: 200 }); // Idempotent success
        }

        // 3. Mark Attendance
        await query(`
      INSERT INTO attendance_records (session_id, student_id, status, marked_at)
      VALUES ($1, $2, 'Present', NOW())
    `, [attendanceSession.id, actualStudentId]);

        return NextResponse.json({ success: true, message: 'Attendance Marked Successfully' });

    } catch (error: any) {
        console.error('Mark Attendance Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
