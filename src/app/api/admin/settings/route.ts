import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await query(`
            SELECT key, value FROM attendance_settings 
            WHERE key IN ('campus_lat', 'campus_long', 'allowed_radius_meters', 'qr_refresh_interval')
        `);

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
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { campus_lat, campus_long, allowed_radius_meters, qr_refresh_interval } = await request.json();

        // Upsert 3 values
        const upsert = `
            INSERT INTO attendance_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;

        await query('BEGIN');
        if (campus_lat) await query(upsert, ['campus_lat', String(campus_lat)]);
        if (campus_long) await query(upsert, ['campus_long', String(campus_long)]);
        if (allowed_radius_meters) await query(upsert, ['allowed_radius_meters', String(allowed_radius_meters)]);
        if (qr_refresh_interval) await query(upsert, ['qr_refresh_interval', String(qr_refresh_interval)]);
        await query('COMMIT');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        await query('ROLLBACK');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
