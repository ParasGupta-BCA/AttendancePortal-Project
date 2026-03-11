import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tenantQuery as query } from '@/lib/db-tenant';
import { sendEmail } from '@/lib/email';
import { getAnnouncementEmailHtml } from '@/lib/email-templates'; // Reusing announcement template for generic style

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const body = await req.json();
        const { recipientType, className, studentEmail, subject, content } = body;

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and Content are required.' }, { status: 400 });
        }

        let recipients: string[] = [];

        if (recipientType === 'all') {
            const res = await query(`SELECT email FROM users WHERE LOWER(role) = 'student' AND institution_id = $1`, [institutionId]);
            console.log("All Students Query Result:", res.rows.length);

            if (res.rows.length === 0) {
                const debugRes = await query('SELECT role, COUNT(*) FROM users WHERE institution_id = $1 GROUP BY role', [institutionId]);
                console.log("Debug Roles in DB:", debugRes.rows);
            }

            recipients = res.rows.map(r => r.email).filter(Boolean);
        } else if (recipientType === 'single') {
            if (!studentEmail) return NextResponse.json({ error: 'Student email is required.' }, { status: 400 });
            recipients = [studentEmail];
        } else if (recipientType === 'class') {
            // This is tricky because "Class Name" search needs to match carefully.
            // We'll search for students who match the course_year (e.g. "BCA VI") provided.
            // A precise text match for now.
            if (!className) return NextResponse.json({ error: 'Class name is required.' }, { status: 400 });

            const res = await query(`
                SELECT u.email 
                FROM users u
                JOIN students s ON u.id = s.user_id
                WHERE (s.course_year ILIKE $1 OR s.section ILIKE $1) AND u.institution_id = $2
            `, [`%${className}%`, institutionId]);
            recipients = res.rows.map(r => r.email).filter(Boolean);
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients found for the selected criteria.' }, { status: 404 });
        }

        // 2. Prepare HTML
        // Reusing the announcement/generic template style for consistency
        const html = getAnnouncementEmailHtml(subject, content, "Admin Notification");

        // 3. Send Emails
        // Use BCC for bulk to save API calls/time if generic, OR simple loop if personalized.
        // For admin blast, BCC is fine and efficient.

        // However, nodemailer sendMail with giant generic strings might be limited by some SMTP.
        // Gmail limit is 500/day.

        // We'll send as one BCC batch if under 50, otherwise loop in chunks.
        // For simplicity:

        await sendEmail(recipients, subject, html);

        return NextResponse.json({ success: true, count: recipients.length });
    } catch (error: any) {
        console.error("Admin Email Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
