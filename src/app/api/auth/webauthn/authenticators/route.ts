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

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const credentialId = searchParams.get('id');

    if (!credentialId) {
        return NextResponse.json({ error: 'Credential ID required' }, { status: 400 });
    }

    const { query } = require('@/lib/db');
    // We expect the credential ID to be sent exactly as it is stored (Base64URL string)
    await query(
        'DELETE FROM authenticators WHERE credential_id = $1 AND user_id = $2',
        [credentialId, (session.user as any).id]
    );

    return NextResponse.json({ success: true });
}
