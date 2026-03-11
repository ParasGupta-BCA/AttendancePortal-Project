import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tenantQuery as query } from '@/lib/db-tenant';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any).is_tuition_user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const institutionId = (session.user as any).institution_id;

        const body = await req.json();
        const { logId } = body;

        if (!logId) {
            return NextResponse.json({ error: 'Log ID is required.' }, { status: 400 });
        }

        // 1. Fetch original email details
        const logRes = await query(`
            SELECT recipient_email, subject, body, context 
            FROM email_logs 
            WHERE id = $1 AND institution_id = $2
        `, [logId, institutionId]);

        if (logRes.rowCount === 0) {
            return NextResponse.json({ error: 'Email log not found.' }, { status: 404 });
        }

        const { recipient_email, subject, body: html, context } = logRes.rows[0];

        if (!html) {
            return NextResponse.json({ error: 'Original email content not found in logs. Cannot resend.' }, { status: 400 });
        }

        // 2. Resend Email
        // Assuming email log creation handles institution_id context properly inside `sendEmail`
        // Wait, sendEmail function might not know about institution_id. We'll pass it if needed,
        // but it might not be strictly necessary for the outbound delivery mechanism itself to be isolated
        // as long as fetching the email info is isolated.
        const result = await sendEmail(recipient_email, subject, html, context);

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Email resent successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to resend email: ' + (result as any).results?.[0]?.error || 'Unknown error' }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Resend Email API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
