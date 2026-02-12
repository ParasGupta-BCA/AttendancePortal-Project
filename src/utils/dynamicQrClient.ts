/**
 * Generates a time-based token using HMAC-SHA256 (Web Crypto API).
 * @param secret The session UUID serving as the secret key.
 * @param intervalSeconds The refresh interval in seconds (default: 5).
 */
export async function generateToken(secret: string, intervalSeconds: number = 5): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(now / intervalSeconds);
    const data = new TextEncoder().encode(timeStep.toString());
    const keyData = new TextEncoder().encode(secret);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, data);

    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex.substring(0, 8); // Short hash
}
