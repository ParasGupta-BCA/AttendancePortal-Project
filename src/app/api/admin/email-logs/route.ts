import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Fetch logs
        const logsRes = await query(`
            SELECT id, recipient_email, subject, status, error_message, sent_at, body, context, retry_count
            FROM email_logs 
            ORDER BY sent_at DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        // Fetch total count for pagination
        const countRes = await query('SELECT COUNT(*) FROM email_logs');
        const total = parseInt(countRes.rows[0].count, 10);

        return NextResponse.json({
            logs: logsRes.rows,
            total,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error: any) {
        console.error("Fetch Email Logs Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
