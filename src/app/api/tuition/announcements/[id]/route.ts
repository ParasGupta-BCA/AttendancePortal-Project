import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;
        const { id } = await context.params;

        const { title, content, category, event_date } = await request.json();

        const targetAudience = category || 'General';
        const expiresAt = event_date ? new Date(event_date) : null;

        await query(`
            UPDATE announcements
            SET title = $1, content = $2, target_audience = $3, expires_at = $4
            WHERE id = $5 AND institution_id = $6
        `, [title, content, targetAudience, expiresAt, id, institutionId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;
        const { id } = await context.params;

        await query(`DELETE FROM announcements WHERE id = $1 AND institution_id = $2`, [id, institutionId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
