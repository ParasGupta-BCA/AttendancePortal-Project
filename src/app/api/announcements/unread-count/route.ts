import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            `SELECT COUNT(*) as unread_count
             FROM announcements a
             LEFT JOIN announcement_views av ON a.id = av.announcement_id AND av.user_id = $1
             WHERE a.is_active = true AND av.viewed_at IS NULL`,
            [(session.user as any).id]
        );

        return NextResponse.json({ unread_count: parseInt(result.rows[0].unread_count) });
    } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
