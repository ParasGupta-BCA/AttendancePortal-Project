import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await query(`
      SELECT f.id, f.designation, f.department, u.full_name, u.email 
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      ORDER BY u.full_name
    `);
        return NextResponse.json({ faculty: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
