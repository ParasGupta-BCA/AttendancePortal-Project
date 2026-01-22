import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getRpID, getUserAuthenticators } from '@/lib/webauthn';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find user
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userRes.rows[0];

    // Get authenticators
    const userAuthenticators = await getUserAuthenticators(user.id);
    const rpID = getRpID(req);

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userAuthenticators.map(auth => ({
            id: auth.credentialID.toString('base64url'),
            type: 'public-key',
            transports: auth.transports as any,
        })),
        userVerification: 'preferred',
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_challenge', options.challenge, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return NextResponse.json(options);
}
