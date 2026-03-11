import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Supabase classes schema: id, subject_id, faculty_id, course_year, section, institution_id
// NO "name" column — uses course_year + section instead

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const result = await query(
            'SELECT * FROM classes WHERE institution_id = $1 ORDER BY course_year, section',
            [institutionId]
        );
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

        const { course_year, section } = await req.json();
        if (!course_year || !section) {
            return NextResponse.json({ message: 'Course Year and Section are required' }, { status: 400 });
        }

        // Check if this combination already exists
        const existing = await query(
            'SELECT * FROM classes WHERE course_year = $1 AND section = $2 AND institution_id = $3',
            [course_year, section, institutionId]
        );
        if (existing.rows.length > 0) {
            return NextResponse.json({ message: 'Class already exists' }, { status: 409 });
        }

        const result = await query(
            'INSERT INTO classes (course_year, section, institution_id) VALUES ($1, $2, $3) RETURNING *',
            [course_year, section, institutionId]
        );
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
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

        await query('DELETE FROM classes WHERE id = $1 AND institution_id = $2', [id, institutionId]);
        return NextResponse.json({ message: 'Class deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
