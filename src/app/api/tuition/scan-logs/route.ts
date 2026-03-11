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

        // Supabase schema: attendance_records has marked_at, location_lat, location_long, status
        // No dedicated scan_logs table — use attendance_records joined with students + users
        const logs = await query(`
            SELECT 
                ar.id,
                ar.marked_at as created_at,
                ar.status as scan_status,
                ar.location_lat as latitude,
                ar.location_long as longitude,
                s.enrollment_no,
                u.full_name as student_name,
                0 as distance_meters
            FROM attendance_records ar
            LEFT JOIN students s ON ar.student_id = s.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE ar.institution_id = $1
            ORDER BY ar.marked_at DESC
            LIMIT 50
        `, [institutionId]);

        return NextResponse.json({ logs: logs.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
