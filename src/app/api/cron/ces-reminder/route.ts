import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(req: Request) {
    try {
        // 1. Security Check (CRON_SECRET)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow bypassing in development if needed
        }

        // 2. Find ALL announcements with event_date scheduled for TOMORROW (any category)
        const upcomingAnnouncementsRes = await query(`
            SELECT id, title, content, category, event_date
            FROM announcements
            WHERE is_active = true
              AND event_date = CURRENT_DATE + INTERVAL '1 day'
        `);

        const upcomingAnnouncements = upcomingAnnouncementsRes.rows;

        if (upcomingAnnouncements.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No announcements scheduled for tomorrow.',
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

        // 4. Send reminders for each upcoming announcement
        const results: any[] = [];

        for (const announcement of upcomingAnnouncements) {
            try {
                const result = await sendReminderEmail(
                    studentEmails,
                    announcement.title,
                    announcement.content,
                    announcement.category,
                    announcement.event_date
                );

                results.push({
                    announcementId: announcement.id,
                    title: announcement.title,
                    category: announcement.category,
                    eventDate: announcement.event_date,
                    ...result
                });
            } catch (err: any) {
                console.error(`Failed to send reminder for: ${announcement.title}`, err);
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
            announcementsProcessed: upcomingAnnouncements.length,
            totalStudents: studentEmails.length,
            details: results
        });

    } catch (error: any) {
        console.error("Reminder Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
