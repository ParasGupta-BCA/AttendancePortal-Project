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

        const res = await query(`
            SELECT key, value FROM attendance_settings 
            WHERE key IN ('campus_lat', 'campus_long', 'allowed_radius_meters', 'qr_refresh_interval')
            AND institution_id = $1
        `, [institutionId]);

        // Convert array to object
        const settings = res.rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return NextResponse.json(settings);
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

        const { campus_lat, campus_long, allowed_radius_meters, qr_refresh_interval } = await request.json();

        // Since settings are tenant-specific, a standard ON CONFLICT (key) might fail if it's a global unique key.
        // Assuming (key, institution_id) is the unique constraint, or we can just do an UPDATE and if 0 rows, INSERT.
        // Let's do a safe UPSERT sequence.
        
        await query('BEGIN');
        
        const safeUpsert = async (k: string, v: string) => {
            const check = await query('SELECT 1 FROM attendance_settings WHERE key = $1 AND institution_id = $2', [k, institutionId]);
            if (check.rows.length > 0) {
                await query('UPDATE attendance_settings SET value = $1 WHERE key = $2 AND institution_id = $3', [v, k, institutionId]);
            } else {
                await query('INSERT INTO attendance_settings (key, value, institution_id) VALUES ($1, $2, $3)', [k, v, institutionId]);
            }
        };

        if (campus_lat) await safeUpsert('campus_lat', String(campus_lat));
        if (campus_long) await safeUpsert('campus_long', String(campus_long));
        if (allowed_radius_meters) await safeUpsert('allowed_radius_meters', String(allowed_radius_meters));
        if (qr_refresh_interval) await safeUpsert('qr_refresh_interval', String(qr_refresh_interval));
        
        await query('COMMIT');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        await query('ROLLBACK');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
