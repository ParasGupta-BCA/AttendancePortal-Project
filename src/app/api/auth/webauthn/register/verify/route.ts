import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { rpID, origin, saveAuthenticator } from '@/lib/webauthn';
import { cookies } from 'next/headers';

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
        await saveAuthenticator((session.user as any).id, verification);
        cookieStore.delete('reg_challenge');
        return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });
}
