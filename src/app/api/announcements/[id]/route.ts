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
