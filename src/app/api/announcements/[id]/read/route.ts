import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Expect params to be a Promise
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params; // Await params here

        // Check if announcement exists
        const announcementCheck = await query('SELECT id FROM announcements WHERE id = $1', [id]);
        if (announcementCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        // Insert into announcement_views (ignore if already exists)
        await query(
            `INSERT INTO announcement_views (announcement_id, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (announcement_id, user_id) DO NOTHING`,
            [id, (session.user as any).id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark announcement as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
