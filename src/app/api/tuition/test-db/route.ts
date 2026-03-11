import { NextResponse } from 'next/server';
import pool from '@/lib/db-tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await pool.query('SELECT 1 as test');
        return NextResponse.json({
            success: true,
            message: "Connected cleanly!",
            env: {
                hasNonPooling: !!process.env.SUPABASE_POSTGRES_URL_NON_POOLING,
                hasStandardUrl: !!process.env.SUPABASE_DATABASE_URL,
                hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            },
            data: res.rows
        });
    } catch (error: any) {
        console.error("Test DB Error: ", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            env: {
                hasNonPooling: !!process.env.SUPABASE_POSTGRES_URL_NON_POOLING,
                hasStandardUrl: !!process.env.SUPABASE_DATABASE_URL,
            }
        }, { status: 500 });
    }
}
