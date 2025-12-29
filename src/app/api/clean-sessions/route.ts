import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await query(`DELETE FROM attendance_sessions;`); // Wipe bad sessions
        return NextResponse.json({ success: true, message: "Cleared invalid active sessions" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
