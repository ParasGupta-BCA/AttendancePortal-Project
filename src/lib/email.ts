import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export const sendEmail = async (to: string | string[], subject: string, html: string) => {
    try {
        const mailOptions = {
            from: `"Attendance Portal" <${process.env.GMAIL_USER}>`,
            to: Array.isArray(to) ? to.join(',') : to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

// Import template function (we need to dynamically import or move it to same file to avoid circular deps if any, but they are separate modules so it's fine)
import { getAnnouncementEmailHtml } from './email-templates';

export const sendAnnouncementEmail = async (bcc: string[], title: string, content: string, category: string) => {
    // For announcements, we use BCC to hide recipient emails
    try {
        if (bcc.length === 0) return;

        const html = getAnnouncementEmailHtml(title, content, category);

        const mailOptions = {
            from: `"Attendance Portal" <${process.env.GMAIL_USER}>`,
            bcc: bcc, // Blind Carbon Copy
            subject: `📢 ${title}`,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Announcement sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending announcement:', error);
        return { success: false, error };
    }
};
