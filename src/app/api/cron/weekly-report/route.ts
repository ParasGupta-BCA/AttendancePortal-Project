import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getAttendanceReportEmailHtml } from '@/lib/email-templates';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(req: Request) {
    try {
        // 1. Security Check (CRON_SECRET)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow bypassing in development if needed, or strictly enforce
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Students who need a report
        // Logic: Students active in the last 7 days OR haven't received a report in > 6 days
        // To be safe, we just check everyone who hasn't had a report sent in the last 6 days.
        // We limit to 50 to avoid Serverless Function timeouts on Vercel (Hobby plan = 10s limit).
        // If you have > 50 students, this might need to run more frequently or use a queue.

        const studentsRes = await query(`
            SELECT s.id, s.user_id, u.email, u.full_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.last_report_sent_at IS NULL 
               OR s.last_report_sent_at < NOW() - INTERVAL '6 days'
            LIMIT 50
        `);

        const students = studentsRes.rows;
        const results: any[] = [];

        // 3. Process each student
        // We use Promise.all to run in parallel, but limit concurrency if needed. 
        // For 50, Promise.all is usually fine with external SMTP services.

        await Promise.all(students.map(async (student) => {
            try {
                // A. Get Stats
                const statsRes = await query(`
                    SELECT 
                        COUNT(*) as total_classes,
                        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_classes
                    FROM attendance_records
                    WHERE student_id = $1
                `, [student.id]);

                const totalClasses = parseInt(statsRes.rows[0].total_classes || '0');
                const presentClasses = parseInt(statsRes.rows[0].present_classes || '0');

                let percentage = 0;
                if (totalClasses > 0) {
                    percentage = Math.round((presentClasses / totalClasses) * 100);
                }

                // If no classes ever, maybe skip sending report? 
                // Or send "0%" report? Let's send it so they know they have 0 attendance if applicable.

                // B. Generate HTML
                const html = getAttendanceReportEmailHtml(student.full_name, totalClasses, presentClasses, percentage);

                // C. Send Email
                await sendEmail([student.email], `Weekly Attendance Summary: ${percentage}%`, html);

                // D. Update DB Timestamp
                await query(`
                    UPDATE students 
                    SET last_report_sent_at = NOW() 
                    WHERE id = $1
                `, [student.id]);

                results.push({ email: student.email, status: 'sent' });

            } catch (err: any) {
                console.error(`Failed to send report to ${student.email}`, err);
                results.push({ email: student.email, status: 'failed', error: err.message });
            }
        }));

        return NextResponse.json({
            success: true,
            processed: students.length,
            details: results
        });

    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
