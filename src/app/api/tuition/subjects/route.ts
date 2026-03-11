import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Supabase subjects schema: id, name, code, semester, type (Theory/Practical), institution_id

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const res = await query(
            'SELECT * FROM subjects WHERE institution_id = $1 ORDER BY code',
            [institutionId]
        );
        return NextResponse.json({ subjects: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { name, code, semester, type } = await req.json();
        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
        }

        // Check duplicate code
        const existing = await query(
            'SELECT id FROM subjects WHERE code = $1 AND institution_id = $2',
            [code, institutionId]
        );
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Subject code already exists' }, { status: 409 });
        }

        const res = await query(
            'INSERT INTO subjects (name, code, semester, type, institution_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, code, semester || null, type || 'Theory', institutionId]
        );
        return NextResponse.json({ subject: res.rows[0] }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
