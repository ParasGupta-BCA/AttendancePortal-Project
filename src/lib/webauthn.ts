import { query } from "@/lib/db";
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server';
// Define interface locally to avoid dependency issues
export interface AuthenticatorDevice {
    credentialID: Buffer;
    credentialPublicKey: Buffer;
    counter: bigint;
    transports?: string[];
}

export const rpName = 'Student Portal';
// Prioritize environment variable, then hardcoded domain, then localhost
export const rpID = process.env.RP_ID || 'attendance-portal-liard.vercel.app';
export const origin = process.env.NODE_ENV === 'development' ? `http://${rpID}:3000` : `https://${rpID}`;

export async function getUserAuthenticators(userId: string): Promise<AuthenticatorDevice[]> {
    const res = await query('SELECT * FROM authenticators WHERE user_id = $1', [userId]);
    return res.rows.map(row => ({
        credentialID: Buffer.from(row.credential_id, 'base64url'), // Convert back to Buffer if needed, simplified types here
        credentialPublicKey: Buffer.from(row.credential_public_key, 'base64url'),
        counter: BigInt(row.counter),
        transports: row.transports ? row.transports.split(',') : undefined,
    } as any)); // Type casting for simplicity with SimpleWebAuthn
}

export async function saveAuthenticator(userId: string, verificationFn: any) {
    const { registrationInfo } = verificationFn;
    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo!;
    const { id, publicKey, counter } = credential;

    // Save as Base64URL strings
    // id is already a Base64URL string in V13
    const credentialIDStr = id;
    // publicKey is Uint8Array, convert to Base64URL
    const credentialPublicKeyStr = Buffer.from(publicKey).toString('base64url');

    await query(
        `INSERT INTO authenticators (credential_id, credential_public_key, counter, credential_device_type, credential_backed_up, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [credentialIDStr, credentialPublicKeyStr, Number(counter), credentialDeviceType, credentialBackedUp, userId]
    );
}
