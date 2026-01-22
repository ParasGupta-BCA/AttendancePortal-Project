import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;

        // Fetch last 10 login records
        const result = await query(
            `SELECT id, device_info, ip_address, login_at 
             FROM login_history 
             WHERE user_id = $1 
             ORDER BY login_at DESC 
             LIMIT 10`,
            [userId]
        );

        return NextResponse.json({ history: result.rows });
    } catch (error) {
        console.error('Failed to fetch login history:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
