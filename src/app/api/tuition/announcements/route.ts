import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Supabase announcements schema:
// id, title, content, target_audience, created_at, expires_at, created_by, institution_id
// Note: no category, priority, or image_data columns in Supabase

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const res = await query(`
            SELECT 
                a.id, a.title, a.content, a.target_audience,
                a.created_at, a.expires_at, a.created_by,
                u.full_name as author_name,
                a.target_audience as category,
                'Normal' as priority,
                NULL as image_data,
                NULL as event_date
            FROM announcements a
            LEFT JOIN users u ON a.created_by = u.id
            WHERE a.institution_id = $1
            ORDER BY a.created_at DESC
        `, [institutionId]);

        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;
        const userId = (session.user as any).id;

        const { title, content, category, event_date } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Map category → target_audience, event_date → expires_at if provided
        const targetAudience = category || 'General';
        const expiresAt = event_date ? new Date(event_date) : null;

        const res = await query(`
            INSERT INTO announcements (title, content, target_audience, expires_at, created_by, institution_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [title, content, targetAudience, expiresAt, userId || null, institutionId]);

        return NextResponse.json({ success: true, id: res.rows[0].id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
