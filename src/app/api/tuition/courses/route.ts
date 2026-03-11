import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const result = await query('SELECT * FROM courses WHERE institution_id = $1 ORDER BY name ASC', [institutionId]);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { name } = await req.json();
        if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

        const result = await query(
            'INSERT INTO courses (name, institution_id) VALUES ($1, $2) RETURNING *',
            [name, institutionId]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ message: 'Course already exists' }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });

        await query('DELETE FROM courses WHERE id = $1 AND institution_id = $2', [id, institutionId]);
        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
