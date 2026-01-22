import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserAuthenticators } from '@/lib/webauthn';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await getUserAuthenticators((session.user as any).id);

    // We need to fetch the raw rows to get the device type as getUserAuthenticators simplifies it
    // Actually, let's just update getUserAuthenticators to return it or fetch directly here for simplicity
    // Since getUserAuthenticators returns specific type, let's just query db directly here for the metadata

    // Re-query to get metadata not in AuthenticatorDevice interface
    const { query } = require('@/lib/db');
    const dbRes = await query('SELECT credential_id, credential_device_type, credential_backed_up FROM authenticators WHERE user_id = $1', [(session.user as any).id]);

    return NextResponse.json(dbRes.rows.map((row: any) => ({
        id: Buffer.from(row.credential_id, 'base64url').toString('base64url'),
        device_type: row.credential_backed_up ? 'Synced Passkey (iCloud/Google)' : 'Hardware Key / Local Device',
        created_at: new Date().toISOString() // Still placeholder as we didn't add created_at column
    })));
}
