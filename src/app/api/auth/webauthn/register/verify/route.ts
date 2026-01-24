import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getRpID, getOrigin, saveAuthenticator } from '@/lib/webauthn';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const cookieStore = await cookies();
    const challenge = cookieStore.get('reg_challenge')?.value;

    if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 400 });
    }

    let verification;
    try {
        const rpID = getRpID(req);
        const origin = getOrigin(req);

        verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;

        // Check if this credential ID already exists
        const existing = await query('SELECT 1 FROM authenticators WHERE credential_id = $1', [credential.id]);
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'This account passkey you have already registered.' }, { status: 400 });
        }

        await saveAuthenticator((session.user as any).id, verification);
        cookieStore.delete('reg_challenge');
        return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });
}
