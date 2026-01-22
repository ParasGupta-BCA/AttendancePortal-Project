import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { rpID, origin, getUserAuthenticators } from '@/lib/webauthn';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
    const { email, verificationResponse } = await req.json();

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const challenge = cookieStore.get('auth_challenge')?.value;

    if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 400 });
    }

    // Find user
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userRes.rows[0];
    const userAuthenticators = await getUserAuthenticators(user.id);
    const authenticator = userAuthenticators.find(auth => auth.credentialID === verificationResponse.id);

    if (!authenticator) {
        return NextResponse.json({ error: 'Authenticator not registered' }, { status: 400 });
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: verificationResponse,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                ...authenticator,
                credentialPublicKey: new Uint8Array(authenticator.credentialPublicKey),
                credentialID: new Uint8Array(authenticator.credentialID as any),
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    if (verification.verified) {
        cookieStore.delete('auth_challenge');

        // Update counter
        await query('UPDATE authenticators SET counter = $1, last_used_at = NOW() WHERE credential_id = $2',
            [verification.authenticationInfo.newCounter, Buffer.from(verificationResponse.id).toString('base64url')]
        );

        // Generate a temporary signed token for next-auth to consume
        // Token = base64(json) + '.' + hmac
        const payload = JSON.stringify({ email: user.email, exp: Date.now() + 60000 }); // 1 min validity
        const payloadB64 = Buffer.from(payload).toString('base64');
        const secret = process.env.NEXTAUTH_SECRET || 'secret';
        const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');
        const token = `${payloadB64}.${signature}`;

        return NextResponse.json({ verified: true, token });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
}
