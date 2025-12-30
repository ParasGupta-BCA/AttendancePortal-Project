import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newEmail } = body;

        if (!currentPassword || !newEmail) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const userId = (session.user as any).id;

        // 1. Fetch current user data
        const res = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (res.rowCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const user = res.rows[0];

        // 2. Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash) || currentPassword === user.password_hash;

        if (!isValid) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // 3. Check if new email is taken
        const emailCheck = await query('SELECT id FROM users WHERE email = $1', [newEmail]);
        if (emailCheck.rowCount && emailCheck.rowCount > 0) {
            return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
        }

        // 4. Update Email
        await query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, userId]);

        return NextResponse.json({ success: true, message: 'Email updated successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
