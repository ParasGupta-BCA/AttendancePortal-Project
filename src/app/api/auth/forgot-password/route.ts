import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getResetPasswordEmailHtml } from '@/lib/email-templates';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Check if user exists
        const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            // For security, don't reveal if email exists or not
            return NextResponse.json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
        }

        const userId = userRes.rows[0].id;

        // 2. Generate Token and Expiry (1 hour)
        const token = uuidv4();
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        // 3. Save to DB
        await query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [token, expires, userId]
        );

        // 4. Send Email
        const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
        const html = getResetPasswordEmailHtml(resetLink);

        await sendEmail([email], 'Reset Your Password', html);

        return NextResponse.json({ success: true, message: 'Reset link sent successfully.' });

    } catch (error: any) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
