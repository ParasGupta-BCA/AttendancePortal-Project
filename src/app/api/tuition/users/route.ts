import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const res = await query(`
      SELECT id, full_name, email, role, created_at 
      FROM users 
      WHERE institution_id = $1
      ORDER BY created_at DESC
    `, [institutionId]);
        return NextResponse.json({ users: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { userId, newRole } = await request.json();

        if (!['admin', 'faculty', 'student'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        await query('UPDATE users SET role = $1 WHERE id = $2 AND institution_id = $3', [newRole, userId, institutionId]);

        // If making Faculty, check if profile exists, if not create dummy one? 
        // For now, we assume basic role switch. 
        // In a full app, you'd trigger profile creation wizards. 
        // Here we just fix the role.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
