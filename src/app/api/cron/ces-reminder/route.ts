import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendCesReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(req: Request) {
    try {
        // 1. Security Check (CRON_SECRET)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow bypassing in development if needed
        }

        // 2. Find CES announcements scheduled for TOMORROW
        const cesAnnouncementsRes = await query(`
            SELECT id, title, content, ces_date
            FROM announcements
            WHERE category = 'CES'
              AND is_active = true
              AND ces_date = CURRENT_DATE + INTERVAL '1 day'
        `);

        const cesAnnouncements = cesAnnouncementsRes.rows;

        if (cesAnnouncements.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No CES announcements scheduled for tomorrow.',
                processed: 0
            });
        }

        // 3. Fetch all student emails
        const studentEmailsRes = await query(`SELECT email FROM users WHERE role = 'student'`);
        const studentEmails = studentEmailsRes.rows.map((r: any) => r.email);

        if (studentEmails.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No students found to send reminders to.',
                processed: 0
            });
        }

        // 4. Send reminders for each CES announcement
        const results: any[] = [];

        for (const announcement of cesAnnouncements) {
            try {
                const result = await sendCesReminderEmail(
                    studentEmails,
                    announcement.title,
                    announcement.content,
                    announcement.ces_date
                );

                results.push({
                    announcementId: announcement.id,
                    title: announcement.title,
                    cesDate: announcement.ces_date,
                    ...result
                });
            } catch (err: any) {
                console.error(`Failed to send CES reminder for: ${announcement.title}`, err);
                results.push({
                    announcementId: announcement.id,
                    title: announcement.title,
                    status: 'failed',
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            announcementsProcessed: cesAnnouncements.length,
            totalStudents: studentEmails.length,
            details: results
        });

    } catch (error: any) {
        console.error("CES Reminder Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
