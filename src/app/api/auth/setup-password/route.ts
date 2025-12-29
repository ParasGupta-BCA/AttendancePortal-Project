import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { newPassword } = body;

        if (!newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const userId = (session.user as any).id;
        const mustChange = (session.user as any).must_change_password;

        if (!mustChange) {
            return NextResponse.json({ error: "Password setup not required" }, { status: 400 });
        }

        // Hash new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Update Database: set new pass AND clear the flag
        await query('UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [newHashedPassword, userId]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
