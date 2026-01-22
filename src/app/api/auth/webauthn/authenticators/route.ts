import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserAuthenticators } from '@/lib/webauthn';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authenticators = await getUserAuthenticators((session.user as any).id);

    return NextResponse.json(authenticators.map(auth => ({
        id: auth.credentialID.toString('base64url'),
        // No confidential info returned, just metadata if we had it
        // We'll just return the ID and count for now
        last_used: new Date().toISOString(), // Placeholder as we don't fetch last_used yet
        device_type: 'Unknown Device' // We could store/fetch a friendly name in future
    })));
}
