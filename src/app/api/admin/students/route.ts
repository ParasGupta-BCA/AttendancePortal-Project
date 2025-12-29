import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await query(`
      SELECT s.id, s.enrollment_no, s.erp_id, s.course_year, s.section, u.full_name, u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.enrollment_no
    `);
        return NextResponse.json({ students: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { full_name, email, password, enrollment_no, erp_id } = await request.json();

        // Simplification: In real app, transaction needed
        // 1. Create User
        const userRes = await query(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, 'student')
      RETURNING id
    `, [email, password, full_name]);
        const userId = userRes.rows[0].id;

        // 2. Create Student Profile
        await query(`
      INSERT INTO students (user_id, enrollment_no, erp_id, course_year, section)
      VALUES ($1, $2, $3, 'BCA VI', 'Morning')
    `, [userId, enrollment_no, erp_id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
