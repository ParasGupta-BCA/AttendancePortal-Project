import crypto from 'crypto';

/**
 * Validates a time-based token against a secret.
 * @param secret The session UUID serving as the secret key.
 * @param token The token received from the client.
 * @param intervalSeconds The refresh interval in seconds (default: 5).
 * @param window The number of intervals to check before/after (default: 1).
 *               1 means we check current, previous, and next interval (±1 * interval).
 *               This accounts for slight clock drifts and network latency.
 */
export function validateToken(secret: string, token: string, intervalSeconds: number = 5, window: number = 1): boolean {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(now / intervalSeconds);

    for (let i = -window; i <= window; i++) {
        const stepToCheck = timeStep + i;
        const expectedToken = generateHmac(secret, stepToCheck);
        if (expectedToken === token) {
            return true;
        }
    }
    return false;
}

function generateHmac(secret: string, timeStep: number): string {
    // We use the timeStep as the message
    const data = timeStep.toString();
    return crypto.createHmac('sha256', secret).update(data).digest('hex').substring(0, 8); // Short hash for QR readability
}
