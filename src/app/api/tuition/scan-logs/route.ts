import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const logs = await query(`
            SELECT 
                sl.*,
                s.enrollment_no,
                u.full_name as student_name
            FROM scan_logs sl
            LEFT JOIN students s ON sl.student_id = s.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE sl.institution_id = $1
            ORDER BY sl.created_at DESC
            LIMIT 50
        `, [institutionId]);

        return NextResponse.json({ logs: logs.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
