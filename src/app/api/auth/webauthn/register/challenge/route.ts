import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path if needed
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { rpName, getRpID, getUserAuthenticators } from '@/lib/webauthn';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAuthenticators = await getUserAuthenticators((session.user as any).id);
    const rpID = getRpID(req);

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new TextEncoder().encode((session.user as any).id),
        userName: session.user.email || 'User',
        attestationType: 'none',
        excludeCredentials: userAuthenticators.map(auth => ({
            id: auth.credentialID.toString('base64url'),
            type: 'public-key',
            transports: auth.transports as any,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            // authenticatorAttachment: 'platform', // Removed to allow all types (USB, etc.)
        },
    });

    const cookieStore = await cookies();
    cookieStore.set('reg_challenge', options.challenge, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

    return NextResponse.json(options);
}
