import { NextResponse } from 'next/server';
import { tenantQuery as query } from '@/lib/db-tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Supabase schema: no `attendance_settings` table.
// Settings are stored in institutions.settings (JSONB column).

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        // Read settings from the institutions.settings JSONB column
        const res = await query(`SELECT settings FROM institutions WHERE id = $1`, [institutionId]);
        const settings = res.rows[0]?.settings || {};

        return NextResponse.json({
            campus_lat: settings.campus_lat || '',
            campus_long: settings.campus_long || '',
            allowed_radius_meters: settings.allowed_radius_meters || '100',
            qr_refresh_interval: settings.qr_refresh_interval || '5',
        });
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

        // Merge into the existing settings JSONB
        const updates: Record<string, string> = {};
        if (campus_lat !== undefined) updates.campus_lat = String(campus_lat);
        if (campus_long !== undefined) updates.campus_long = String(campus_long);
        if (allowed_radius_meters !== undefined) updates.allowed_radius_meters = String(allowed_radius_meters);
        if (qr_refresh_interval !== undefined) updates.qr_refresh_interval = String(qr_refresh_interval);

        await query(
            `UPDATE institutions SET settings = settings || $1::jsonb WHERE id = $2`,
            [JSON.stringify(updates), institutionId]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
