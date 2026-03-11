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

        const { name, code, semester, type } = await request.json();
        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
        }

        // Check duplicate code (excluding current subject)
        const existing = await query(
            'SELECT id FROM subjects WHERE code = $1 AND institution_id = $2 AND id != $3',
            [code, institutionId, id]
        );
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Subject code already in use' }, { status: 409 });
        }

        await query(
            'UPDATE subjects SET name = $1, code = $2, semester = $3, type = $4 WHERE id = $5 AND institution_id = $6',
            [name, code, semester || null, type || 'Theory', id, institutionId]
        );
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

        await query('DELETE FROM subjects WHERE id = $1 AND institution_id = $2', [id, institutionId]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
