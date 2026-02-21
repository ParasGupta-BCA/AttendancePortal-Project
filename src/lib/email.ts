import nodemailer from 'nodemailer';
import { query } from '@/lib/db';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const DAILY_GLOBAL_LIMIT = 500;
const DAILY_STUDENT_LIMIT = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Helper to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Check Global Limit
async function checkGlobalRateLimit() {
    try {
        const res = await query(`
            SELECT COUNT(*) as count FROM email_logs 
            WHERE sent_at::date = CURRENT_DATE
        `);
        const count = parseInt(res.rows[0].count, 10);
        return count < DAILY_GLOBAL_LIMIT;
    } catch (error) {
        console.error("Error checking global rate limit:", error);
        return true; // Fail open to avoid blocking critical emails on db error
    }
}

// Helper: Check Student Limit
async function checkStudentRateLimit(email: string) {
    try {
        const res = await query(`
            SELECT COUNT(*) as count FROM email_logs 
            WHERE recipient_email = $1 AND sent_at::date = CURRENT_DATE
        `, [email]);
        const count = parseInt(res.rows[0].count, 10);
        return count < DAILY_STUDENT_LIMIT;
    } catch (error) {
        console.error("Error checking student rate limit:", error);
        return true;
    }
}

// Helper: Log Email (Returns ID)
async function logEmail(recipient: string, subject: string, body: string, status: string, error: string | null = null, context: string = 'Notification') {
    try {
        const res = await query(`
            INSERT INTO email_logs (recipient_email, subject, body, status, error_message, context, retry_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [recipient, subject, body, status, error, context, 0]);
        return res.rows[0]?.id;
    } catch (logError) {
        console.error("Failed to log email:", logError);
        return null;
    }
}

// Helper: Update Email Status
async function updateEmailStatus(id: string, status: string, error: string | null = null, retryCount: number = 0) {
    try {
        await query(`
            UPDATE email_logs 
            SET status = $1, error_message = $2, retry_count = $3
            WHERE id = $4
        `, [status, error, retryCount, id]);
    } catch (logError) {
        console.error("Failed to update email log:", logError);
    }
}

export const sendEmail = async (to: string | string[], subject: string, html: string, context: string = 'Notification') => {
    // Normalize 'to' to array for processing, but we mostly expect single emails for transactional
    const recipients = Array.isArray(to) ? to : [to];

    // Check Global Limit
    if (!(await checkGlobalRateLimit())) {
        console.warn("Global email limit reached.");
        return { success: false, error: "Global daily limit reached." };
    }

    const results = [];

    for (const recipient of recipients) {
        // Check Student Limit (if it looks like a student email or just per-recipient limit)
        if (!(await checkStudentRateLimit(recipient))) {
            console.warn(`Rate limit reached for ${recipient}`);
            await logEmail(recipient, subject, html, 'Skipped', 'Daily recipient limit reached', context);
            results.push({ recipient, success: false, error: "Recipient daily limit reached." });
            continue;
        }

        // 1. Log as Sending
        const logId = await logEmail(recipient, subject, html, 'Sending', null, context);

        let attempts = 0;
        let sent = false;
        let lastError: any = null;

        while (attempts < MAX_RETRIES && !sent) {
            try {
                attempts++;
                const mailOptions = {
                    from: `"Attendance Portal" <${process.env.GMAIL_USER}>`,
                    to: recipient,
                    subject,
                    html,
                };

                const info = await transporter.sendMail(mailOptions);
                console.log(`Message sent to ${recipient}: %s`, info.messageId);

                // 2. Update to Sent
                if (logId) await updateEmailStatus(logId, 'Sent', null, attempts - 1); // retry_count is attempts-1 if 1st try works
                results.push({ recipient, success: true, messageId: info.messageId });
                sent = true;

            } catch (error: any) {
                console.error(`Attempt ${attempts} failed for ${recipient}:`, error);
                lastError = error;
                if (attempts < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
            }
        }

        if (!sent) {
            // 3. Update to Failed
            const errorMsg = lastError?.message || "Unknown error";
            if (logId) await updateEmailStatus(logId, 'Failed', errorMsg, attempts);
            else await logEmail(recipient, subject, html, 'Failed', errorMsg, context); // Fallback if initial log failed

            results.push({ recipient, success: false, error: errorMsg });
        }
    }

    // Return aggregate success if all good, or partial
    const allSuccess = results.every(r => r.success);
    return { success: allSuccess, results };
};

// Import template function
import { getAnnouncementEmailHtml } from './email-templates';

export const sendAnnouncementEmail = async (bcc: string[], title: string, content: string, category: string) => {
    // For announcements, we use BCC. 
    // Logging BCC is tricky. We'll log a single entry "Multiple Recipients" or similar?
    // User requested "resend button". Resending a blast is weird.
    // We'll trust standard nodemailer for this simple version, but log the event.

    try {
        if (bcc.length === 0) return;

        const html = getAnnouncementEmailHtml(title, content, category);
        const subject = `📢 ${title}`;

        // Check Global Limit
        if (!(await checkGlobalRateLimit())) return { success: false, error: "Global limit reached" };

        const mailOptions = {
            from: `"Attendance Portal" <${process.env.GMAIL_USER}>`,
            bcc: bcc,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Announcement sent: %s', info.messageId);

        // We can't log per-user easily here without cluttering. 
        // Maybe log one entry for "admin@portal.com" or similar to show it happened?
        // Or loop? Looping 500 emails is slow but accurate.
        // Let's stick to simple send for announcement for now to not break existing flow perf.

        // Log generic entry
        await logEmail('Multiple (Announcement)', subject, html, 'Sent', null, category);

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('Error sending announcement:', error);
        await logEmail('Multiple (Announcement)', `📢 ${title}`, 'HTML Content', 'Failed', error.message, category);
        return { success: false, error };
    }
};

// Import reminder template
import { getReminderEmailHtml } from './email-templates';

export const sendReminderEmail = async (emails: string[], title: string, content: string, category: string, eventDate: string) => {
    try {
        if (emails.length === 0) return { success: true, sent: 0 };

        const html = getReminderEmailHtml(title, content, category, eventDate);
        const subject = `${category} Tomorrow: ${title}`;

        // Check Global Limit
        if (!(await checkGlobalRateLimit())) return { success: false, error: "Global limit reached" };

        let sentCount = 0;
        const errors: string[] = [];

        // Send to each student individually for proper logging
        for (const email of emails) {
            try {
                const result = await sendEmail(email, subject, html, `${category} Reminder`);
                if (result.success) {
                    sentCount++;
                } else {
                    errors.push(`${email}: ${result.error || 'Unknown error'}`);
                }
            } catch (err: any) {
                console.error(`Failed to send ${category} reminder to ${email}:`, err);
                errors.push(`${email}: ${err.message}`);
            }
        }

        console.log(`${category} Reminder sent to ${sentCount}/${emails.length} students`);
        return { success: sentCount > 0, sent: sentCount, total: emails.length, errors };
    } catch (error: any) {
        console.error(`Error sending ${category} reminders:`, error);
        return { success: false, error: error.message };
    }
};
