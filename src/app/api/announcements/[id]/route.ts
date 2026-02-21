import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || !['admin', 'faculty'].includes(session.user?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Only allow deleting, or soft delete? User asked for "delete", but schema has is_active.
        // Let's do soft delete as per schema default valid query.

        await query(
            'UPDATE announcements SET is_active = false WHERE id = $1',
            [id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete announcement:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || !['admin', 'faculty'].includes(session.user?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, category, priority, image_data, event_date } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate event date is required for CES category
        if (category === 'CES' && !event_date) {
            return NextResponse.json({ error: 'Date is required for CES announcements' }, { status: 400 });
        }

        // Validate image size
        if (image_data && image_data.length > 700000) {
            return NextResponse.json({ error: 'Image too large. Max 500KB.' }, { status: 400 });
        }

        const result = await query(
            `UPDATE announcements 
             SET title = $1, content = $2, category = $3, priority = $4, image_data = $5, event_date = $6, updated_at = NOW()
             WHERE id = $7 AND is_active = true
             RETURNING *`,
            [title, content, category, priority || 'Normal', image_data, event_date || null, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update announcement:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
