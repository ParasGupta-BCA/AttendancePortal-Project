import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            `SELECT a.*, u.full_name as author_name,
             CASE WHEN av.viewed_at IS NOT NULL THEN true ELSE false END as is_read
             FROM announcements a 
             LEFT JOIN users u ON a.created_by = u.id 
             LEFT JOIN announcement_views av ON a.id = av.announcement_id AND av.user_id = $1
             WHERE a.is_active = true 
             ORDER BY a.created_at DESC`,
            [session.user.id]
        );

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch announcements:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || !['admin', 'faculty'].includes(session.user?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, category, priority, image_data } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate image size (approximate from base64 length)
        if (image_data && image_data.length > 700000) { // ~500KB limit
            return NextResponse.json({ error: 'Image too large. Max 500KB.' }, { status: 400 });
        }

        const result = await query(
            `INSERT INTO announcements (title, content, category, priority, image_data, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            // @ts-ignore
            [title, content, category, priority || 'Normal', image_data, session.user.id]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create announcement:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
