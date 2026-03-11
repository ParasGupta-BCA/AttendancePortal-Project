import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tenantQuery as query } from '@/lib/db-tenant';
import { sendEmail } from '@/lib/email';
import { getAttendanceReportEmailHtml } from '@/lib/email-templates';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const body = await req.json();
        const { studentId } = body;

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
        }

        // 1. Fetch Student Details
        const studentRes = await query(`
            SELECT u.email, u.full_name 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1 AND u.institution_id = $2
        `, [studentId, institutionId]);

        if (studentRes.rowCount === 0) {
            return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
        }

        const { email, full_name } = studentRes.rows[0];

        // 2. Calculate Attendance Stats
        // Total Classes = All finalized sessions for this student's class
        // Present = Count of 'Present' records

        // Simpler approach: Count records in attendance_records table for this student.
        // Assuming every finalized session creates an 'Absent' or 'Present' record for every student via the finalize script.
        // If your finalize script works correctly, every student has a record for every finalized session.

        const statsRes = await query(`
            SELECT 
                COUNT(*) as total_classes,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_classes
            FROM attendance_records
            WHERE student_id = $1 AND institution_id = $2
        `, [studentId, institutionId]);

        const totalClasses = parseInt(statsRes.rows[0].total_classes || '0');
        const presentClasses = parseInt(statsRes.rows[0].present_classes || '0');

        let percentage = 0;
        if (totalClasses > 0) {
            percentage = Math.round((presentClasses / totalClasses) * 100);
        }

        // 3. Generate Email
        const html = getAttendanceReportEmailHtml(full_name, totalClasses, presentClasses, percentage);

        // 4. Send Email
        await sendEmail([email], `Attendance Report: ${percentage}% Overall`, html);

        return NextResponse.json({
            success: true,
            data: {
                student: full_name,
                email: email,
                total: totalClasses,
                present: presentClasses,
                percentage: percentage
            }
        });

    } catch (error: any) {
        console.error("Attendance Report API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
