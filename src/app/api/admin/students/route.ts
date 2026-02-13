import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const course = searchParams.get('course');
        const section = searchParams.get('section');

        let queryText = `
      SELECT s.id, s.enrollment_no, s.erp_id, s.course_year, s.section, u.full_name, u.email 
      FROM students s
      JOIN users u ON s.user_id = u.id
    `;

        const params: any[] = [];
        const conditions: string[] = [];

        if (course) {
            conditions.push(`s.course_year = $${params.length + 1}`);
            params.push(course);
        }
        if (section) {
            conditions.push(`s.section = $${params.length + 1}`);
            params.push(section);
        }

        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
        }

        queryText += ` ORDER BY s.enrollment_no`;

        const res = await query(queryText, params);
        return NextResponse.json({ students: res.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Cast session to any to check role safely
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Destructure course_year and section from body
        const { full_name, email, enrollment_no, erp_id, course_year, section } = await request.json();

        if (!course_year || !section) {
            return NextResponse.json({ error: 'Course Year and Section are required' }, { status: 400 });
        }

        const defaultPassword = "student";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10); // Hashing the password

        // Simplification: In real app, transaction needed
        // 1. Create User
        let userId;
        try {
            const res = await query(
                `INSERT INTO users (full_name, email, password_hash, role, must_change_password) VALUES ($1, $2, $3, 'student', TRUE) RETURNING id`,
                [full_name, email, hashedPassword]
            );
            userId = res.rows[0].id;
        } catch (e: any) {
            // Error 42703: column does not exist
            if (e.code === '42703' || e.message.includes('must_change_password')) {
                console.log("Applying missing schema migration...");
                await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE');
                // Retry insert
                const res = await query(
                    `INSERT INTO users (full_name, email, password_hash, role, must_change_password) VALUES ($1, $2, $3, 'student', TRUE) RETURNING id`,
                    [full_name, email, hashedPassword]
                );
                userId = res.rows[0].id;
            } else {
                throw e;
            }
        }

        // 2. Create Student Profile
        await query(`
      INSERT INTO students (user_id, enrollment_no, erp_id, course_year, section)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, enrollment_no, erp_id, course_year, section]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
