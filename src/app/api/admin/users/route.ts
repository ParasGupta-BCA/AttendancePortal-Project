import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await query(`
      SELECT id, full_name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
        return NextResponse.json({ users: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, newRole } = await request.json();

        if (!['admin', 'faculty', 'student'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        await query('UPDATE users SET role = $1 WHERE id = $2', [newRole, userId]);

        // If making Faculty, check if profile exists, if not create dummy one? 
        // For now, we assume basic role switch. 
        // In a full app, you'd trigger profile creation wizards. 
        // Here we just fix the role.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
