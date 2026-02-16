import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
        }

        // 1. Find user with valid token and not expired
        const userRes = await query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        const userId = userRes.rows[0].id;

        // 2. Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update Password and Clear Token
        await query(
            `UPDATE users 
             SET password_hash = $1, 
                 reset_token = NULL, 
                 reset_token_expires = NULL,
                 must_change_password = FALSE 
             WHERE id = $2`,
            [hashedPassword, userId]
        );

        return NextResponse.json({ success: true, message: 'Password reset successfully.' });

    } catch (error: any) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
